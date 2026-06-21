export type LegabitEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  format: "Virtual" | "Presencial" | "Híbrido";
  location: string;
  track: "Derecho" | "Tecnología" | "Finanzas" | "Comunidad";
  status: "Próximo" | "Pasado";
};

export const events2026: LegabitEvent[] = [
  {
    id: "enero-panorama-regulatorio",
    title: "Panorama regulatorio tech-finance 2026",
    description:
      "Sesión de apertura para revisar tendencias legales y financieras que marcarán la agenda del año.",
    date: "2026-01-30",
    time: "18:00",
    format: "Virtual",
    location: "Online",
    track: "Derecho",
    status: "Pasado"
  },
  {
    id: "abril-taller-fintech",
    title: "Taller: modelos fintech y debida diligencia",
    description:
      "Ejercicio práctico para evaluar riesgos de producto, onboarding y documentación mínima.",
    date: "2026-04-17",
    time: "09:00",
    format: "Híbrido",
    location: "Bogotá + online",
    track: "Finanzas",
    status: "Pasado"
  },
  {
    id: "julio-podcast-live",
    title: "Podcast live: tecnología aplicada a la práctica legal",
    description:
      "Grabación abierta con preguntas de la comunidad sobre automatización, evidencia digital y productividad jurídica.",
    date: "2026-07-09",
    time: "19:00",
    format: "Virtual",
    location: "YouTube Live",
    track: "Tecnología",
    status: "Próximo"
  },
  {
    id: "septiembre-comunidad",
    title: "Encuentro Legabit: derecho, tecnología y finanzas",
    description:
      "Espacio presencial para conectar profesionales, tutores y proyectos que cruzan regulación, producto y capital.",
    date: "2026-09-24",
    time: "17:30",
    format: "Presencial",
    location: "Bogotá",
    track: "Comunidad",
    status: "Próximo"
  },
  {
    id: "noviembre-cierre",
    title: "Cierre anual: agenda legal y financiera 2027",
    description:
      "Balance de aprendizajes del año y priorización de temas para artículos, cursos y eventos del siguiente ciclo.",
    date: "2026-11-19",
    time: "18:30",
    format: "Virtual",
    location: "Online",
    track: "Comunidad",
    status: "Próximo"
  }
];
