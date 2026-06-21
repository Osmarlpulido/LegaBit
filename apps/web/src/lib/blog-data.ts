export type BlogPost = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  author: string;
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "regulacion-tecnologia-finanzas",
    tag: "Análisis",
    title: "Regulación, tecnología y finanzas: cómo leer una agenda que cambia rápido",
    excerpt:
      "Un marco práctico para seguir cambios normativos sin perder de vista producto, riesgo y estrategia.",
    date: "Próximamente",
    readingTime: "7 min",
    author: "Equipo Legabit",
    content: `
## Por qué unir las tres conversaciones

El derecho, la tecnología y las finanzas ya no avanzan por carriles separados. Una decisión de producto puede activar obligaciones regulatorias, modificar el perfil de riesgo financiero y cambiar la forma en que una organización documenta sus procesos.

## Tres preguntas guía

1. ¿Qué problema económico resuelve el producto?
2. ¿Qué tecnología habilita esa promesa y qué datos procesa?
3. ¿Qué deberes legales aparecen cuando el producto escala?

## Señales para priorizar

- Nuevos flujos de dinero o custodia de activos
- Automatización de decisiones relevantes para usuarios
- Tratamiento intensivo de datos personales o financieros
- Promesas comerciales difíciles de verificar

## Cierre

La lectura útil no consiste en perseguir cada noticia, sino en construir criterio para saber qué merece atención, qué puede esperar y qué exige asesoría especializada.
    `.trim()
  },
  {
    slug: "ia-practica-legal",
    tag: "Tecnología",
    title: "IA en la práctica legal: productividad sin renunciar al criterio profesional",
    excerpt:
      "Cómo incorporar herramientas de automatización en equipos jurídicos manteniendo supervisión, confidencialidad y trazabilidad.",
    date: "Próximamente",
    readingTime: "6 min",
    author: "Equipo Legabit",
    content: `
## El punto de partida

La inteligencia artificial puede ayudar a ordenar información, preparar borradores y acelerar investigación. El riesgo aparece cuando el equipo delega juicio profesional en una salida que no entiende o no puede verificar.

## Usos razonables

- Resumir documentos largos antes de una revisión humana
- Preparar matrices de preguntas para entrevistas o auditorías
- Comparar versiones de contratos y detectar cambios relevantes
- Generar primeros borradores de comunicación interna

## Controles mínimos

1. Definir qué datos nunca se cargan en herramientas externas.
2. Registrar quién revisa y aprueba cada salida.
3. Separar tareas de apoyo de decisiones jurídicas.
4. Medir ahorro real de tiempo y errores detectados.

## Cierre

La adopción responsable no empieza por comprar software, sino por diseñar un proceso donde la herramienta tenga un rol claro y limitado.
    `.trim()
  },
  {
    slug: "finanzas-para-decisiones-legales",
    tag: "Finanzas",
    title: "Finanzas para decisiones legales: lo mínimo que un equipo jurídico debe mirar",
    excerpt:
      "Conceptos de caja, riesgo, incentivos y sostenibilidad que ayudan a evaluar productos digitales y acuerdos comerciales.",
    date: "Próximamente",
    readingTime: "8 min",
    author: "Equipo Legabit",
    content: `
## La dimensión financiera del riesgo legal

Muchos problemas jurídicos se originan en incentivos financieros mal alineados: promesas de rentabilidad, modelos de comisión poco transparentes o estructuras de costos que empujan a asumir riesgos excesivos.

## Indicadores útiles

- Fuente de ingresos y dependencia de un solo canal
- Costos variables cuando el producto escala
- Liquidez disponible frente a obligaciones futuras
- Incentivos de vendedores, afiliados o terceros
- Exposición a cambios de tasa, moneda o mercado

## Cómo usar esta lectura

El objetivo no es convertir al abogado en analista financiero, sino mejorar las preguntas. Un contrato, una política de cumplimiento o una opinión legal cambia cuando el modelo económico no sostiene la promesa comercial.

## Cierre

El criterio financiero permite detectar tensiones temprano y conversar mejor con fundadores, directores financieros y áreas de producto.
    `.trim()
  },
  {
    slug: "compliance-productos-digitales",
    tag: "Compliance",
    title: "Compliance en productos digitales: del checklist al sistema operativo",
    excerpt:
      "Una forma de pasar de controles aislados a procesos vivos para equipos que lanzan, miden y ajustan productos.",
    date: "Próximamente",
    readingTime: "7 min",
    author: "Equipo Legabit",
    content: `
## El problema del checklist

Un checklist ayuda a no olvidar pasos, pero no reemplaza un sistema. En productos digitales, las reglas cambian con cada iteración: onboarding, pagos, datos, comunicación comercial y soporte al usuario.

## Elementos de un sistema

1. Dueños claros por proceso.
2. Registro de decisiones y fuentes usadas.
3. Revisión legal antes de cambios sensibles.
4. Indicadores de incidentes, quejas y fricción.
5. Capacitación breve para equipos no jurídicos.

## Resultado esperado

El cumplimiento funciona mejor cuando está integrado al ciclo de producto. No debe aparecer solo al final, cuando corregir es más costoso y políticamente más difícil.
    `.trim()
  },
  {
    slug: "educacion-comunidad-profesional",
    tag: "Comunidad",
    title: "Educación y comunidad profesional: por qué aprender solo no escala",
    excerpt:
      "La combinación de artículos, cursos, eventos y conversación permite convertir información dispersa en criterio compartido.",
    date: "Próximamente",
    readingTime: "5 min",
    author: "Equipo Legabit",
    content: `
## Aprender con otros

Los temas emergentes cambian rápido. Aprender en comunidad permite contrastar dudas, compartir fuentes y convertir experiencia individual en conocimiento reutilizable.

## Formatos complementarios

- Artículos para ordenar ideas y dejar una referencia escrita
- Podcasts para abrir conversaciones y escuchar distintos perfiles
- Cursos para practicar con estructura y acompañamiento
- Eventos para conectar personas, preguntas y oportunidades

## Cierre

Legabit existe para conectar esos formatos en un solo ecosistema, con foco en utilidad profesional y lenguaje claro.
    `.trim()
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
