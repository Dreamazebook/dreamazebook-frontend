'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  var Tawk_API: {
    hideWidget?: () => void;
    showWidget?: () => void;
  } | undefined;
}

const HIDE_STYLE_ID = 'tawk-hide-css';
const HIDE_CSS = `
  iframe[src*="tawk.to"],
  #tawk-bubble-container {
    display: none !important;
  }
`;

export default function TawkScript({ visible = true }: { visible?: boolean }) {
  useEffect(() => {
    if (!visible) {
      if (Tawk_API?.hideWidget) Tawk_API.hideWidget();
    } else {
      if (Tawk_API?.showWidget) Tawk_API.showWidget();
    }
  }, [visible]);

  return (
    <>
      {!visible && <style id={HIDE_STYLE_ID}>{HIDE_CSS}</style>}
      <Script
        id="tawk-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a11c50e5f3e2e1c3435010d/1jpamjgnd';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `,
        }}
      />
    </>
  );
}
