-- AquaCheck · el equipo puede crear hogares nuevos desde el panel
-- La clave del QR se genera en el navegador del equipo: se guarda su hash en hogares (lo que valida la función `hogar`)
-- y la clave en claro en claves_qr (solo legible por el equipo) para imprimir la ficha.
-- hogares ya permitía insert/select/update al rol 'equipo' (0001); aquí se agrega insert en claves_qr.
grant insert on public.claves_qr to authenticated;
create policy claves_qr_equipo_insert on public.claves_qr for insert to authenticated with check (public.es_equipo());
