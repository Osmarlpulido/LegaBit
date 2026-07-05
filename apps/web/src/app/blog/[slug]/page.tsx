import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@legabit/db";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingBadge } from "@/components/marketing/marketing-section";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({ where: { deletedAt: null }, select: { slug: true } });
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, deletedAt: null }, select: { title: true, excerpt: true } });
  if (!post) return {};
  return { title: `${post.title} — Legabit`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, deletedAt: null } });
  if (!post) notFound();

  const paragraphs = post.content.split("\n\n");

  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <nav className="mb-8">
          <Link href="/blog" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-legabit-petrol transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            Volver a Artículos
          </Link>
        </nav>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <MarketingBadge>{post.tag}</MarketingBadge>
            <span className="text-xs text-muted-foreground">
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("es-CO") : "Próximamente"}
            </span>
            {post.readingTime && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{post.readingTime} lectura</span>
              </>
            )}
          </div>

          <h1 className="text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">{post.title}</h1>
          <p className="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>

          <div className="flex items-center gap-2 border-t border-border pt-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-legabit-petrol text-xs font-bold text-legabit-ivory">
              {post.author.charAt(0)}
            </div>
            <span className="text-sm font-medium">{post.author}</span>
          </div>
        </header>

        <div className="prose prose-neutral mt-10 max-w-none">
          {paragraphs.map((block, i) => {
            if (block.startsWith("## ")) {
              return <h2 key={i} className="mt-8 text-xl font-semibold tracking-tight text-legabit-charcoal">{block.replace("## ", "")}</h2>;
            }
            if (block.startsWith("### ")) {
              return <h3 key={i} className="mt-6 text-base font-semibold text-legabit-charcoal">{block.replace("### ", "")}</h3>;
            }
            if (block.startsWith("- ") || block.includes("\n- ")) {
              const items = block.split("\n").filter((l) => l.startsWith("- "));
              return (
                <ul key={i} className="mt-3 space-y-1.5 list-none">
                  {items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-legabit-gold" />
                      {item.replace(/^-\s/, "")}
                    </li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\./.test(block) || block.match(/\n\d+\./)) {
              const items = block.split("\n").filter(Boolean);
              return (
                <ol key={i} className="mt-3 space-y-1.5 list-none">
                  {items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="flex-shrink-0 font-semibold text-legabit-gold">{j + 1}.</span>
                      {item.replace(/^\d+\.\s/, "")}
                    </li>
                  ))}
                </ol>
              );
            }
            return <p key={i} className="mt-4 text-sm leading-relaxed text-muted-foreground">{block}</p>;
          })}
        </div>

        <footer className="mt-14 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            Este artículo es de carácter informativo y no constituye asesoramiento jurídico. Para consultas específicas, contacta con un profesional habilitado.
          </p>
          <Link href="/blog" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-legabit-petrol hover:underline">
            Ver todos los artículos →
          </Link>
        </footer>
      </article>
    </MarketingShell>
  );
}
