-- AquaCheck · fotos de fallas (Supabase Storage)
-- Bucket PRIVADO: solo JPEG y máximo 1 MB. Las familias no tienen acceso directo: la Edge Function `hogar` les entrega
-- un enlace de subida firmado y de un solo uso para ESE archivo. El equipo ve las fotos con enlaces firmados temporales.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-fallas', 'fotos-fallas', false, 1048576, array['image/jpeg'])
on conflict (id) do nothing;

create policy fotos_equipo_select on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos-fallas' and public.es_equipo());

-- Nota: borrar filas de storage.objects con SQL NO borra los archivos. Para eliminar las fotos al terminar el plazo hay que
-- usar la API de Storage o el panel (Storage > fotos-fallas > seleccionar todo > Delete). Ver supabase/README.md.
