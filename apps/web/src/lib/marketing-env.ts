const DEFAULT_DISCORD_URL = "https://discord.gg/jtz9dve2";
const DEFAULT_TELEGRAM_URL = "https://t.me/Legabit_org";
const DEFAULT_YOUTUBE_URL = "https://www.youtube.com/@legabitERC-20";
const DEFAULT_SPOTIFY_URL = "https://open.spotify.com/search/Legabit";

function trimUrl(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t && t.length > 0 ? t : undefined;
}

/** Discord: env dedicado, o legacy `NEXT_PUBLIC_LEGABIT_COMMUNITY_URL`, o URL por defecto. */
export function getDiscordUrl(): string {
  return (
    trimUrl(process.env.NEXT_PUBLIC_LEGABIT_DISCORD_URL) ??
    trimUrl(process.env.NEXT_PUBLIC_LEGABIT_COMMUNITY_URL) ??
    DEFAULT_DISCORD_URL
  );
}

export function getTelegramUrl(): string {
  return trimUrl(process.env.NEXT_PUBLIC_LEGABIT_TELEGRAM_URL) ?? DEFAULT_TELEGRAM_URL;
}

export function getYoutubeUrl(): string {
  return trimUrl(process.env.NEXT_PUBLIC_LEGABIT_YOUTUBE_URL) ?? DEFAULT_YOUTUBE_URL;
}

export function getSpotifyUrl(): string {
  return trimUrl(process.env.NEXT_PUBLIC_LEGABIT_SPOTIFY_URL) ?? DEFAULT_SPOTIFY_URL;
}

/** @deprecated Usar `getDiscordUrl`; se mantiene por compatibilidad con código antiguo. */
export function getCommunityUrl(): string {
  return getDiscordUrl();
}
