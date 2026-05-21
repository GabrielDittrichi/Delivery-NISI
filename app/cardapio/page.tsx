import { getData } from '@/lib/db';
import { Leaf, Sparkles } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function CardapioPage() {
  const { restaurant, categories, products } = await getData();
  const orderedCategories = categories
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      ...category,
      products: products
        .filter((product) => product.categoryId === category.id && product.isActive !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    }))
    .filter((category) => category.products.length > 0);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const productMeta = (product: (typeof products)[number]) => {
    return [
      product.weight > 0 ? `${product.weight}g` : null,
      product.volume > 0 ? `${product.volume}ml` : null,
      product.proteins > 0 ? `${product.proteins}g proteina` : null,
      product.calories > 0 ? `${product.calories} kcal` : null,
    ].filter(Boolean);
  };

  return (
    <main className="min-h-screen bg-[#f8fbf8] text-gray-950">
      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
              <Leaf size={16} />
              Cardapio para consumo no espaco
            </div>
            <h1 className="text-3xl font-bold tracking-normal md:text-4xl">{restaurant.name}</h1>
            <p className="mt-2 max-w-2xl text-gray-600">{restaurant.description}</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            Consulte a equipe para montar seu pedido.
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3">
          {orderedCategories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="whitespace-nowrap rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50"
            >
              {category.name}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        {orderedCategories.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-24">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <span className="text-sm font-medium text-emerald-800">{category.products.length} itens</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {category.products.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
                  <div className="flex gap-4 p-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-emerald-700">
                          <Sparkles size={26} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold leading-snug">{product.name}</h3>
                        <span className="shrink-0 font-bold text-emerald-800">{formatPrice(product.price)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{product.description}</p>

                      {productMeta(product).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {productMeta(product).map((meta) => (
                            <span key={meta} className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                              {meta}
                            </span>
                          ))}
                        </div>
                      )}

                      {product.flavors.length > 0 && (
                        <p className="mt-3 text-xs leading-relaxed text-gray-500">
                          <span className="font-semibold text-gray-700">Sabores:</span>{' '}
                          {product.flavors.map((flavor) => flavor.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
