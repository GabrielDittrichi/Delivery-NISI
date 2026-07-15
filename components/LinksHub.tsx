'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import type { Restaurant } from '@/lib/db';
import { trackPixelAndCapi } from '@/lib/track-unified';
import { generateEventId } from '@/lib/event-id';

type LinkItem = {
  id: string;
  label: string;
  href: string;
  imageSrc: string;
  external?: boolean;
};

function trackLinktreeEvent(type: 'linktree_view' | 'linktree_click', metadata: Record<string, unknown>) {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, metadata }),
    keepalive: true,
  }).catch(() => {});
}

export default function LinksHub({
  restaurant,
  links,
}: {
  restaurant: Restaurant;
  links: LinkItem[];
}) {
  useEffect(() => {
    const eventId = generateEventId();
    const metadata = {
      page_type: 'linktree',
      content_name: 'Links NISI',
      content_type: 'link_hub',
    };
    trackLinktreeEvent('linktree_view', metadata);
    trackPixelAndCapi('LinktreeView', metadata, eventId);
  }, []);

  const handleClick = (link: LinkItem) => {
    const eventId = generateEventId();
    const metadata = {
      page_type: 'linktree',
      link_id: link.id,
      link_label: link.label,
      destination_url: link.href,
    };
    trackLinktreeEvent('linktree_click', metadata);
    trackPixelAndCapi('LinktreeClick', metadata, eventId);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(187,247,208,0.48),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f1fbf4_100%)] text-gray-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10 pt-8 sm:justify-center">
        <div className="text-center">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-emerald-50 shadow-[0_16px_38px_rgba(22,128,60,0.18)]">
            {restaurant.logoUrl ? (
              <Image
                src={restaurant.logoUrl}
                alt={`Logo ${restaurant.name}`}
                width={112}
                height={112}
                priority
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-emerald-700">NISI</div>
            )}
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Espaco Vida Saudavel</p>
            <h1 className="mt-1 text-2xl font-bold tracking-normal text-gray-950">{restaurant.name}</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
              Acesse o cardapio digital, fale com o atendimento, entre na comunidade e deixe sua avaliacao.
            </p>
          </div>
        </div>

        <div className="mt-7 flex-1 space-y-3">
            {links.map((link, index) => (
              <a
                key={link.id}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => handleClick(link)}
                aria-label={link.label}
                className="group relative block overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-[0_10px_28px_rgba(22,128,60,0.10)] outline-none transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_45px_rgba(22,128,60,0.20)] focus-visible:ring-4 focus-visible:ring-emerald-200 active:translate-y-0"
              >
                <Image
                  src={link.imageSrc}
                  alt={link.label}
                  width={2011}
                  height={782}
                  priority={index === 0}
                  sizes="(max-width: 640px) calc(100vw - 72px), 400px"
                  className="aspect-[2011/782] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/0 to-white/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/40" />
              </a>
            ))}
        </div>

        <p className="mx-auto mt-5 max-w-sm px-2 text-center text-xs leading-5 text-gray-500">
          Ao acessar estes links, podemos usar cookies e dados de navegacao para melhorar o atendimento e medir campanhas.
        </p>
      </section>
    </main>
  );
}
