# Manual de marca Logispack (borrador operativo)

Este manual habilita decisiones de diseño e implementación mientras se valida la identidad final. Se basa únicamente en el archivo suministrado `../images/LogoFinal.png`; no sustituye un manual corporativo ni un master vectorial aprobado.

> **Actualización 2026-10-02:** los logotipos vectoriales SVG del sistema de diseño Claude Design (`src/assets/brand/logispack-logo.svg`, `logispack-logo-white.svg`, `logispack-mark.svg`, `logispack-mark-white.svg`) sustituyen al raster PNG como master. Las referencias al raster en este manual quedan como histórico; la paleta oficial vive en `src/styles/tokens.css` (tokens `--logo-*`).

## Uso inmediato

1. Usá el logotipo suministrado como una pieza única; no lo reconstruyas con CSS, tipografías ni iconos.
2. Aplicá el tema web (oliva, único) sólo mediante tokens.
3. Antes de publicar, obtené la aprobación de la persona responsable de marca sobre este manual, los masters y las variantes de uso.

## La marca

La firma horizontal reúne tres elementos inseparables: un símbolo de edificios y paneles geométricos, el wordmark `LOGISPACK` en verde oscuro y la firma `Capital Humano` con reglas laterales.

| Elemento | Función | Regla |
|---|---|---|
| Símbolo | Comunica infraestructura, operación y capital humano. | Conservá sus edificios, paneles y contornos como un solo artefacto. |
| Wordmark | Identificador principal. | No condensar, expandir, inclinar ni cambiar sus proporciones. |
| Firma | Aclara la línea de negocio. | No separarla, reescribirla ni omitirla sin una variante aprobada. |
| Separadores blancos | Dan estructura a los paneles. | Deben conservarse visibles; no reemplazarlos por líneas de otro color. |

## Área de protección y tamaño

Definí `x` como el grosor visible del separador blanco que divide los paneles geométricos del símbolo. Dejá un área libre de al menos `2x` alrededor de toda la firma horizontal, medida desde el píxel visible más externo, sin texto, bordes, fotografías de alto contraste ni otros logos.

Usá la firma completa únicamente cuando `Capital Humano`, incluidas sus reglas laterales, siga siendo legible y el grosor de sus trazos no parezca menor que el separador blanco `x`. Si ese criterio no se cumple, no recortes ni elimines partes: solicitá una variante reducida aprobada por marca.

## Color maestro extraído del raster

Los siguientes valores son **muestras provisionales del PNG rasterizado**, no especificaciones oficiales. Los degradados, compresión y antialiasing cambian los píxeles; validar contra un master vectorial y una paleta oficial antes de declararlos definitivos.

| Rol visible | Muestra raster provisional | Uso de marca |
|---|---:|---|
| Verde profundo del wordmark | `#013412` | Identificador y superficies institucionales de alto énfasis. |
| Verde medio de paneles | `#025624` | Panel geométrico verde; apoyo de identidad. |
| Azul profundo de edificios/paneles | `#0041AF` | Estructura operativa y panel geométrico azul. |
| Azul claro de edificios | `#BFE2FD` | Reflejos/volumen del símbolo, no texto de lectura. |
| Rojo de paneles | `#F90820` | Acento geométrico; no usar como único indicador de estado. |
| Blanco separador | `#FFFFFF` | Separadores, borde protector y versiones sobre fondo oscuro sólo si la marca lo aprueba. |

No crear colores de marca por interpolación, filtros, opacidad ni gradientes nuevos. Los degradados ya integrados en el archivo se conservan dentro del asset; no se reproducen por separado.

## Tema web de trabajo (no reemplaza el color maestro)

El producto tiene aprobado para trabajo de UI el tema oliva: primario `#405329` y secundario `#A3A263`. Esta pareja es una **decisión de interfaz provisional**, separada de las muestras de color del logo: no reemplaza, corrige ni redefine los colores maestros de la marca. Implementarla exclusivamente mediante los tokens descritos en [Design System](./design-system.md).

