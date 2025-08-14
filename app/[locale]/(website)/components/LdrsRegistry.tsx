'use client';

import { useEffect } from 'react';

export default function LdrsRegistry() {
  useEffect(() => {
    // 动态导入，避免在 SSR 环境引用 DOM 相关 API
    import('ldrs')
      .then(({ mirage }) => {
        try {
          mirage.register();
        } catch {}
      })
      .catch(() => {});
  }, []);
  return null;
}

