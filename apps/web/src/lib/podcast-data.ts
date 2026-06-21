export type PodcastEpisode = {
  id: string;
  title: string;
  description: string;
  topic: string;
  duration: string;
  publishedAt: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
};

export const podcastEpisodes: PodcastEpisode[] = [
  {
    id: "derecho-ia-finanzas",
    title: "IA, derecho y decisiones financieras",
    description:
      "Una conversación introductoria sobre automatización, responsabilidad profesional y lectura crítica de datos en servicios financieros.",
    topic: "Tecnología",
    duration: "38 min",
    publishedAt: "Próximamente"
  },
  {
    id: "cripto-regulacion-latam",
    title: "Cripto regulación en Latinoamérica: señales para 2026",
    description:
      "Qué deben observar abogados, fundadores y equipos financieros cuando la regulación local todavía está en construcción.",
    topic: "Derecho",
    duration: "42 min",
    publishedAt: "Próximamente"
  },
  {
    id: "finanzas-para-abogados",
    title: "Finanzas para abogados: riesgo, caja y productos digitales",
    description:
      "Conceptos financieros que ayudan a evaluar modelos de negocio tecnológicos sin perder precisión jurídica.",
    topic: "Finanzas",
    duration: "35 min",
    publishedAt: "Próximamente"
  }
];
