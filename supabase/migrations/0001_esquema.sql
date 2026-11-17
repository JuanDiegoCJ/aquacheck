-- AquaCheck · esquema inicial para Supabase (Postgres)
-- Principios (según la guía oficial de Supabase):
--   * Las tablas se crean CERRADAS: RLS activado y sin permisos para anon.
--   * Las familias NO acceden a las tablas: pasan por la Edge Function `hogar`, que valida el código del
--     filtro + la clave secreta del QR y usa la llave secreta SOLO en el servidor.
--   * El equipo entra con Supabase Auth; su rol va en app_metadata (no en user_metadata, que el usuario puede editar).
--   * Nada de funciones SECURITY DEFINER en esquemas expuestos: la de borrado vive en el esquema `privado`.

create table public.hogares (
  codigo            text primary key check (codigo ~ '^AQ-[0-9]{3}$'),
  modelo            text not null default 'Filtro doméstico de 3 etapas (Módulo B)',
  fecha_instalacion date,
  registrado        boolean not null default false,
  secreto_hash      text not null,   -- SHA-256 (hex) de la clave del QR. Jamás se guarda la clave en claro.
  creado_en         timestamptz not null default now()
);

-- El celular va en su propia tabla, separado del historial.
create table public.contactos (
  codigo                 text primary key references public.hogares (codigo) on delete cascade,
  celular                text not null check (celular ~ '^9[0-9]{8}$'),
  consentimiento_version text not null,
  consentimiento_texto   text not null,
  consentimiento_fecha   timestamptz not null default now()
);

create table public.mantenimientos (
  id        uuid primary key default gen_random_uuid(),
  codigo    text not null references public.hogares (codigo) on delete cascade,
  tipo      text not null check (tipo in ('limpieza_filtro', 'cambio_cartucho', 'limpieza_tanque')),
  fecha     date not null,
  creado_en timestamptz not null default now()
);
create index on public.mantenimientos (codigo, fecha desc);

create table public.reportes (
  id        uuid primary key default gen_random_uuid(),
  codigo    text not null references public.hogares (codigo) on delete cascade,
  tipo      text not null check (tipo in ('gotea', 'turbia', 'poca', 'otra')),
  estado    text not null default 'abierta' check (estado in ('abierta', 'resuelta')),
  foto_path text,                    -- ruta en Supabase Storage (bucket privado), opcional
  creado_en timestamptz not null default now()
);
create index on public.reportes (codigo, creado_en desc);

-- Registro de intentos fallidos para limitar adivinanzas de la clave (solo lo usa la Edge Function).
create table public.intentos_acceso (
  id        bigint generated always as identity primary key,
  codigo    text not null,
  creado_en timestamptz not null default now()
);
create index on public.intentos_acceso (codigo, creado_en desc);

-- ---------------------------------------------------------------- Seguridad
alter table public.hogares         enable row level security;
alter table public.contactos       enable row level security;
alter table public.mantenimientos  enable row level security;
alter table public.reportes        enable row level security;
alter table public.intentos_acceso enable row level security;

-- Activar RLS no quita los permisos por defecto: se revocan explícitamente.
revoke all on all tables in schema public from anon, authenticated;

-- ¿El usuario autenticado pertenece al equipo? (rol en app_metadata, asignado desde el panel de Supabase)
create or replace function public.es_equipo()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'rol') = 'equipo', false)
$$;
revoke execute on function public.es_equipo() from public, anon;
grant  execute on function public.es_equipo() to authenticated;

-- El equipo puede leer todo (menos intentos_acceso) y gestionar lo necesario. Una política por operación.
grant select on public.hogares, public.contactos, public.mantenimientos, public.reportes to authenticated;
grant insert, update on public.hogares to authenticated;
grant update on public.reportes to authenticated;
grant delete on public.contactos to authenticated;

create policy hogares_equipo_select        on public.hogares        for select to authenticated using (public.es_equipo());
create policy contactos_equipo_select      on public.contactos      for select to authenticated using (public.es_equipo());
create policy mantenimientos_equipo_select on public.mantenimientos for select to authenticated using (public.es_equipo());
create policy reportes_equipo_select       on public.reportes       for select to authenticated using (public.es_equipo());

create policy hogares_equipo_insert on public.hogares for insert to authenticated with check (public.es_equipo());
create policy hogares_equipo_update on public.hogares for update to authenticated using (public.es_equipo()) with check (public.es_equipo());
create policy reportes_equipo_update on public.reportes for update to authenticated using (public.es_equipo()) with check (public.es_equipo());
create policy contactos_equipo_delete on public.contactos for delete to authenticated using (public.es_equipo());

-- ---------------------------------------------------------------- Plazo de conservación (fin del piloto + 30 días)
-- Esquema NO expuesto por la API: la función SECURITY DEFINER no se puede llamar desde internet.
create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;

create or replace function privado.borrar_vencidos(p_fin_piloto date, p_dias integer default 30)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_date < p_fin_piloto + p_dias then
    return 'Aún no vence el plazo (' || (p_fin_piloto + p_dias) || ').';
  end if;
  delete from public.contactos;                                   -- elimina los celulares y su consentimiento
  update public.hogares set secreto_hash = 'borrado-' || gen_random_uuid()::text;  -- los QR dejan de dar acceso
  update public.reportes set foto_path = null;                    -- (borrar también los archivos en Storage)
  delete from public.intentos_acceso;
  return 'Datos identificables eliminados. El historial queda sin datos que identifiquen al hogar.';
end;
$$;
revoke execute on function privado.borrar_vencidos(date, integer) from public, anon, authenticated;

-- Programación OPCIONAL con pg_cron (no confirmado que esté en el plan gratis; probar primero):
--   create extension if not exists pg_cron;
--   select cron.schedule('borrado-aquacheck', '0 6 * * *', $$select privado.borrar_vencidos(date '2027-01-31')$$);
-- El borrado manual (ejecutar esta función en el editor SQL en la fecha correcta) sigue siendo obligatorio como respaldo.
