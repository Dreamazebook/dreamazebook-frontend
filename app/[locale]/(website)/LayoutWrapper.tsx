'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import Header from "./components/Header";
import Footer from "./components/Footer";
import useUserStore from '@/stores/userStore';
import { useEffect } from 'react';
import KickstarterWelcomeModal from './components/KickstarterWelcomeModal';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const isPersonalizePage = segments.includes("personalize");
  const isPersonalizedProductsPage = segments.includes("personalized-products");
  const isPreviewPage = segments.includes("preview");
  const isSelectBookContentPage = segments.includes("select-book-content");
  const isKickstarterConfigPage = segments.includes("kickstarter-config");

  // 在组件中
  const { fetchCurrentUser, isLoggedIn, checkKickstarterStatus } = useUserStore();

  // 在需要获取用户信息的地方调用
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // 登录状态变化后检查Kickstarter套餐
  useEffect(() => {
    if (isLoggedIn) {
      console.log('[KS] isLoggedIn, checking KS status...');
      checkKickstarterStatus();
    }
  }, [isLoggedIn, checkKickstarterStatus]);

  console.log(!(isPersonalizePage || isPreviewPage || isSelectBookContentPage || isPersonalizedProductsPage));

  return (
    <>
      {!(isPersonalizePage || isPreviewPage || isSelectBookContentPage || isPersonalizedProductsPage) && <Header />}
      {children}
      <KickstarterWelcomeModal />
      {!(isPersonalizePage || isPreviewPage || isSelectBookContentPage || isPersonalizedProductsPage || isKickstarterConfigPage) && <Footer />}
    </>
  );
} 