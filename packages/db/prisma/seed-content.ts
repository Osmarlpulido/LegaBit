/**
 * Seed inicial del contenido estático de Legabit.
 * Idempotente: usa skipDuplicates / createMany para no romper en re-ejecuciones.
 *
 * Uso: ts-node packages/db/prisma/seed-content.ts
 * (o mediante: BOOTSTRAP_SUPER_ADMIN_EMAIL=... yarn workspace @legabit/db seed)
 */
import { EventFormat, EventStatus, EventTrack, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Blog posts ───────────────────────────────────────────────────────────
  await prisma.blogPost.createMany({
    skipDuplicates: true,
    data: [
      {
        slug: "regulacion-tecnologia-finanzas",
        tag: "Análisis",
        title: "Regulación, tecnología y finanzas: cómo leer una agenda que cambia rápido",
        excerpt: "Un marco práctico para seguir cambios normativos sin perder de vista producto, riesgo y estrategia.",
        readingTime: "7 min",
        author: "Equipo Legabit",
        publishedAt: null,
        content: `## Por qué unir las tres conversaciones

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

La lectura útil no consiste en perseguir cada noticia, sino en construir criterio para saber qué merece atención, qué puede esperar y qué exige asesoría especializada.`
      },
      {
        slug: "ia-practica-legal",
        tag: "Tecnología",
        title: "IA en la práctica legal: productividad sin renunciar al criterio profesional",
        excerpt: "Cómo incorporar herramientas de automatización en equipos jurídicos manteniendo supervisión, confidencialidad y trazabilidad.",
        readingTime: "6 min",
        author: "Equipo Legabit",
        publishedAt: null,
        content: `## El punto de partida

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

La adopción responsable no empieza por comprar software, sino por diseñar un proceso donde la herramienta tenga un rol claro y limitado.`
      },
      {
        slug: "finanzas-para-decisiones-legales",
        tag: "Finanzas",
        title: "Finanzas para decisiones legales: lo mínimo que un equipo jurídico debe mirar",
        excerpt: "Conceptos de caja, riesgo, incentivos y sostenibilidad que ayudan a evaluar productos digitales y acuerdos comerciales.",
        readingTime: "8 min",
        author: "Equipo Legabit",
        publishedAt: null,
        content: `## La dimensión financiera del riesgo legal

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

El criterio financiero permite detectar tensiones temprano y conversar mejor con fundadores, directores financieros y áreas de producto.`
      },
      {
        slug: "compliance-productos-digitales",
        tag: "Compliance",
        title: "Compliance en productos digitales: del checklist al sistema operativo",
        excerpt: "Una forma de pasar de controles aislados a procesos vivos para equipos que lanzan, miden y ajustan productos.",
        readingTime: "7 min",
        author: "Equipo Legabit",
        publishedAt: null,
        content: `## El problema del checklist

Un checklist ayuda a no olvidar pasos, pero no reemplaza un sistema. En productos digitales, las reglas cambian con cada iteración: onboarding, pagos, datos, comunicación comercial y soporte al usuario.

## Elementos de un sistema

1. Dueños claros por proceso.
2. Registro de decisiones y fuentes usadas.
3. Revisión legal antes de cambios sensibles.
4. Indicadores de incidentes, quejas y fricción.
5. Capacitación breve para equipos no jurídicos.

## Resultado esperado

El cumplimiento funciona mejor cuando está integrado al ciclo de producto. No debe aparecer solo al final, cuando corregir es más costoso y políticamente más difícil.`
      },
      {
        slug: "educacion-comunidad-profesional",
        tag: "Comunidad",
        title: "Educación y comunidad profesional: por qué aprender solo no escala",
        excerpt: "La combinación de artículos, cursos, eventos y conversación permite convertir información dispersa en criterio compartido.",
        readingTime: "5 min",
        author: "Equipo Legabit",
        publishedAt: null,
        content: `## Aprender con otros

Los temas emergentes cambian rápido. Aprender en comunidad permite contrastar dudas, compartir fuentes y convertir experiencia individual en conocimiento reutilizable.

## Formatos complementarios

- Artículos para ordenar ideas y dejar una referencia escrita
- Podcasts para abrir conversaciones y escuchar distintos perfiles
- Cursos para practicar con estructura y acompañamiento
- Eventos para conectar personas, preguntas y oportunidades

## Cierre

Legabit existe para conectar esos formatos en un solo ecosistema, con foco en utilidad profesional y lenguaje claro.`
      }
    ]
  });
  console.log("✓ BlogPosts sembrados");

  // ─── Cursos + Lecciones ───────────────────────────────────────────────────
  const coursesData = [
    {
      slug: "derecho-tecnologia-finanzas",
      tag: "Ruta base",
      title: "Derecho, tecnología y finanzas: fundamentos para decidir",
      excerpt: "Una ruta introductoria para entender modelos digitales, riesgos legales y criterios financieros sin jerga innecesaria.",
      level: "Básico",
      duration: "1h 50min",
      lessons: [
        { order: 0, title: "Mapa del ecosistema: actores, incentivos y obligaciones", durationMin: 22, videoEmbedSrc: "https://www.youtube.com/embed/aqz-KE-bpKQ", brief: "Panorama de empresas, usuarios, reguladores, proveedores tecnológicos y equipos financieros que participan en productos digitales.", cta: "Identifica tres actores clave de un producto digital que conozcas y escribe qué riesgo asume cada uno." },
        { order: 1, title: "Riesgo legal y riesgo financiero no son conversaciones separadas", durationMin: 28, brief: "Cómo una promesa comercial, un flujo de caja o una comisión puede cambiar la lectura jurídica de un proyecto.", project: "Prepara una matriz simple con riesgo legal, riesgo financiero y evidencia requerida para una iniciativa digital." },
        { order: 2, title: "Tecnología aplicada: datos, automatización e infraestructura", durationMin: 26, brief: "Conceptos técnicos mínimos para hacer mejores preguntas sin convertirse en desarrollador.", cta: "Redacta cinco preguntas para una reunión con producto o tecnología." },
        { order: 3, title: "Taller de cierre: memo ejecutivo de decisión", durationMin: 34, brief: "Estructura de una recomendación breve para dirección, cliente o comité interno.", project: "Entrega un memo de una página con contexto, riesgos, opciones y próximos pasos." }
      ]
    },
    {
      slug: "ia-para-equipos-legales",
      tag: "Taller",
      title: "IA para equipos legales: procesos, límites y supervisión",
      excerpt: "Diseña flujos de trabajo con IA manteniendo confidencialidad, control humano y trazabilidad de decisiones.",
      level: "Intermedio",
      duration: "2h 15min",
      lessons: [
        { order: 0, title: "Casos de uso legales con valor real", durationMin: 24, brief: "Identificación de tareas repetibles, criterios de calidad y puntos donde la automatización sí reduce carga.", cta: "Lista diez tareas del equipo y marca cuáles requieren juicio profesional final." },
        { order: 1, title: "Política interna de uso responsable", durationMin: 35, brief: "Reglas de datos, aprobación, auditoría y comunicación cuando se usan herramientas generativas.", project: "Escribe el primer borrador de una política de IA de una página para tu organización." },
        { order: 2, title: "Medición de impacto y control de errores", durationMin: 30, brief: "Cómo evaluar ahorro de tiempo, calidad de salida y riesgos de dependencia excesiva.", cta: "Define tres métricas para medir un piloto de IA durante cuatro semanas." }
      ]
    },
    {
      slug: "fintech-compliance-producto",
      tag: "Próximo",
      title: "Fintech, compliance y producto: taller aplicado",
      excerpt: "Aprende a revisar productos financieros digitales desde onboarding, datos, pagos y comunicación comercial.",
      level: "Intermedio",
      duration: "2h 40min",
      lessons: [
        { order: 0, title: "Modelo de negocio y obligaciones regulatorias", durationMin: 30, brief: "Lectura inicial de ingresos, usuarios, terceros y flujos de dinero para detectar obligaciones relevantes.", cta: "Resume el modelo de negocio de una fintech en diez líneas." },
        { order: 1, title: "Onboarding, datos y prevención de abuso", durationMin: 38, brief: "Controles mínimos para conocer usuarios, reducir fraude y documentar decisiones sensibles.", project: "Diseña un flujo de onboarding con puntos de control legal, financiero y operativo." },
        { order: 2, title: "Revisión de claims y comunicación al usuario", durationMin: 32, brief: "Cómo revisar promesas de rentabilidad, beneficios, costos, riesgos y soporte en lenguaje claro.", project: "Reescribe una comunicación comercial para que sea clara, precisa y verificable." }
      ]
    }
  ];

  for (const courseData of coursesData) {
    const existing = await prisma.course.findUnique({ where: { slug: courseData.slug } });
    if (existing) {
      console.log(`  → Course "${courseData.slug}" ya existe, omitiendo.`);
      continue;
    }
    const { lessons, ...courseFields } = courseData;
    await prisma.course.create({
      data: { ...courseFields, lessons: { create: lessons } }
    });
    console.log(`  ✓ Course "${courseData.slug}" creado`);
  }
  console.log("✓ Cursos sembrados");

  // ─── Podcast episodes ─────────────────────────────────────────────────────
  await prisma.podcastEpisode.createMany({
    skipDuplicates: true,
    data: [
      { slug: "derecho-ia-finanzas", title: "IA, derecho y decisiones financieras", description: "Una conversación introductoria sobre automatización, responsabilidad profesional y lectura crítica de datos en servicios financieros.", topic: "Tecnología", duration: "38 min", publishedAt: null },
      { slug: "cripto-regulacion-latam", title: "Cripto regulación en Latinoamérica: señales para 2026", description: "Qué deben observar abogados, fundadores y equipos financieros cuando la regulación local todavía está en construcción.", topic: "Derecho", duration: "42 min", publishedAt: null },
      { slug: "finanzas-para-abogados", title: "Finanzas para abogados: riesgo, caja y productos digitales", description: "Conceptos financieros que ayudan a evaluar modelos de negocio tecnológicos sin perder precisión jurídica.", topic: "Finanzas", duration: "35 min", publishedAt: null }
    ]
  });
  console.log("✓ Podcast episodes sembrados");

  // ─── Eventos ──────────────────────────────────────────────────────────────
  await prisma.legabitEvent.createMany({
    skipDuplicates: true,
    data: [
      { slug: "enero-panorama-regulatorio", title: "Panorama regulatorio tech-finance 2026", description: "Sesión de apertura para revisar tendencias legales y financieras que marcarán la agenda del año.", eventDate: new Date("2026-01-30T18:00:00-05:00"), eventTime: "18:00", format: EventFormat.VIRTUAL, location: "Online", track: EventTrack.DERECHO, status: EventStatus.PAST },
      { slug: "abril-taller-fintech", title: "Taller: modelos fintech y debida diligencia", description: "Ejercicio práctico para evaluar riesgos de producto, onboarding y documentación mínima.", eventDate: new Date("2026-04-17T09:00:00-05:00"), eventTime: "09:00", format: EventFormat.HIBRIDO, location: "Bogotá + online", track: EventTrack.FINANZAS, status: EventStatus.PAST },
      { slug: "julio-podcast-live", title: "Podcast live: tecnología aplicada a la práctica legal", description: "Grabación abierta con preguntas de la comunidad sobre automatización, evidencia digital y productividad jurídica.", eventDate: new Date("2026-07-09T19:00:00-05:00"), eventTime: "19:00", format: EventFormat.VIRTUAL, location: "YouTube Live", track: EventTrack.TECNOLOGIA, status: EventStatus.UPCOMING },
      { slug: "septiembre-comunidad", title: "Encuentro Legabit: derecho, tecnología y finanzas", description: "Espacio presencial para conectar profesionales, tutores y proyectos que cruzan regulación, producto y capital.", eventDate: new Date("2026-09-24T17:30:00-05:00"), eventTime: "17:30", format: EventFormat.PRESENCIAL, location: "Bogotá", track: EventTrack.COMUNIDAD, status: EventStatus.UPCOMING },
      { slug: "noviembre-cierre", title: "Cierre anual: agenda legal y financiera 2027", description: "Balance de aprendizajes del año y priorización de temas para artículos, cursos y eventos del siguiente ciclo.", eventDate: new Date("2026-11-19T18:30:00-05:00"), eventTime: "18:30", format: EventFormat.VIRTUAL, location: "Online", track: EventTrack.COMUNIDAD, status: EventStatus.UPCOMING }
    ]
  });
  console.log("✓ Eventos sembrados");

  console.log("\n✅ Seed de contenido completado.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
