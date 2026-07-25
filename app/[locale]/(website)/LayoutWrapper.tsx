'use client';

import { useSelectedLayoutSegments, usePathname, useSearchParams } from 'next/navigation';
import Header from "./components/Header";
import Footer from "./components/Footer";
// import ScrollToTopButton from './components/ScrollToTopButton';
// import { getScrollToTopConfig } from './components/scrollToTopConfig';
import useUserStore from '@/stores/userStore';
import { useEffect, useState } from 'react';
import { captureUtmFromUrl } from '@/utils/utm';
import KickstarterWelcomeModal from './components/KickstarterWelcomeModal';
import LoginModal from './components/LoginModal';
import { Toaster } from 'react-hot-toast';
import TopBanner from '@/app/components/TopBanner';
import TawkScript from '@/app/components/TawkScript';
import { Drawer } from 'antd';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPersonalizePage = segments.includes("books") && segments.includes("create");
  const isPersonalizedProductsPage = segments.includes("personalized-products");
  const isPreviewPage = segments.includes("preview");
  const isSelectBookContentPage = segments.includes("select-book-content");
  const isKickstarterConfigPage = segments.includes("kickstarter-config");
  const isBookDetailPage = segments[0] === 'books' && segments.length === 2;
  const isFathersDayPage = pathname === '/fathers-day' || pathname?.endsWith('/fathers-day');
  const isLoginPage = pathname === '/login' || pathname?.endsWith('/login');
  const isHomePage = pathname === '/' || pathname?.endsWith('/en') || pathname?.endsWith('/fr') || pathname?.endsWith('/zh');

  // 检查是否在嵌入模式（用于抽屉显示）
  const isEmbedMode = searchParams.get('embed') === 'true';

  // 在组件中
  const {
    fetchCurrentUser,
    isLoggedIn,
    checkKickstarterStatus,
    isLoginModalOpen,
    loginModalOptions,
    closeLoginModal,
    previewUnlockSheetSnap,
    setPreviewUnlockSheetSnap,
  } = useUserStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const isPreviewUnlockSheet =
    isLoginModalOpen &&
    loginModalOptions?.loginSource === 'preview_unlock' &&
    isMobileViewport;
  const previewUnlockSheetState = previewUnlockSheetSnap;

  // 获取当前页面的滚动到顶部按钮配置
  // const scrollToTopConfig = getScrollToTopConfig(pathname);

  // 在需要获取用户信息的地方调用
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Capture UTM params and first-touch attribution on first page load
  useEffect(() => {
    captureUtmFromUrl(searchParams);
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobileViewport(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!isPreviewUnlockSheet || previewUnlockSheetState !== 'expanded') return undefined;

    let startY: number | null = null;
    const mask = document.querySelector(
      '.preview-unlock-bottom-sheet-root .ant-drawer-mask',
    ) as HTMLElement | null;
    if (!mask) return undefined;

    const collapseToHeader = () => setPreviewUnlockSheetSnap('header');

    const handleTouchStart = (event: TouchEvent) => {
      startY = event.touches[0]?.clientY ?? null;
    };
    const handleTouchEnd = (event: TouchEvent) => {
      if (startY == null) return;
      const endY = event.changedTouches[0]?.clientY ?? startY;
      const deltaY = endY - startY;
      // Tap or swipe-down on mask: hide mask, keep sheet in header peek
      if (deltaY >= 24 || Math.abs(deltaY) < 12) {
        collapseToHeader();
      }
      startY = null;
    };
    const handleTouchCancel = () => {
      startY = null;
    };
    const handleClick = () => {
      collapseToHeader();
    };

    mask.addEventListener('click', handleClick);
    mask.addEventListener('touchstart', handleTouchStart, { passive: true });
    mask.addEventListener('touchend', handleTouchEnd, { passive: true });
    mask.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    return () => {
      mask.removeEventListener('click', handleClick);
      mask.removeEventListener('touchstart', handleTouchStart);
      mask.removeEventListener('touchend', handleTouchEnd);
      mask.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [isPreviewUnlockSheet, previewUnlockSheetState, setPreviewUnlockSheetSnap]);

  // 仅在完整展开（有灰色蒙层）时锁定背景滚动；Header peek 时可继续浏览预览页
  useEffect(() => {
    if (!isLoginModalOpen || isLoginPage) return undefined;
    const shouldLockBackground =
      !isPreviewUnlockSheet || previewUnlockSheetState === 'expanded';
    if (!shouldLockBackground) return undefined;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    const isInsideLoginSheet = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      return Boolean(
        el?.closest('[data-login-modal="true"]') ||
          el?.closest('.preview-unlock-bottom-sheet') ||
          el?.closest('.ant-drawer-content'),
      );
    };

    const preventBackgroundTouchMove = (event: TouchEvent) => {
      if (isInsideLoginSheet(event.target)) return;
      event.preventDefault();
    };

    document.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventBackgroundTouchMove);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, [isLoginModalOpen, isLoginPage, isPreviewUnlockSheet, previewUnlockSheetState]);

  // 登录状态变化后检查Kickstarter套餐
  useEffect(() => {
    if (isLoggedIn) {
      console.log('[KS] isLoggedIn, checking KS status...');
      checkKickstarterStatus();
    }
  }, [isLoggedIn, checkKickstarterStatus]);

  const showTopBanner = !isPreviewPage;
  const showHeader = !(isPersonalizePage || isPreviewPage || isSelectBookContentPage || isPersonalizedProductsPage || isEmbedMode);
  const headerIsWhite = isScrolled || !isFathersDayPage;

  const loginModal = (
    <LoginModal
      useRedirect={false}
      showCloseButton={true}
      title={loginModalOptions?.title ?? 'Continue'}
      description={loginModalOptions?.description ?? 'We’ll email you a secure code to save your order and preview.'}
      footerNote={loginModalOptions?.footerNote}
      sendCodeButtonLabel={loginModalOptions?.sendCodeButtonLabel}
      layout={isPreviewUnlockSheet ? 'bottomSheet' : 'modal'}
      sheetState={previewUnlockSheetState}
      onSheetExpand={() => setPreviewUnlockSheetSnap('expanded')}
      onSheetCollapse={() => setPreviewUnlockSheetSnap('header')}
    />
  );

  return (
    <>
      {(showTopBanner || showHeader) && (
        <div className={`sticky top-0 left-0 right-0 z-[60] transition-colors duration-200 ${
          headerIsWhite ? 'bg-white' : 'bg-transparent'
        }`}>
          {showTopBanner && <TopBanner />}
          {showHeader && <Header headerIsWhite={headerIsWhite} />}
        </div>
      )}
      {children}
      <KickstarterWelcomeModal />
      {isPreviewUnlockSheet ? (
        <Drawer
          open={isLoginModalOpen}
          placement="bottom"
          onClose={() => {
            // Mask click/ESC: hide gray mask and collapse to header peek; keep sheet mounted
            setPreviewUnlockSheetSnap('header');
          }}
          closable={false}
          height="auto"
          destroyOnClose
          mask={previewUnlockSheetState === 'expanded'}
          maskClosable={previewUnlockSheetState === 'expanded'}
          zIndex={1000}
          styles={{
            mask: { background: 'rgba(0, 0, 0, 0.45)', touchAction: 'none' },
            body: {
              padding: 0,
              height: 'auto',
              maxHeight: 'min(90dvh, 90vh)',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
              background: 'transparent',
            },
            content: {
              borderRadius: '16px 16px 0 0',
              overflow: 'hidden',
              height: 'auto',
              background: 'transparent',
            },
            wrapper: {
              height: 'auto',
              maxHeight: 'min(90dvh, 90vh)',
              background: 'transparent',
            },
          }}
          className="preview-unlock-bottom-sheet"
          rootClassName="preview-unlock-bottom-sheet-root"
        >
          {loginModal}
        </Drawer>
      ) : (
        isLoginModalOpen && !isLoginPage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            {loginModal}
          </div>
        )
      )}
      {!(isPersonalizePage || isPreviewPage || isSelectBookContentPage || isPersonalizedProductsPage || isKickstarterConfigPage || isEmbedMode) && <Footer />}
      {isBookDetailPage && !isEmbedMode && <div className="h-[92px] md:hidden" aria-hidden="true" />}
      <TawkScript visible={isHomePage} />
      {/* {scrollToTopConfig.enabled && (
        <ScrollToTopButton
          threshold={scrollToTopConfig.threshold}
          position={scrollToTopConfig.position}
          showProgress={scrollToTopConfig.showProgress}
          variant={scrollToTopConfig.variant}
          size={scrollToTopConfig.size}
          className={scrollToTopConfig.className}
        />
      )} */}
      <Toaster
        position="top-center"
        containerStyle={{
          top: '6.25rem',
        }}
        toastOptions={{
          style: {
            background: 'rgba(64, 64, 64, 0.82)',
            color: '#ffffff',
            borderRadius: 0,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
          },
        }}
      />
    </>
  );
}
