import { Product } from '@/lib/db';
import Link from 'next/link';

export default function ProductItem({ product, primaryColor }: { product: Product, primaryColor: string }) {
    return (
        <Link href={`/product/${product.slug}`} className="block">
            <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 hover:shadow-md transition-shadow cursor-pointer group h-full">
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-gray-600 transition-colors">{product.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                    </div>
                    <div className="mt-2 font-medium text-gray-900">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                    </div>
                </div>
                {product.imageUrl && (
                    <div className="w-28 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 relative">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </Link>
    )
}
