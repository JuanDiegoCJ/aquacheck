-- Borra los datos de prueba ficticios y deja los hogares sin registrar. EJECUTAR ANTES DEL PILOTO REAL.
-- Solo toca hogares cuyo contacto está marcado 'datos-de-prueba'. No borra fotos: vaciar Storage > fotos-fallas aparte.
delete from mantenimientos where codigo in (select codigo from contactos where consentimiento_version = 'datos-de-prueba');
delete from reportes where codigo in (select codigo from contactos where consentimiento_version = 'datos-de-prueba');
update hogares set registrado = false, fecha_instalacion = null where codigo in (select codigo from contactos where consentimiento_version = 'datos-de-prueba');
delete from contactos where consentimiento_version = 'datos-de-prueba';
delete from intentos_acceso;
