/** Owner-confirmed contact data (docs/PRD-logispack-uiux.md, content deck section 8). */
export const contact = {
  brand: 'LOGISPACK Capital Humano',
  descriptor:
    'Servicios logísticos, maquila y personal especializado para empresas que no pueden detener su operación.',
  whatsappLabel: 'Pida informes por WhatsApp',
  whatsappUrl: 'https://wa.me/525544792696',
  phones: [
    {
      display: '55 44 79 26 96',
      href: 'tel:+525544792696',
      label: 'WhatsApp',
    },
    { display: '54 44 57 58 87', href: 'tel:+525444575887', label: 'Teléfono' },
  ],
  email: 'alfredocervantess@live.com.mx',
  address:
    'Mar del Frío #60, Col. Ciudad Brisa, Alcaldía Naucalpan de Juárez, Estado de México',
  hours: 'Lunes a sábado, 08:00 a 18:00 h',
  legal: '© LOGISPACK. Todos los derechos reservados.',
} as const;
