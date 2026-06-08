import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingBadge, SectionTitle } from "@/components/marketing/marketing-section";
import { blogPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Blog — Legabit",
  description: "Análisis jurídicos sobre blockchain, Web3 y derecho penal con foco práctico."
};

export default function BlogPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <SectionTitle
          eyebrow="Legabit"
          title="Blog"
          lead="Artículos y análisis para decidir con criterio cuando la tecnología atraviesa el derecho penal y la asesoría estratégica."
        />

        <ul className="grid gap-6 sm:grid-cols-2">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="flex h-full flex-col rounded-2xl border border-border bg-accent/15 p-6 shadow-sm transition-all hover:shadow-md hover:border-legabit-gold/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <MarketingBadge>{post.tag}</MarketingBadge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{post.readingTime}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold leading-snug group-hover:text-legabit-petrol transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 flex items-center gap-1 text-xs font-medium text-legabit-gold">
                    Leer artículo
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </p>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </MarketingShell>
  );
}
