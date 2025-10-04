'use client';

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';

export default function CartHeader() {
  const t = useTranslations('ShoppingCart');
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl">{t('shoppingCart')}</h1>
      <Link href="/books" className="text-[#222222]">
        {t('continueShopping')} &rarr;
      </Link>
    </div>
  );
}