Decisión 2026-10-01/02: el sitio tiene un **único tema claro** con UI oliva. Se eliminaron los temas `olive`/`logo` y el atributo `data-theme`. Los colores del logo (`--logo-*`) son tokens para momentos de marca únicamente y no un tema seleccionable. Los valores y reglas de contraste viven en [Design System](./design-system.md).

## Fondos y contraste

- Preferir fondo blanco o neutro muy claro para la firma de color original.
- Sobre fotos o fondos complejos, usar un contenedor plano con el área de protección; no aplicar sombra, contorno, glow ni transparencia al logo para forzar legibilidad.
- Sobre verde profundo u otra superficie oscura, usar sólo una variante monocromática blanca entregada/aprobada por marca. La firma raster original no se invierte, recolorea ni mezcla.
- El logo no es texto accesible: acompañar la imagen con texto alternativo `Logispack Capital Humano` y mantener el contraste WCAG 2.2 AA para toda información adyacente, CTAs y controles.

## Tipografía

El wordmark observado es una sans serif geométrica, muy pesada y en mayúsculas; `Capital Humano` es una sans serif inclinada. **No se identificó ni se aprueba una familia tipográfica exacta a partir del raster.** Para interfaz se usan las familias candidatas del Design System hasta la validación de marca; nunca usar una aproximación para recrear el logo.

## Dirección visual

La fotografía e ilustración debe reforzar operación real: logística de última milla, almacén, empaquetado, etiquetado, equipos profesionales y contexto urbano/industrial mexicano. La arquitectura azul y los paneles verde/azul/rojo del símbolo sugieren orden, infraestructura y movimiento controlado. Evitar stock de apretón de manos, conducción insegura, neones futuristas y mapas que prometan rastreo real.

## Usos correctos e incorrectos

| Correcto | Incorrecto |
|---|---|
| Usar el archivo suministrado completo, sin deformarlo. | Estirar, recortar, rotar, inclinar o separar símbolo, wordmark y firma. |
| Respetar `2x` de área de protección. | Colocar texto, iconos u otros logos dentro de esa área. |
| Mantener los colores y degradados embebidos en el asset. | Recolorear a oliva, aplicar filtros, invertir o recrear degradados. |
| Elegir una variante aprobada para fondos oscuros o tamaños reducidos. | Borrar `Capital Humano`, las reglas o los separadores para “hacer que entre”. |
| Usar el tema oliva sólo para la UI. | Presentar `#405329` o `#A3A263` como colores maestros del logotipo. |

## Accesibilidad

- No comunicar una acción, estado o prioridad sólo con verde, azul o rojo.
- Garantizar contraste AA real de texto y controles en cada combinación de tokens; no inferirlo del logo.
- Conservar alternativas textuales para información del mapa, estados y servicios; la animación es decorativa e ilustrativa.
- Proveer foco visible, navegación por teclado y alternativa estática para todo movimiento.

## Gobierno de assets y aprobación

| Requisito | Estado / regla |
|---|---|
| Fuente actual | `../images/LogoFinal.png` es una referencia raster suministrada; conservarla sin sobrescribir. |
| Master requerido | Solicitar SVG, AI/EPS o PDF vectorial, además de variantes aprobadas clara/oscura, horizontal/reducida y favicon. |
| Entregables web | Generar PNG/WebP optimizados sólo desde el master aprobado; definir dimensiones y nombres versionados por canal. |
| Derechos | Confirmar propiedad, licencia y autorización de uso comercial antes de publicación. |
| Cambio | Todo nuevo color, lockup, recorte, animación del logo o uso sobre fondo requiere aprobación de marca. |
| Puerta de salida | La aprobación explícita del stakeholder de marca sobre este borrador y sus assets es obligatoria antes de implementación final o lanzamiento. |

## Checklist de aprobación

- [ ] Se entregó y validó el master vectorial.
- [ ] Se confirmaron los colores maestros y variantes monocromáticas.
- [ ] Se aprobó la tipografía corporativa o su ausencia como restricción.
- [ ] Se aprobaron los usos en fondos, tamaños reducidos y canales digitales.
- [ ] Se aprobó este manual por el stakeholder de marca.
