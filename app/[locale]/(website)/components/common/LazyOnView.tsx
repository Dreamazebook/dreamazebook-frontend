"use client";
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

type Name =
  | 'TheHeartBehindDreamaze'
  | 'WhatMakesDreamazeDifferent'
  | 'BooksGrid'
  | 'GiftPackagesSection'
  | 'TopPickThisMonth'
  | 'StoriesFromRealFamilies'
  | 'InfiniteScrollLogo'
  | 'LastingMemorial'
  ;

type Props = {
  name: Name;
  placeholder?: React.ReactNode;
  componentProps?: Record<string, any>;
  rootMargin?: string;
};

const loaderMap: Record<Name, () => Promise<any>> = {
  TheHeartBehindDreamaze: () => import('../home/TheHeartBehindDreamaze'),
  WhatMakesDreamazeDifferent: () => import('../home/WhatMakesDreamazeDifferent'),
  BooksGrid: () => import('../books/BooksGrid'),
  GiftPackagesSection: () => import('../books/GiftPackagesSection'),
  TopPickThisMonth: () => import('../home/TopPickThisMonth'),
  StoriesFromRealFamilies: () => import('../home/StoriesFromRealFamilies'),
  InfiniteScrollLogo: () => import('../home/InfiniteScrollLogo'),
  LastingMemorial: () => import('../home/LastingMemorial')
};

export default function LazyOnView({ name, placeholder = null, componentProps = {}, rootMargin = '200px' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [DynComp, setDynComp] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      });
    }, { rootMargin });

    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (visible && !DynComp) {
      const loader = loaderMap[name];
      const C = dynamic(loader, { ssr: false });
      setDynComp(() => C as unknown as React.ComponentType<any>);
    }
  }, [visible, DynComp, name]);

  return (
    <div ref={ref}>
      {DynComp ? React.createElement(DynComp, componentProps) : placeholder}
    </div>
  );
}
