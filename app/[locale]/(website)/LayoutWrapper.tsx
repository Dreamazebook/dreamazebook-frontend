'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import Header from "./components/Header";
import Footer from "./components/Footer";
import useUserStore from '@/stores/userStore';
import { useEffect } from 'react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const isPersonalizePage = segments.includes("personalize");
  const isPreviewPage = segments.includes("preview");
  const isSelectBookContentPage = segments.includes("select-book-content");

  // 在组件中
  const { fetchCurrentUser } = useUserStore();

  // 在需要获取用户信息的地方调用
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <>
      {!(isPersonalizePage || isPreviewPage || isSelectBookContentPage) && <Header />}
      {children}
      {!(isPersonalizePage || isPreviewPage || isSelectBookContentPage) && <Footer />}
    </>
  );
} 