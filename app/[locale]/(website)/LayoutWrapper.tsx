'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const isPersonalizePage = segments.includes("personalize");
  const isPreviewPage = segments.includes("preview");

  return (
    <>
      {!isPersonalizePage && !isPreviewPage && <Header />}
      {children}
      {!isPersonalizePage && !isPreviewPage  && <Footer />}
    </>
  );
} 