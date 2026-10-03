/**
 * Approved copy for the illustrative route map (content deck section 9).
 * Everything here is fictional sample data: no live tracking, real names, IDs,
 * timestamps or ETAs. tests/unit/route-map-copy.test.ts enforces that.
 */
export const routeMapCopy = {
  heading: 'Ruta ilustrativa',
  title: 'Ejemplo ilustrativo',
  disclaimer:
    'Datos ficticios con fines demostrativos. No corresponde a un envío real ni muestra ubicación o estado en vivo.',
  closeLabel: 'Cerrar ejemplo',
  markerLabel:
    'Ejemplo ilustrativo de ruta de reparto. Activar para ver los datos de muestra.',
  textEquivalent:
    'Ilustración de una ruta de reparto de ejemplo. Un paquete sale del centro de distribución, avanza por una ruta programada y llega a su destino. Es una representación ilustrativa: no muestra envíos reales ni seguimiento en vivo.',
  serviceLinkLabel: 'Conozca el Servicio de reparto',
  rows: [
    { label: 'Repartidor', value: 'Carlos (nombre ficticio)' },
    { label: 'Paquete', value: 'Caja mediana (ejemplo)' },
    { label: 'Ruta', value: 'Centro de distribución → Destino' },
  ],
} as const;
