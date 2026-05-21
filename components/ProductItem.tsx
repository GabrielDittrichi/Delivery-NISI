import { Product } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Plus } from 'lucide-react';
import ProductBadges from './ProductBadges';

export default function ProductItem({ product }: { product: Product }) {
    return (
        <Link href={`/product/${product.slug}`} className="block">
            <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 transition-all cursor-pointer group h-full hover:shadow-md hover:-translate-y-[1px] active:translate-y-0" style={{ borderColor: 'var(--border)' }}>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 group-hover:opacity-80 transition-opacity">{product.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                        <ProductBadges product={product} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold" style={{ color: 'var(--brand)' }}>
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105" style={{ backgroundColor: 'var(--brand)' }}>
                            <Plus size={16} />
                        </span>
                    </div>
                </div>
                <div className="w-28 h-24 flex-shrink-0 rounded-md overflow-hidden bg-emerald-50 relative">
                    {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="112px"
                          className="object-cover"
                          unoptimized
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-emerald-700">
                            <Leaf size={28} />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
