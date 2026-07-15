'use client'
import { Category } from '@/lib/db';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { trackPixelAndCapi } from '@/lib/track-unified';

export default function CategoryNav({ categories, primaryColor }: { categories: Category[], primaryColor: string }) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id || '');
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id.replace('cat-', ''));
          }
        });
      },
      {
        rootMargin: '-18% 0px -72% 0px',
        threshold: 0.01
      }
    );

    categories.forEach((cat) => {
      const element = document.getElementById(`cat-${cat.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    linkRefs.current[activeId]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeId]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(`cat-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      const category = categories.find((cat) => cat.id === id);
      trackPixelAndCapi('CategoryClick', {
        category_id: id,
        category_name: category?.name,
      });
    }
  };

  return (
    <div className="border-b overflow-x-auto no-scrollbar bg-white">
      <div className="flex items-center gap-6 px-4 max-w-4xl mx-auto h-14">
        {categories.map((cat) => (
            <a
              key={cat.id}
              ref={(node) => {
                linkRefs.current[cat.id] = node;
              }}
              href={`#cat-${cat.id}`}
              onClick={(e) => handleScroll(e, cat.id)}
              className="relative whitespace-nowrap text-sm font-semibold h-full flex items-center justify-center transition-colors cursor-pointer"
              style={{
                  color: activeId === cat.id ? primaryColor : '#6b7280'
              }}
            >
                {cat.name}
                {activeId === cat.id && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: primaryColor }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
            </a>
        ))}
      </div>
    </div>
  );
}
