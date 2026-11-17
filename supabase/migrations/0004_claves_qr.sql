-- AquaCheck · claves de los QR visibles SOLO para el equipo (para reimprimir fichas desde el panel)
-- Decisión del equipo: los miembros del equipo pueden ver el QR de cada hogar. Las claves se guardan en claro en esta tabla,
-- que solo puede leer una cuenta con rol 'equipo'. La Edge Function sigue validando contra el hash (secreto_hash).
-- Si una clave se filtra: cambiarla (nuevo hash en hogares + nueva fila aquí) y reimprimir esa ficha.
create table if not exists public.claves_qr (
  codigo text primary key references public.hogares (codigo) on delete cascade,
  clave  text not null check (length(clave) >= 16)
);
alter table public.claves_qr enable row level security;
revoke all on public.claves_qr from anon, authenticated;
grant select on public.claves_qr to authenticated;
create policy claves_qr_equipo_select on public.claves_qr for select to authenticated using (public.es_equipo());

-- El borrado de fin de piloto también elimina estas claves.
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
  delete from public.contactos;
  delete from public.claves_qr;
  update public.hogares set secreto_hash = 'borrado-' || gen_random_uuid()::text;
  update public.reportes set foto_path = null;
  delete from public.intentos_acceso;
  return 'Datos identificables eliminados. El historial queda sin datos que identifiquen al hogar.';
end;
$$;
revoke execute on function privado.borrar_vencidos(date, integer) from public, anon, authenticated;
