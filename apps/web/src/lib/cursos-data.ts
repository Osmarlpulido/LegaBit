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
    slug: "blockchain-penal-taller",
    tag: "Ruta piloto",
    title: "Blockchain & penal: taller aplicado",
    excerpt:
      "Formación tipo LMS para equipos jurídicos: vídeos por lección, proyectos prácticos y tablero colaborativo.",
    level: "Intermedio",
    duration: "1h 45min",
    lessons: [
      {
        id: "l1",
        title: "Mapa mental: cadena de custodia digital",
        durationMin: 18,
        videoEmbedSrc: DEMO_EMBED,
        brief:
          "Diferencia entre evidencia convencional y huellas on-chain: qué puede probarse, qué reinterpretarse y qué documentar desde el primer contacto con el cliente.",
        cta: "Antes de la siguiente lección, anota tres preguntas que harías en una primera reunión sobre wallets y exchanges."
      },
      {
        id: "l2",
        title: "Perfiles de cliente y umbral de diligencia",
        durationMin: 22,
        brief:
          "Matriz rápida retail vs. institucional vs. proyectos startup: documentación mínima, alertas rojas y cómo escalar sin frenar el negocio.",
        project:
          "Redacta un «memo de una página» para tu despacho con los cinco riesgos prioritarios según tipo de cliente."
      },
      {
        id: "l3",
        title: "Comunicación al tribunal: narrativa sin hype técnico",
        durationMin: 25,
        brief:
          "Cómo traducir grafos y timestamps a argumentos que encajan en oralidad y escritura procesal sin perder precisión.",
        cta: "Elige un caso público resumido y escribe dos párrafos de informe como si fueran para un juez no especializado."
      },
      {
        id: "l4",
        title: "Taller: caso sintético «exchange y congelamiento»",
        durationMin: 40,
        brief:
          "Simulación guiada con líneas de tiempo, órdenes y comunicaciones mock. Enfocado en decisión bajo incertidumbre.",
        project:
          "Entrega la línea defensiva preliminar en formato colaborativo (outline + preguntas abiertas). La comunidad podrá valorar claridad y rigor."
      }
    ]
  },
  {
    slug: "defi-para-abogados",
    tag: "Próximo",
    title: "DeFi para abogados: protocolos, riesgos y regulación",
    excerpt:
      "Comprende cómo funcionan los protocolos descentralizados y su impacto en compliance, litigio y asesoría.",
    level: "Básico-Intermedio",
    duration: "2h 30min",
    lessons: [
      {
        id: "d1",
        title: "¿Qué es DeFi? Conceptos sin código",
        durationMin: 20,
        brief:
          "Exchanges descentralizados, lending, yield farming y stablecoins explicados en términos jurídicamente relevantes.",
        cta: "¿Cuáles son los tres riesgos legales más evidentes en un exchange descentralizado?"
      },
      {
        id: "d2",
        title: "Smart contracts: qué puede y qué no puede hacer el abogado",
        durationMin: 30,
        brief:
          "Naturaleza jurídica de los contratos inteligentes, ejecución automática y sus implicaciones en defensa y compliance.",
        project: "Analiza un contrato DeFi público y enumera sus cláusulas implícitas en lenguaje jurídico."
      },
      {
        id: "d3",
        title: "MiCA y regulación global DeFi",
        durationMin: 35,
        brief:
          "Estado actual de la regulación europea y comparativa con EE.UU. y APAC. Qué está regulado y qué sigue en zona gris.",
        cta: "Redacta un resumen ejecutivo de dos páginas sobre el impacto de MiCA en un protocolo DeFi hipotético."
      }
    ]
  },
  {
    slug: "tokenizacion-activos-reales",
    tag: "Próximo",
    title: "Tokenización de activos reales: estructura jurídica",
    excerpt:
      "Cómo estructurar legalmente la tokenización de inmuebles, deuda y otros activos del mundo real.",
    level: "Avanzado",
    duration: "3h",
    lessons: [
      {
        id: "t1",
        title: "¿Qué es un token de seguridad? Clasificación regulatoria",
        durationMin: 25,
        brief:
          "Test de Howey y equivalentes en Europa. Diferencias entre utility token, security token y payment token.",
        cta: "Clasifica cinco tokens conocidos usando el test de Howey y justifica tu respuesta."
      },
      {
        id: "t2",
        title: "Estructura de una STO: vehículos y jurisdicciones",
        durationMin: 40,
        brief:
          "SPVs, fondos de inversión tokenizados y estructuras híbridas. Elección de jurisdicción y sus implicaciones.",
        project: "Diseña la estructura legal básica para una tokenización de cartera inmobiliaria."
      },
      {
        id: "t3",
        title: "Due diligence y riesgos en tokenización",
        durationMin: 35,
        brief:
          "Checklist de due diligence específica para activos tokenizados: técnica, legal y financiera.",
        cta: "Identifica tres riesgos no cubiertos en la regulación actual."
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
