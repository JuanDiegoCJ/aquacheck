// Textos de consentimiento y aviso de privacidad, en dos capas:
//   1) una frase corta junto a la casilla del registro;
//   2) un aviso completo ("Leer el aviso completo").
//
// BORRADOR redactado según el deber de informar de la Ley N.° 29733 (art. 18) y de su Reglamento
// (D.S. N.° 016-2024-JUS, art. 6): responsable, finalidad, destinatarios, carácter facultativo,
// plazo de conservación y mecanismo para ejercer derechos (ver docs/reports).
// Los textos entre [corchetes] son decisiones del equipo y se muestran resaltados hasta completarse.
// Conviene que UPAO o un asesor lo revise antes del piloto real. Al cambiar el texto, subir la versión.

export const VERSION_CONSENTIMIENTO = 'borrador-0.7'

export const TEXTO_CASILLA =
  'Autorizo al equipo de AquaCheck el tratamiento de mi número de celular y del código de mi hogar para enviarme ' +
  'recordatorios de mantenimiento del filtro por WhatsApp y registrar su historial. Mi participación es voluntaria y ' +
  'puedo retirar esta autorización en cualquier momento.'

export const AVISO_COMPLETO = [
  {
    titulo: 'Responsable',
    texto: 'Equipo de AquaCheck. Contacto: aquacheck26@gmail.com.',
  },
  {
    titulo: 'Datos y finalidad',
    texto:
      'Código del hogar, modelo del filtro, fecha de instalación e historial de mantenimiento. El número de celular es OPCIONAL: ' +
      'solo se guarda si decides escribirlo para recibir recordatorios. No se solicita DNI, nombre ni dirección.',
  },
  {
    titulo: 'Destinatarios',
    texto:
      'El equipo del proyecto. Los recordatorios se envían por WhatsApp, cuyo proveedor puede tratar el número de celular ' +
      'conforme a sus propias políticas.',
  },
  {
    titulo: 'Plazo de conservación',
    texto:
      'Hasta la finalización del piloto, más 30 días. Vencido este plazo, se eliminan el número de celular y los datos que ' +
      'permitan identificar al hogar. El historial de mantenimiento se conserva sin datos identificables, solo con fines ' +
      'estadísticos del proyecto.',
  },
  {
    titulo: 'Derechos',
    texto:
      'La entrega de los datos es voluntaria. Puede ejercer sus derechos de acceso, rectificación, cancelación y oposición, o ' +
      'retirar su autorización, escribiendo a aquacheck26@gmail.com o respondiendo "BAJA" a un recordatorio.',
  },
  {
    titulo: 'Marco legal',
    texto: 'Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento (D.S. N.° 016-2024-JUS).',
  },
]
