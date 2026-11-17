-- AquaCheck · permisos del rol de servidor (service_role)
-- Al crear el proyecto con "Automatically expose new tables" DESACTIVADO, las tablas nuevas no reciben permisos
-- para ningún rol de la API, tampoco para service_role. La Edge Function `hogar` usa service_role (solo en el servidor),
-- así que necesita estos permisos para leer y escribir. anon y authenticated NO los reciben aquí.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
