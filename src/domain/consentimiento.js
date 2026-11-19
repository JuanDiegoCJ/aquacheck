// Textos de consentimiento y aviso de privacidad, en dos capas:
//   1) una frase corta junto a la casilla del registro;
//   2) un aviso completo ("Leer el aviso completo").
//
// BORRADOR redactado según el deber de informar de la Ley N.° 29733 (art. 18) y de su Reglamento
// (D.S. N.° 016-2024-JUS, art. 6): responsable, finalidad, destinatarios, carácter facultativo,
// plazo de conservación y mecanismo para ejercer derechos (ver docs/reports).
// Los textos entre [corchetes] son decisiones del equipo y se muestran resaltados hasta completarse.
// Conviene que UPAO o un asesor lo revise antes del piloto real. Al cambiar el texto, subir la versión.

export const VERSION_CONSENTIMIENTO = 'borrador-0.8'

export const TEXTO_CASILLA =
  'Autorizo al equipo de AquaCheck el tratamiento de mi número de celular y del código de mi hogar para enviarme ' +
  'recordatorios de mantenimiento del filtro por WhatsApp y registrar su historial. Mi participación es voluntaria y ' +
  'puedo retirar esta autorización en cualquier momento.'

export const AVISO_COMPLETO = [
  {
    titulo: 'Responsable',
    texto: 'Equipo de AquaCheck · aquacheck26@gmail.com',
  },
  {
    titulo: 'Qué guardamos y para qué',
    texto:
      'El código de tu hogar, la fecha de instalación y tu historial de mantenimiento, para llevar tu seguimiento. El celular es opcional: ' +
      'solo si lo escribes, para enviarte recordatorios. No pedimos DNI, nombre ni dirección.',
  },
  {
    titulo: 'Con quién se comparte',
    texto: 'Solo con el equipo del proyecto. Los recordatorios salen por WhatsApp, cuyo proveedor puede tratar tu número según sus propias políticas.',
  },
  {
    titulo: 'Cuánto tiempo',
    texto:
      'Hasta el fin del piloto, más 30 días. Luego borramos el celular y los datos que identifican tu hogar; el historial queda sin datos ' +
      'identificables, solo para estadísticas del proyecto.',
  },
  {
    titulo: 'Tus derechos',
    texto:
      'Dar tus datos es voluntario. Puedes pedir acceso, rectificación, cancelación u oposición, o retirar tu autorización, escribiendo a ' +
      'aquacheck26@gmail.com o respondiendo "BAJA" a un recordatorio.',
  },
  {
    titulo: 'Marco legal',
    texto: 'Ley N.° 29733 de Protección de Datos Personales y su Reglamento (D.S. N.° 016-2024-JUS).',
  },
]
