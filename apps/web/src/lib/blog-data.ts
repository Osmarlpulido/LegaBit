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
    slug: "criptoactivos-derecho-penal",
    tag: "Análisis",
    title: "Criptoactivos y derecho penal: mapa de riesgos para la asesoría",
    excerpt:
      "Marco práctico para priorizar líneas defensivas y preguntas clave ante clientes institucionales.",
    date: "Próximamente",
    readingTime: "8 min",
    author: "Equipo Legabit",
    content: `
## Introducción

El crecimiento del mercado de criptoactivos ha abierto un nuevo frente para la asesoría jurídica penal. Desde operaciones en exchanges hasta participación en protocolos DeFi, las implicaciones legales son diversas y en constante evolución.

## Marco normativo actual

La regulación de criptoactivos varía significativamente por jurisdicción. En España, el Real Decreto 7/2021 y la posterior regulación MiCA (Markets in Crypto-Assets) establecen el marco para los proveedores de servicios de activos virtuales.

## Riesgos penales más comunes

### 1. Blanqueo de capitales
El uso de mixing services, la fragmentación de transacciones y el uso de monedas de privacidad pueden generar indicios de actividad ilícita.

### 2. Fraude y estafa
Los esquemas Ponzi tokenizados, los rug pulls y los proyectos fraudulentos son frecuentes en el ecosistema.

### 3. Evasión fiscal
La no declaración de ganancias en activos digitales es uno de los delitos fiscales más comunes relacionados con cripto.

## Preguntas clave para la primera reunión

1. ¿Tiene documentación del origen de los fondos invertidos?
2. ¿Usó exchanges KYC o non-KYC?
3. ¿Participó en proyectos DeFi? ¿Tiene registro de transacciones?
4. ¿Recibió rendimientos? ¿Los declaró?

## Conclusión

La asesoría penal en criptoactivos requiere combinar conocimiento jurídico sólido con comprensión técnica del ecosistema blockchain.
    `.trim()
  },
  {
    slug: "trazabilidad-on-chain",
    tag: "Tendencias",
    title: "Trazabilidad on-chain sin perder rigor jurídico",
    excerpt: "Cómo comunicar evidencia digital sin sobrecarga técnica ante jueces y equipos externos.",
    date: "Próximamente",
    readingTime: "6 min",
    author: "Equipo Legabit",
    content: `
## El reto de la evidencia blockchain

Las blockchains son registros inmutables y públicamente verificables. Sin embargo, traducir esta información técnica a argumentos jurídicamente sólidos es un reto específico de esta práctica.

## Herramientas de análisis on-chain

Plataformas como Chainalysis, Elliptic o Crystal Blockchain permiten rastrear flujos de fondos y generar informes forenses. El perito técnico debe conocer estas herramientas.

## Comunicación al tribunal

El error más común es inundar al tribunal con datos técnicos sin contexto. La clave está en:

- Narrar el flujo de fondos en lenguaje procesal
- Usar líneas de tiempo visuales
- Distinguir certezas de inferencias

## Buenas prácticas

1. Solicitar el informe pericial completo con metodología explicada
2. Preparar contrapreguntas técnicas para el perito contrario
3. Verificar independientemente los datos en exploradores como Etherscan
    `.trim()
  },
  {
    slug: "web3-lineas-ingreso-despachos",
    tag: "Estrategia",
    title: "Web3 y nuevas líneas de ingreso para despachos",
    excerpt: "Productos de conocimiento, compliance y educación: qué encaja según tu escala y nicho.",
    date: "Próximamente",
    readingTime: "7 min",
    author: "Equipo Legabit",
    content: `
## El nuevo mercado jurídico Web3

La demanda de servicios jurídicos especializados en blockchain supera ampliamente la oferta actual. Los despachos que se posicionen ahora tendrán ventaja competitiva significativa.

## Líneas de servicio más rentables

### Compliance y AML
Los exchanges, custodios y proveedores de servicios de activos virtuales necesitan estructuras de compliance robustas bajo MiCA y la 6AMLD.

### Estructuración de proyectos
Tokenización de activos reales, emisión de NFTs con valor jurídico, DAOs con estructura legal.

### Formación interna
Las empresas financieras tradicionales necesitan formar a sus equipos en Web3. Un despacho puede ofrecer esto como servicio de alto valor.

## Consideraciones de escala

- **Despacho individual**: formación, consultoría puntual
- **Boutique 5-15 personas**: compliance continuado, estructuración
- **Firma grande**: M&A cripto, tokenización institucional
    `.trim()
  },
  {
    slug: "due-diligence-proyectos-tokenizados",
    tag: "Compliance",
    title: "Due diligence en proyectos tokenizados: checklist mínimo viable",
    excerpt:
      "Documentación, perfiles de riesgo y señales de alerta temprana cuando el cliente acelera sin mapa legal.",
    date: "Próximamente",
    readingTime: "9 min",
    author: "Equipo Legabit",
    content: `
## Por qué la due diligence cripto es diferente

A diferencia de la due diligence corporativa tradicional, en proyectos tokenizados debemos verificar tanto la estructura legal como la técnica y la económica del protocolo.

## Checklist documentación

- [ ] Whitepaper completo y auditable
- [ ] Identidad y antecedentes del equipo fundador
- [ ] Auditoría de smart contracts por firma acreditada
- [ ] Estructura legal de la entidad emisora
- [ ] Tokenomics: distribución, vesting, inflación
- [ ] Roadmap técnico con hitos verificables

## Señales de alerta

🔴 Equipo anónimo sin historial verificable
🔴 Promesas de rendimientos garantizados
🔴 Smart contracts sin auditar
🔴 Presión para invertir rápido ("urgencia artificial")
🔴 Documentación legal vaga o inexistente

## Marco de evaluación de riesgo

Clasificar proyectos en tres niveles: bajo (infraestructura establecida), medio (proyectos en desarrollo con equipo conocido), alto (proyectos nuevos o anónimos).
    `.trim()
  },
  {
    slug: "encadenamiento-probatorio",
    tag: "Litigio",
    title: "Encadenamiento probatorio: qué pedir y qué no asumir del perito técnico",
    excerpt: "Preguntas útiles para cruzar narrativa jurídica con datos sin convertir la audiencia en un hackathon.",
    date: "Próximamente",
    readingTime: "7 min",
    author: "Equipo Legabit",
    content: `
## El perito técnico en blockchain

El perito en casos de criptomonedas cumple una función crucial: traducir datos técnicos a hechos jurídicamente relevantes. Sin embargo, su labor tiene límites que el abogado debe conocer.

## Qué puede y no puede demostrar un análisis blockchain

**Puede demostrar:**
- Que una dirección recibió o envió fondos
- El timestamp de una transacción
- La cadena de custodia de fondos

**No puede demostrar directamente:**
- Quién controla una dirección (sin evidencia complementaria)
- La intención detrás de una transacción
- La identidad del usuario de un exchange

## Preguntas eficaces para el contrainterrogatorio

1. ¿Qué metodología usó para atribuir la dirección al acusado?
2. ¿Verificó independientemente los datos del informe de la plataforma de análisis?
3. ¿Es posible que otra persona controlara esa dirección?

## Buenas prácticas procesales

Solicitar el informe pericial completo con metodología antes del juicio. Contratar perito técnico propio para contradicciones complejas.
    `.trim()
  },
  {
    slug: "formacion-interna-despacho",
    tag: "Educación",
    title: "Formación interna del despacho: ritmos cortos que sí funcionan",
    excerpt: "Sesiones de 45 minutos, casos sintéticos y documentación viva para equipos saturados.",
    date: "Próximamente",
    readingTime: "5 min",
    author: "Equipo Legabit",
    content: `
## El problema de la formación en despachos

Los abogados tienen poco tiempo. Los programas de formación largos y teóricos fracasan. Se necesita un enfoque diferente.

## Metodología de sesiones cortas

### Formato 45/5
45 minutos de contenido práctico + 5 minutos de aplicación inmediata. Una pregunta o caso breve para discutir en equipo.

### Casos sintéticos
Situaciones ficticias pero realistas. El equipo practica la toma de decisiones en condiciones de incertidumbre, similar a las situaciones reales.

### Documentación viva
En lugar de manuales estáticos, mantener una base de conocimiento actualizable en Notion o similar. El equipo contribuye con sus propias notas de casos.

## Implementación práctica

1. Sesión semanal de 45 min (miércoles al mediodía)
2. Rotación de liderazgo: cada socio o senior lidera una sesión al mes
3. Repositorio compartido de casos y decisiones
4. Revisión trimestral del material

## Métricas de éxito

- Tiempo de respuesta a consultas cripto (-30%)
- Confianza del equipo en temas Web3 (encuesta interna)
- Casos nuevos captados en nicho cripto
    `.trim()
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
