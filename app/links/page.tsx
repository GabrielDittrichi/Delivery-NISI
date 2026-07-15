import type { Metadata } from 'next';
import LinksHub from '@/components/LinksHub';
import { getData } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Links | Espaco Vida Saudavel NISI',
  description: 'Links oficiais do Espaco Vida Saudavel NISI.',
};

function onlyDigits(value?: string | null) {
  return (value || '').replace(/\D/g, '');
}

export default async function LinksPage() {
  const data = await getData();
  const whatsappNumber =
    onlyDigits(data.restaurant.whatsapp) ||
    onlyDigits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ||
    '5599999999999';
  const whatsappMessage = 'Oi! Vim pelo link do NISI e quero fazer um pedido.';
  const communityUrl =
    process.env.NEXT_PUBLIC_NISI_COMMUNITY_URL ||
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Oi! Quero entrar na Comunidade NISI.')}`;
  const googleReviewUrl =
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
    'https://www.google.com/search?q=Espaco+Vida+Saudavel+NISI+Av.+Abilio+Machado+1928';

  const links = [
    {
      id: 'digital-menu',
      label: 'Cardapio Digital',
      href: '/',
      imageSrc: '/links/cardapio-digital.png',
    },
    {
      id: 'whatsapp-order',
      label: 'Compre pelo whatsapp',
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
      imageSrc: '/links/compre-whatsapp.png',
      external: true,
    },
    {
      id: 'community',
      label: 'Comunidade NISI',
      href: communityUrl,
      imageSrc: '/links/comunidade-nisi.png',
      external: true,
    },
    {
      id: 'google-review',
      label: 'Avaliar no google',
      href: googleReviewUrl,
      imageSrc: '/links/avaliar-google.png',
      external: true,
    },
  ];

  return <LinksHub restaurant={data.restaurant} links={links} />;
}
