'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LayoutWrapper from './LayoutWrapper';
import Button from '@/app/components/Button';

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations('NotFound');

  return (
    <LayoutWrapper>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('description')}
        </p>
        <Button
          handleClick={() => router.push('/')}
          className="px-6 py-3 text-lg"
          tl={t('backToHome')}
        />
      </div>
    </LayoutWrapper>
  );
}