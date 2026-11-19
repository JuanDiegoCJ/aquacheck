-- La función `hogar` (rol service_role) crea hogares nuevos cuando una familia se une sola: necesita guardar su clave en claves_qr.
-- 0004 le quitó los permisos a anon/authenticated sobre esta tabla; aquí se los damos solo a service_role (que nunca va al navegador).
grant select, insert on public.claves_qr to service_role;
