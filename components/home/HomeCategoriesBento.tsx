"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME_FEATURED_AREAS } from "@/lib/homeFeaturedAreas";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";

function bentoClass(index: number): string {
  if (index === 0) {
    return "sm:col-span-2 lg:col-span-2 lg:row-span-2 min-h-[220px] lg:min-h-[340px]";
  }
  return "min-h-[160px] sm:min-h-[150px]";
}

function CategoryCard({
  area,
  index,
}: {
  area: (typeof HOME_FEATURED_AREAS)[number];
  index: number;
}) {
  const isLarge = index === 0;

  return (
    <Link
      href={`/business?area=${encodeURIComponent(area.name)}`}
      className={`group relative isolate block h-full overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5 transition duration-500 hover:-translate-y-1 hover:shadow-soft dark:ring-white/10 ${bentoClass(index)}`}
    >
      <Image
        src={area.image}
        alt=""
        fill
        className="object-cover transition duration-700 group-hover:scale-105"
        sizes={
          isLarge
            ? "(max-width: 1024px) 100vw, 50vw"
            : "(max-width: 1024px) 50vw, 33vw"
        }
        unoptimized
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"
        aria-hidden
      />
      <div
        className={`absolute inset-x-0 bottom-0 ${isLarge ? "p-6 sm:p-7" : "p-4 sm:p-5"}`}
      >
        <p className="text-xs font-medium text-white/75">{area.tagline}</p>
        <p
          className={`mt-1 flex items-center justify-between gap-2 font-bold text-white ${
            isLarge ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
          }`}
        >
          <span>{area.name}</span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition group-hover:bg-primary-500">
            <ArrowRight
              className="h-4 w-4 text-white"
              strokeWidth={2.5}
              aria-hidden
            />
          </span>
        </p>
      </div>
    </Link>
  );
}

export function HomeCategoriesBento() {
  return (
    <AnimateIn as="section" animation="slide-up">
      <HomeSectionHeader
        eyebrow="Kategoriler"
        title="Neye ihtiyacınız var?"
        description="En çok tercih edilen alanlardan birini seçin veya tüm işletmeleri keşfedin."
        href="/business"
        linkLabel="Tüm kategoriler"
      />
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 lg:gap-4">
        {HOME_FEATURED_AREAS.map((area, i) => (
          <AnimateIn
            key={area.name}
            animation="scale-in"
            delay={i * 60}
            className={`h-full ${bentoClass(i)}`}
          >
            <CategoryCard area={area} index={i} />
          </AnimateIn>
        ))}
      </div>
    </AnimateIn>
  );
}
