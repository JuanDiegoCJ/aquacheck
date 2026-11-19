-- AquaCheck · DATOS DE PRUEBA FICTICIOS Y VARIADOS para AQ-001 … AQ-020 (solo para ensayar el panel del equipo).
--
-- Qué hace: deja los 20 hogares con datos distintos y verosímiles (fechas de instalación, historial de
-- mantenimiento con algún olvido, fallas abiertas y resueltas, algunos hogares sin celular y otros sin registrar).
-- Qué NO toca: las claves de los QR (hogares.secreto_hash y claves_qr quedan igual), ni hogares fuera de AQ-001…AQ-020.
-- Es repetible: con el mismo número de setseed sale la misma variante; cámbialo (entre -1 y 1) para otra distinta.
-- Celulares ficticios 900 000 0NN, consentimiento marcado 'datos-de-prueba'.
-- Para dejarlo todo sin registrar de nuevo: seed/borrar_datos_de_prueba.sql.

begin;

select setseed(0.2026);

-- 1) Se limpia solo lo de AQ-001 … AQ-020.
delete from mantenimientos where codigo between 'AQ-001' and 'AQ-020';
delete from reportes       where codigo between 'AQ-001' and 'AQ-020';
delete from contactos      where codigo between 'AQ-001' and 'AQ-020';

-- 2) Plan aleatorio de cada hogar: hace cuántos días se instaló y en qué orden se "mezclan".
create temp table _p on commit drop as
select codigo,
       row_number() over (order by random()) as orden,
       20 + floor(random() * 300)::int       as dias_inst   -- instalado hace entre 20 y 319 días
from hogares
where codigo between 'AQ-001' and 'AQ-020';

alter table _p add column registrado boolean, add column con_celular boolean;
update _p set registrado = orden > 2,      -- 2 hogares quedan sin registrar
              con_celular = orden > 6;     -- 4 hogares registrados no dejaron celular (es opcional)

-- 3) Hogares y contactos.
update hogares h
set registrado = p.registrado,
    fecha_instalacion = case when p.registrado then current_date - p.dias_inst end
from _p p
where p.codigo = h.codigo;

insert into contactos (codigo, celular, consentimiento_version, consentimiento_texto, consentimiento_fecha)
select codigo,
       '9000000' || right(codigo, 2),
       'datos-de-prueba',
       'Datos de prueba ficticios.',
       (current_date - dias_inst)::timestamptz + (floor(random() * 6)::int || ' days')::interval + (8 + floor(random() * 10)::int || ' hours')::interval
from _p
where registrado and con_celular;

-- 4) Mantenimientos.
-- Limpieza del filtro (cada 30 días): la última entre hoy y hace 34 días; antes, más o menos cada 4 semanas, con algún olvido.
insert into mantenimientos (codigo, tipo, fecha)
select p.codigo, 'limpieza_filtro', e.fecha
from _p p
cross join lateral (select least(floor(random() * 35)::int, p.dias_inst) as ultima) u
cross join lateral generate_series(0, 8) k
cross join lateral (
  select current_date - u.ultima - (case when k = 0 then 0 else k * 28 + floor(random() * 9)::int - 4 end) as fecha
) e
where p.registrado
  and e.fecha >= current_date - p.dias_inst
  and (k = 0 or random() > 0.15);

-- Cambio de cartucho (cada 180 días): solo los hogares con unos 190 días o más tienen un cambio registrado (7 de cada 10).
insert into mantenimientos (codigo, tipo, fecha)
select codigo, 'cambio_cartucho', current_date - dias_inst + 168 + floor(random() * 22)::int
from _p
where registrado and dias_inst >= 190 and random() < 0.7;

-- Limpieza del tanque (cada 180 días): la mayoría la tiene registrada en algún momento reciente.
insert into mantenimientos (codigo, tipo, fecha)
select codigo, 'limpieza_tanque', current_date - floor(random() * least(dias_inst, 200))::int
from _p
where registrado and random() < 0.75;

-- 5) Fallas: 11 reportes repartidos al azar entre los hogares registrados (algunos hogares repiten, otros no tienen ninguno).
create temp table _reg on commit drop as
select codigo, row_number() over (order by random()) as n from _p where registrado;

insert into reportes (codigo, tipo, estado, creado_en)
select r.codigo,
       case when x.t < 0.35 then 'gotea' when x.t < 0.60 then 'turbia' when x.t < 0.90 then 'poca' else 'otra' end,
       case when x.e < 0.45 then 'abierta' else 'resuelta' end,
       now() - (x.d || ' days')::interval - (x.h || ' hours')::interval
from (
  select random() as t, random() as e, floor(random() * 30)::int as d, floor(random() * 24)::int as h,
         1 + floor(random() * (select count(*) from _reg))::int as pick
  from generate_series(1, 11)
) x
join _reg r on r.n = x.pick;

commit;

-- 6) Resumen para comprobar (las pantallas del panel muestran lo mismo).
select 'hogares registrados' as dato, count(*)::text as valor from hogares where codigo between 'AQ-001' and 'AQ-020' and registrado
union all select 'hogares sin registrar', count(*)::text from hogares where codigo between 'AQ-001' and 'AQ-020' and not registrado
union all select 'hogares con celular', count(*)::text from contactos where codigo between 'AQ-001' and 'AQ-020'
union all select 'mantenimientos', count(*)::text from mantenimientos where codigo between 'AQ-001' and 'AQ-020'
union all select 'fallas abiertas', count(*)::text from reportes where codigo between 'AQ-001' and 'AQ-020' and estado = 'abierta'
union all select 'fallas resueltas', count(*)::text from reportes where codigo between 'AQ-001' and 'AQ-020' and estado = 'resuelta';
