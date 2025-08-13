'use client';

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';

export default function CartHeader() {
  const t = useTranslations('ShoppingCart');
  
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">{t('shoppingCart')}</h1>
      <Link href="/picbooks" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
        {t('continueShopping')} &rarr;
      </Link>
    </div>
  );
}