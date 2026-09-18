'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';

export type ScrollAnimation =
  | 'fade-up'
  | 'fade-down'
  | 'fade-in'
  | 'scale-in'
  | 'slide-left'
  | 'slide-right'
  | 'blur-up';

const hiddenStyles: Record<ScrollAnimation, string> = {
  'fade-up': 'translate-y-10 opacity-0',
  'fade-down': '-translate-y-10 opacity-0',
  'fade-in': 'opacity-0',
  'scale-in': 'scale-[0.92] opacity-0',
  'slide-left': '-translate-x-10 opacity-0',
  'slide-right': 'translate-x-10 opacity-0',
  'blur-up': 'translate-y-8 opacity-0 blur-sm',
};

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  animation?: ScrollAnimation;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function AnimateOnScroll({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  once = true,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={clsx(
        'motion-safe:transition-all motion-safe:ease-out',
        visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100 blur-0' : hiddenStyles[animation],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
  animation?: ScrollAnimation;
}

export function StaggerGrid({
  children,
  className,
  staggerMs = 90,
  animation = 'fade-up',
}: StaggerGridProps) {
  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {items.map((child, i) => (
        <AnimateOnScroll key={i} animation={animation} delay={i * staggerMs} duration={600}>
          {child}
        </AnimateOnScroll>
      ))}
    </div>
  );
}
