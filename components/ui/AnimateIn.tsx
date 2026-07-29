'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

export type AnimationName =
  | 'fade-in'
  | 'fade-in-slow'
  | 'slide-up'
  | 'slide-down'
  | 'scale-in'
  | 'slide-in-right'
  | 'slide-in-left';

const ANIMATION_CLASS: Record<AnimationName, string> = {
  'fade-in': 'animate-fade-in motion-safe:animate-in',
  'fade-in-slow': 'animate-fade-in-slow motion-safe:animate-in',
  'slide-up': 'animate-slide-up motion-safe:animate-in',
  'slide-down': 'animate-slide-down motion-safe:animate-in',
  'scale-in': 'animate-scale-in motion-safe:animate-in',
  'slide-in-right': 'animate-slide-in-right motion-safe:animate-in',
  'slide-in-left': 'animate-slide-in-left motion-safe:animate-in',
};

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationName;
  /** Gecikme (ms) */
  delay?: number;
  /** true ise sayfa yüklenince hemen oynat (hero vb.) */
  immediate?: boolean;
  /** false ise her görünüme tekrar oynat */
  once?: boolean;
  as?: ElementType;
}

export function AnimateIn({
  children,
  className = '',
  animation = 'slide-up',
  delay = 0,
  immediate = false,
  once = true,
  as: Tag = 'div',
}: AnimateInProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    // Tall sections: trigger as soon as any pixel enters (titles were stuck at opacity-0)
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0, rootMargin: '80px 0px 80px 0px' }
    );
    obs.observe(el);

    // Fallback: never leave content invisible if observer fails
    const fallback = window.setTimeout(() => setVisible(true), 1200);

    return () => {
      obs.disconnect();
      window.clearTimeout(fallback);
    };
  }, [immediate, once]);

  const style: CSSProperties | undefined =
    visible && delay > 0
      ? { animationDelay: `${delay}ms`, animationFillMode: 'both' }
      : undefined;

  return (
    <Tag
      ref={ref as never}
      className={`${visible ? ANIMATION_CLASS[animation] : 'opacity-0'} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
