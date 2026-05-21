import { Leaf, Sparkles, Zap } from 'lucide-react';
import { Product } from '@/lib/db';

export function getProductBadges(product: Product) {
  const badges: { label: string; icon: 'leaf' | 'sparkles' | 'zap' }[] = [];
  const text = `${product.name} ${product.description}`.toLowerCase();

  if (product.proteins > 0) badges.push({ label: `${product.proteins}g proteina`, icon: 'sparkles' });
  if (product.calories > 0) badges.push({ label: `${product.calories} kcal`, icon: 'leaf' });
  if (product.volume > 0) badges.push({ label: `${product.volume}ml`, icon: 'leaf' });
  if (text.includes('cha') || text.includes('chá') || text.includes('energia')) badges.push({ label: 'Energia', icon: 'zap' });
  if (product.flavors.length > 0) badges.push({ label: 'Sabores', icon: 'leaf' });

  return badges.slice(0, 3);
}

export default function ProductBadges({ product }: { product: Product }) {
  const badges = getProductBadges(product);
  if (badges.length === 0) return null;

  const icons = {
    leaf: Leaf,
    sparkles: Sparkles,
    zap: Zap,
  };

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {badges.map((badge) => {
        const Icon = icons[badge.icon];
        return (
          <span
            key={badge.label}
            className="inline-flex items-center gap-1 rounded-full border bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
            style={{ borderColor: 'rgba(15, 81, 48, 0.14)' }}
          >
            <Icon size={11} />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
