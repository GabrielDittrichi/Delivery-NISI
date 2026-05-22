import { getProductBySlug, getData } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/ProductDetails';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const data = await getData();

  if (!product) {
    notFound();
  }

  const { primaryColor } = data.restaurant;
  const relatedProducts = data.products
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id && item.isActive !== false)
    .slice(0, 3);

  return <ProductDetails product={product} primaryColor={primaryColor} relatedProducts={relatedProducts} />;
}
