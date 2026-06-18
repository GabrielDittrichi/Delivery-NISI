'use client'

import { Product } from '@/lib/db';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  HeartPulse,
  Leaf,
  Minus,
  Plus,
  Play,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { trackProductView } from '@/lib/analytics';
import { trackPixelAndCapi } from '@/lib/track-unified';
import Image from 'next/image';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function productMeta(product: Product) {
  return [
    product.weight > 0 ? { label: 'Peso', value: `${product.weight}g` } : null,
    product.volume > 0 ? { label: 'Volume', value: `${product.volume}ml` } : null,
    product.calories > 0 ? { label: 'Kcal', value: product.calories.toString() } : null,
    product.proteins > 0 ? { label: 'Proteina', value: `${product.proteins}g` } : null,
  ].filter(Boolean) as { label: string; value: string }[];
}

export default function ProductDetails({
  product,
  primaryColor,
  relatedProducts = [],
}: {
  product: Product;
  primaryColor: string;
  relatedProducts?: Product[];
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const mediaItems = useMemo(() => [
    product.videoUrl ? { type: 'video' as const, url: product.videoUrl, label: 'Video do produto' } : null,
    product.imageUrl ? { type: 'image' as const, url: product.imageUrl, label: 'Foto principal' } : null,
    product.galleryImage1 ? { type: 'image' as const, url: product.galleryImage1, label: 'Foto 2' } : null,
    product.galleryImage2 ? { type: 'image' as const, url: product.galleryImage2, label: 'Foto 3' } : null,
    product.galleryImage3 ? { type: 'image' as const, url: product.galleryImage3, label: 'Foto 4' } : null,
  ].filter(Boolean) as { type: 'image' | 'video'; url: string; label: string }[], [product.galleryImage1, product.galleryImage2, product.galleryImage3, product.imageUrl, product.videoUrl]);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState(mediaItems[0]?.url || '');
  const { addToCart } = useCart();
  const router = useRouter();
  const meta = productMeta(product);
  const requiresFlavor = product.flavors.length > 0;

  useEffect(() => {
    const eventId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    trackProductView(product.id, eventId, { clientUserAgent: navigator.userAgent });
    trackPixelAndCapi('ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      currency: 'BRL',
      value: product.price,
    }, eventId);
  }, [product.id, product.name, product.price]);

  useEffect(() => {
    if (!isImageOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsImageOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isImageOpen]);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedFlavor, selectedAddons);
    router.push('/');
  };

  const handleAddonToggle = (addonId: string) => {
    if (product.allowMultipleAddons) {
      setSelectedAddons((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]));
      return;
    }
    setSelectedAddons((prev) => (prev.includes(addonId) ? [] : [addonId]));
  };

  const addonsTotal = selectedAddons.reduce((total, addonId) => {
    const addon = product.addons.find((item) => item.id === addonId);
    return total + (addon?.price || 0);
  }, 0);
  const currentPrice = product.price + addonsTotal;
  const total = currentPrice * quantity;
  const canAdd = !requiresFlavor || Boolean(selectedFlavor);
  const selectedMedia = mediaItems.find((item) => item.url === selectedMediaUrl) || mediaItems[0];

  return (
    <div className="min-h-screen bg-[#f8fbf8] pb-32 text-gray-950">
      <div className="sticky top-0 z-20 border-b border-emerald-100 bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-emerald-50" aria-label="Voltar">
            <ArrowLeft size={22} color={primaryColor} />
          </Link>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Monte seu pedido</p>
            <p className="text-sm font-semibold text-gray-700">Espaco Vida Saudavel NISI</p>
          </div>
          <div className="h-10 w-10" />
        </div>
      </div>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.03fr)_minmax(360px,0.7fr)]">
        <section className="space-y-5">
          <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-emerald-50 sm:aspect-[16/10]">
              {selectedMedia ? (
                selectedMedia.type === 'video' ? (
                  <video
                    key={selectedMedia.url}
                    src={selectedMedia.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    className="h-full w-full object-contain"
                    aria-label={`Video de ${product.name}`}
                  />
                ) : (
                  <button type="button" onClick={() => setIsImageOpen(true)} className="group relative block h-full w-full">
                    <Image
                      src={selectedMedia.url}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-contain"
                     
                    />
                    <span className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-emerald-800 shadow-sm transition-colors group-hover:bg-emerald-50">
                      <ZoomIn size={20} />
                    </span>
                  </button>
                )
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-emerald-700">
                  <Leaf size={54} />
                  <p className="mt-3 text-sm font-semibold">Produto NISI</p>
                </div>
              )}
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                {product.isFeatured && <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white shadow-sm">Destaque</span>}
              </div>
            </div>
            {mediaItems.length > 1 && (
              <div className="grid grid-cols-5 gap-2 border-t border-emerald-100 p-3">
                {mediaItems.map((item) => (
                  <button
                    key={`${item.type}-${item.url}`}
                    type="button"
                    onClick={() => setSelectedMediaUrl(item.url)}
                    className={`relative aspect-square overflow-hidden rounded-lg border bg-emerald-50 transition-colors ${
                      selectedMedia?.url === item.url ? 'border-emerald-700 ring-2 ring-emerald-100' : 'border-emerald-100 hover:border-emerald-400'
                    }`}
                    aria-label={item.label}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video src={`${item.url}#t=0.1`} muted playsInline preload="auto" className="h-full w-full object-cover" aria-hidden="true" />
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-emerald-950/25 text-white">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/22 backdrop-blur">
                            <Play size={18} fill="currentColor" />
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Video</span>
                        </span>
                      </>
                    ) : (
                      <Image src={item.url} alt={item.label} fill sizes="96px" className="object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Cardapio NISI</p>
                <h1 className="mt-1 text-3xl font-bold tracking-normal text-gray-950">{product.name}</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600">{product.description}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 px-4 py-3 text-left sm:text-right">
                <p className="text-xs font-semibold text-emerald-700">A partir de</p>
                <p className="text-2xl font-bold text-emerald-800">{formatCurrency(product.price)}</p>
              </div>
            </div>

            {meta.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {meta.map((item) => (
                  <div key={item.label} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                    <p className="text-xs font-medium text-gray-500">{item.label}</p>
                    <p className="mt-1 text-lg font-bold text-gray-950">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Preparado no NISI', text: 'Pedido montado no atendimento.' },
              { icon: Truck, title: 'Entrega ou retirada', text: 'Voce escolhe no checkout.' },
              { icon: HeartPulse, title: 'Rotina saudavel', text: 'Opcoes leves e proteicas.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
                  <Icon className="text-emerald-700" size={20} />
                  <p className="mt-3 font-semibold text-gray-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Personalize</h2>
                <p className="mt-1 text-sm text-gray-600">Escolha sabores e adicionais disponiveis.</p>
              </div>
              <Sparkles className="text-emerald-700" size={22} />
            </div>

            {product.flavors.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-950">Sabor</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">Obrigatorio</span>
                </div>
                <div className="grid gap-2">
                  {product.flavors.map((flavor) => {
                    const selected = selectedFlavor === flavor.id;
                    return (
                      <button
                        key={flavor.id}
                        type="button"
                        onClick={() => setSelectedFlavor(flavor.id)}
                        className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                          selected ? 'border-emerald-700 bg-emerald-50 text-emerald-950' : 'border-gray-200 bg-white hover:bg-emerald-50'
                        }`}
                      >
                        <span className="font-medium">{flavor.name}</span>
                        {selected && <Check size={18} className="text-emerald-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.addons.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-950">Adicionais</h3>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                    {product.allowMultipleAddons ? 'Multipla escolha' : 'Escolha unica'}
                  </span>
                </div>
                <div className="grid gap-2">
                  {product.addons.map((addon) => {
                    const selected = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => handleAddonToggle(addon.id)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          selected ? 'border-emerald-700 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-emerald-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-gray-950">{addon.name}</span>
                          <span className="text-sm font-bold text-emerald-800">
                            {addon.price > 0 ? `+ ${formatCurrency(addon.price)}` : 'Incluso'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {addon.name.toLowerCase().includes('prote')
                            ? 'Mais proteina no seu pedido.'
                            : addon.name.toLowerCase().includes('fibra')
                              ? 'Apoio para sua rotina de fibras.'
                              : 'Complemento para personalizar sua escolha.'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!canAdd && (
              <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                Escolha um sabor para continuar.
              </p>
            )}
          </section>

          {relatedProducts.length > 0 && (
            <section className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-950">Tambem combina</h2>
              <div className="mt-3 space-y-3">
                {relatedProducts.map((item) => (
                  <Link key={item.id} href={`/product/${item.slug}`} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-emerald-50">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-emerald-700">
                          <Leaf size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-semibold text-gray-950">{item.name}</p>
                      <p className="text-sm font-bold text-emerald-800">{formatCurrency(item.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </main>

      {isImageOpen && selectedMedia?.type === 'image' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setIsImageOpen(false)}>
          <button className="absolute right-4 top-4 rounded-lg p-2 text-white transition-colors hover:bg-white/10" onClick={() => setIsImageOpen(false)} aria-label="Fechar imagem">
            <X size={30} />
          </button>
          <div className="relative h-[88vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Image src={selectedMedia.url} alt={product.name} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-emerald-100 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(15,81,48,0.10)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="flex h-12 items-center rounded-lg border border-emerald-100 bg-white">
            <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-full w-11 items-center justify-center rounded-l-lg text-gray-500 hover:bg-emerald-50" aria-label="Diminuir quantidade">
              <Minus size={18} />
            </button>
            <span className="w-9 text-center font-bold text-gray-950">{quantity}</span>
            <button onClick={() => setQuantity((value) => value + 1)} className="flex h-full w-11 items-center justify-center rounded-r-lg text-emerald-700 hover:bg-emerald-50" aria-label="Aumentar quantidade">
              <Plus size={18} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">Adicionar ao pedido</span>
            <span className="sm:hidden">Adicionar</span>
            <span className="rounded-md bg-white/18 px-2 py-1 text-sm">{formatCurrency(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
