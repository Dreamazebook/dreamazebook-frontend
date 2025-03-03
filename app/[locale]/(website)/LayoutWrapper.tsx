'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const isPersonalizePage = segments.includes("personalize");
  const isPreviewPage = segments.includes("preview");
  const isSelectBookContentPage = segments.includes("select-book-content");

  return (
    <>
      {!(isPersonalizePage || isPreviewPage || isSelectBookContentPage) && <Header />}
      {children}
      {!(isPersonalizePage || isPreviewPage || isSelectBookContentPage) && <Footer />}
    </>
  );
} 