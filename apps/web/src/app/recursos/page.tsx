import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingBadge, SectionTitle } from "@/components/marketing/marketing-section";

export const metadata: Metadata = {
  title: "Recursos — Legabit",
  description:
    "Glosario jurídico–Web3, plantillas, guías y herramientas externas para la práctica diaria del equipo legal."
};

type ResourceItem = {
  title: string;
  description: string;
  href?: string;
  format: string;
  tag: string;
  external?: boolean;
  available?: boolean;
};

type Category = {
  id: string;
  label: string;
  description: string;
  items: ResourceItem[];
};

const categories: Category[] = [
  {
    id: "plantillas",
    label: "Plantillas y documentos",
    description: "Materiales listos para usar en tu práctica diaria.",
    items: [
      {
        title: "Checklist de debida diligencia",
        description:
          "Lista corta para primera pasada en proyectos tokenizados: documentación, personas, tecnología y señales de alerta.",
        format: "PDF / Notion",
        tag: "Plantilla",
        available: false
      },
      {
        title: "Guía de comunicación a cliente",
        description:
          "Estructuras de email y memo interno cuando hay incidentes, bloqueos o investigaciones con componente on-chain.",
        format: "DOCX",
        tag: "Plantilla",
        available: false
      },
      {
        title: "Plantilla de memo de riesgo penal (borrador)",
        description:
          "Esqueleto para registrar hechos, fuentes de información y líneas defensivas sin adelantar conclusiones.",
        format: "Markdown",
        tag: "Penal",
        available: false
      },
      {
        title: "Casos sintéticos para talleres internos",
        description:
          "Fichas breves listas para debate en equipo: líneas de tiempo, personajes y decisiones bajo presión.",
        format: "Paquete ZIP",
        tag: "Formación",
        available: false
      }
    ]
  },
  {
    id: "referencia",
    label: "Referencias y glosarios",
    description: "Materiales de consulta para entender el ecosistema.",
    items: [
      {
        title: "Glosario jurídico Web3",
        description:
          "Términos técnicos traducidos a lenguaje procesal y contractual: wallets, capas, bridges, stablecoins y más.",
        format: "Web · próximo lanzamiento",
        tag: "Referencia",
        available: false
      },
      {
        title: "Mapa de fuentes y lecturas priorizadas",
        description:
          "Índice curado de papers, informes de supervisores y jurisprudencia seleccionada por tema.",
        format: "Biblioteca en línea",
        tag: "Investigación",
        available: false
      }
    ]
  },
  {
    id: "herramientas",
    label: "Herramientas externas",
    description: "Plataformas y exploradores útiles para la práctica Web3. Verificadas por el equipo Legabit.",
    items: [
      {
        title: "Etherscan",
        description:
          "Explorador de bloques Ethereum. Verifica transacciones, contratos y saldos de cualquier dirección pública.",
        href: "https://etherscan.io",
        format: "Gratuito",
        tag: "Blockchain explorer",
        external: true,
        available: true
      },
      {
        title: "Polygonscan",
        description:
          "Explorador de bloques de la red Polygon (MATIC). Útil para transacciones de bajo coste y NFTs.",
        href: "https://polygonscan.com",
        format: "Gratuito",
        tag: "Blockchain explorer",
        external: true,
        available: true
      },
      {
        title: "CoinGecko",
        description:
          "Datos de mercado de más de 10.000 criptomonedas: precios, volúmenes, histórico y métricas DeFi.",
        href: "https://www.coingecko.com",
        format: "Gratuito / Pro",
        tag: "Market data",
        external: true,
        available: true
      },
      {
        title: "DeFiLlama",
        description:
          "Métricas de protocolos DeFi: TVL, usuarios activos, ingresos por protocolo. La referencia del ecosistema descentralizado.",
        href: "https://defillama.com",
        format: "Gratuito",
        tag: "DeFi analytics",
        external: true,
        available: true
      },
      {
        title: "OECD Crypto Asset Reporting Framework",
        description:
          "Marco normativo internacional de la OCDE para reporte de criptoactivos. Referencia para compliance internacional.",
        href: "https://www.oecd.org/tax/exchange-of-tax-information/crypto-asset-reporting-framework-and-amendment-to-the-common-reporting-standard.htm",
        format: "Documento oficial",
        tag: "Regulación",
        external: true,
        available: true
      },
      {
        title: "ESMA MiCA Resources",
        description:
          "Recursos oficiales de la Autoridad Europea de Valores y Mercados sobre el Reglamento MiCA (Markets in Crypto-Assets).",
        href: "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica",
        format: "Oficial EU",
        tag: "Regulación",
        external: true,
        available: true
      },
      {
        title: "Chainalysis",
        description:
          "Plataforma de análisis forense blockchain. Rastrea flujos de fondos y genera informes para litigio e investigación.",
        href: "https://www.chainalysis.com",
        format: "Enterprise",
        tag: "Forense",
        external: true,
        available: true
      },
      {
        title: "Nansen",
        description:
          "Analytics on-chain con etiquetas de wallets institucionales. Útil para identificar contrapartes en transacciones.",
        href: "https://www.nansen.ai",
        format: "Freemium",
        tag: "On-chain analytics",
        external: true,
        available: true
      }
    ]
  }
];

function ExternalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 flex-shrink-0"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export default function RecursosPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20 space-y-16">
        <SectionTitle
          eyebrow="Hub Legabit"
          title="Recursos"
          lead="Biblioteca curada: plantillas, referencias y herramientas externas verificadas para acompañar tu práctica jurídica en el ecosistema Web3."
        />

        {categories.map((category) => (
          <section key={category.id} aria-labelledby={`cat-${category.id}`}>
            <div className="mb-6">
              <h2
                id={`cat-${category.id}`}
                className="text-xl font-semibold tracking-tight"
              >
                {category.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {category.items.map((item) => {
                const cardContent = (
                  <article
                    className={`flex h-full flex-col rounded-2xl border p-5 shadow-sm transition-all ${
                      item.available && item.href
                        ? "border-border bg-background hover:shadow-md hover:border-legabit-gold/40 cursor-pointer"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <MarketingBadge>{item.tag}</MarketingBadge>
                      <span className="text-xs text-muted-foreground">{item.format}</span>
                      {item.external && (
                        <span className="ml-auto flex items-center gap-1 text-xs font-medium text-legabit-gold">
                          Abrir <ExternalIcon />
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-base font-semibold leading-snug">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    {!item.available && (
                      <p className="mt-3 text-xs font-medium text-muted-foreground">
                        Disponible con el lanzamiento del hub
                      </p>
                    )}
                  </article>
                );

                if (item.href && item.external) {
                  return (
                    <li key={item.title}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        {cardContent}
                      </a>
                    </li>
                  );
                }

                return <li key={item.title}>{cardContent}</li>;
              })}
            </ul>
          </section>
        ))}
      </div>
    </MarketingShell>
  );
}
