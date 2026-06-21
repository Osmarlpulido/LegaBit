export type Lesson = {
  id: string;
  title: string;
  durationMin: number;
  videoEmbedSrc?: string;
  brief: string;
  cta?: string;
  project?: string;
};

export type Course = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  level: string;
  duration: string;
  lessons: Lesson[];
};

const DEMO_EMBED = "https://www.youtube.com/embed/aqz-KE-bpKQ";

export const courses: Course[] = [
  {
    slug: "derecho-tecnologia-finanzas",
    tag: "Ruta base",
    title: "Derecho, tecnología y finanzas: fundamentos para decidir",
    excerpt:
      "Una ruta introductoria para entender modelos digitales, riesgos legales y criterios financieros sin jerga innecesaria.",
    level: "Básico",
    duration: "1h 50min",
    lessons: [
      {
        id: "dtf-1",
        title: "Mapa del ecosistema: actores, incentivos y obligaciones",
        durationMin: 22,
        videoEmbedSrc: DEMO_EMBED,
        brief:
          "Panorama de empresas, usuarios, reguladores, proveedores tecnológicos y equipos financieros que participan en productos digitales.",
        cta: "Identifica tres actores clave de un producto digital que conozcas y escribe qué riesgo asume cada uno."
      },
      {
        id: "dtf-2",
        title: "Riesgo legal y riesgo financiero no son conversaciones separadas",
        durationMin: 28,
        brief:
          "Cómo una promesa comercial, un flujo de caja o una comisión puede cambiar la lectura jurídica de un proyecto.",
        project:
          "Prepara una matriz simple con riesgo legal, riesgo financiero y evidencia requerida para una iniciativa digital."
      },
      {
        id: "dtf-3",
        title: "Tecnología aplicada: datos, automatización e infraestructura",
        durationMin: 26,
        brief:
          "Conceptos técnicos mínimos para hacer mejores preguntas sin convertirse en desarrollador.",
        cta: "Redacta cinco preguntas para una reunión con producto o tecnología."
      },
      {
        id: "dtf-4",
        title: "Taller de cierre: memo ejecutivo de decisión",
        durationMin: 34,
        brief:
          "Estructura de una recomendación breve para dirección, cliente o comité interno.",
        project:
          "Entrega un memo de una página con contexto, riesgos, opciones y próximos pasos."
      }
    ]
  },
  {
    slug: "ia-para-equipos-legales",
    tag: "Taller",
    title: "IA para equipos legales: procesos, límites y supervisión",
    excerpt:
      "Diseña flujos de trabajo con IA manteniendo confidencialidad, control humano y trazabilidad de decisiones.",
    level: "Intermedio",
    duration: "2h 15min",
    lessons: [
      {
        id: "ia-1",
        title: "Casos de uso legales con valor real",
        durationMin: 24,
        brief:
          "Identificación de tareas repetibles, criterios de calidad y puntos donde la automatización sí reduce carga.",
        cta: "Lista diez tareas del equipo y marca cuáles requieren juicio profesional final."
      },
      {
        id: "ia-2",
        title: "Política interna de uso responsable",
        durationMin: 35,
        brief:
          "Reglas de datos, aprobación, auditoría y comunicación cuando se usan herramientas generativas.",
        project:
          "Escribe el primer borrador de una política de IA de una página para tu organización."
      },
      {
        id: "ia-3",
        title: "Medición de impacto y control de errores",
        durationMin: 30,
        brief:
          "Cómo evaluar ahorro de tiempo, calidad de salida y riesgos de dependencia excesiva.",
        cta: "Define tres métricas para medir un piloto de IA durante cuatro semanas."
      }
    ]
  },
  {
    slug: "fintech-compliance-producto",
    tag: "Próximo",
    title: "Fintech, compliance y producto: taller aplicado",
    excerpt:
      "Aprende a revisar productos financieros digitales desde onboarding, datos, pagos y comunicación comercial.",
    level: "Intermedio",
    duration: "2h 40min",
    lessons: [
      {
        id: "fc-1",
        title: "Modelo de negocio y obligaciones regulatorias",
        durationMin: 30,
        brief:
          "Lectura inicial de ingresos, usuarios, terceros y flujos de dinero para detectar obligaciones relevantes.",
        cta: "Resume el modelo de negocio de una fintech en diez líneas."
      },
      {
        id: "fc-2",
        title: "Onboarding, datos y prevención de abuso",
        durationMin: 38,
        brief:
          "Controles mínimos para conocer usuarios, reducir fraude y documentar decisiones sensibles.",
        project:
          "Diseña un flujo de onboarding con puntos de control legal, financiero y operativo."
      },
      {
        id: "fc-3",
        title: "Revisión de claims y comunicación al usuario",
        durationMin: 32,
        brief:
          "Cómo revisar promesas de rentabilidad, beneficios, costos, riesgos y soporte en lenguaje claro.",
        project:
          "Reescribe una comunicación comercial para que sea clara, precisa y verificable."
      }
    ]
  }
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getAllCourseSlugs(): string[] {
  return courses.map((c) => c.slug);
}
