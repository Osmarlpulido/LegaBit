import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingBadge, SectionTitle } from "@/components/marketing/marketing-section";
import { podcastEpisodes } from "@/lib/podcast-data";
import { getSpotifyUrl, getYoutubeUrl } from "@/lib/marketing-env";

export const metadata: Metadata = {
  title: "Podcast — Legabit",
  description:
    "Episodios de Legabit sobre derecho, tecnología y finanzas disponibles en YouTube y Spotify."
};

export default function PodcastPage() {
  const youtubeUrl = getYoutubeUrl();
  const spotifyUrl = getSpotifyUrl();

  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <SectionTitle
          eyebrow="Legabit"
          title="Podcast"
          lead="Conversaciones para entender cómo se cruzan derecho, tecnología y finanzas sin perder criterio profesional."
        />

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border bg-background p-5 text-sm font-semibold transition-colors hover:border-legabit-petrol hover:text-legabit-petrol"
          >
            Ver canal en YouTube
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              Episodios, directos y clips educativos.
            </span>
          </a>
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border bg-background p-5 text-sm font-semibold transition-colors hover:border-legabit-petrol hover:text-legabit-petrol"
          >
            Escuchar en Spotify
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              Audio para seguir los análisis desde cualquier lugar.
            </span>
          </a>
        </div>

        <ul className="grid gap-5">
          {podcastEpisodes.map((episode) => (
            <li key={episode.id}>
              <article className="grid gap-5 rounded-2xl border border-border bg-background p-6 shadow-sm sm:grid-cols-[160px_1fr]">
                <div className="flex min-h-32 flex-col justify-between rounded-xl border border-border bg-muted/25 p-4">
                  <MarketingBadge>{episode.topic}</MarketingBadge>
                  <div className="text-sm text-muted-foreground">
                    <p>{episode.publishedAt}</p>
                    <p>{episode.duration}</p>
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight">{episode.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {episode.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={episode.youtubeUrl ?? youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-legabit-charcoal px-4 py-2 text-sm font-semibold text-legabit-ivory transition-colors hover:bg-legabit-petrol"
                    >
                      YouTube
                    </a>
                    <a
                      href={episode.spotifyUrl ?? spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:border-legabit-petrol hover:text-legabit-petrol"
                    >
                      Spotify
                    </a>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </MarketingShell>
  );
}
