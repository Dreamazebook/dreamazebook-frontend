'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CartItem as CartItemType, Preview } from './types';
import CartSubItem from './CartSubItem';
import DisplayPrice from '../../components/component/DisplayPrice';
import { useRouter } from '@/i18n/routing';
import Button from '@/app/components/Button';
import { useState } from 'react';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const t = useTranslations('ShoppingCart');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="w-24 h-24 rounded-md overflow-hidden mr-4">
            <Image 
              src={item.picbook_cover} 
              alt={item.picbook_name} 
              width={96} 
              height={96} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold">{item.picbook_name}</h3>
            {item.edition && <p className="text-sm text-gray-600 dark:text-gray-400">{item.edition}</p>}
            {item.description && <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>}
            <Button
              tl={t('editBook')}
              className="mt-2 !w-auto"
              isLoading={isLoading}
              handleClick={() => {
                if (!item.preview?.id || !item.preview?.picbook_id) {
                  console.error('No preview id or book id found');
                  return;
                }
                const url = `/personalized-products/${item.preview.picbook_id}/${item.preview.id}/edit`;
                console.log('Navigating to:', url);
                router.push(url);
              }}
            />
          </div>
        </div>
        <DisplayPrice value={item.price} />
      </div>
      
      {item.subItems && item.subItems.map((subItem, index) => (
        <CartSubItem key={index} item={subItem} />
      ))}
    </div>
  );
}