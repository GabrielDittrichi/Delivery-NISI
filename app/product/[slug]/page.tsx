import { getProductBySlug, getData } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/ProductDetails';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const data = await getData();

  if (!product) {
    notFound();
  }

  const { primaryColor } = data.restaurant;

  return <ProductDetails product={product} primaryColor={primaryColor} />;
}
