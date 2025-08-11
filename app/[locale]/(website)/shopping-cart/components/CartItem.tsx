'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CartItem as CartItemType, Preview } from './types';
import CartSubItem from './CartSubItem';
import DisplayPrice from '../../components/component/DisplayPrice';
import { useRouter, usePathname } from 'next/navigation';
import Button from '@/app/components/Button';
import { useState, useEffect } from 'react';
import axios from '@/app/config/axios';

interface CartItemProps {
  item: CartItemType;
}

interface BookParams {
  name?: string;
  gender?: string;
  skin_color?: string;
  photo_url?: string;
}

export default function CartItem({ item }: CartItemProps) {
  const t = useTranslations('ShoppingCart');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [bookParams, setBookParams] = useState<BookParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item.preview) {
      setBookParams({
        name: item.preview.recipient_name || '',
        gender: item.preview.gender,
        skin_color: item.preview.skin_color[0].toString(),
        photo_url: item.preview.face_image
      });
    }
  }, [item.preview]);
  
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
                const url = bookParams ? 
                  `/${locale}/personalize?${new URLSearchParams({
                    book_id: item.id.toString(),
                    ...(bookParams.name && { name: bookParams.name }),
                    ...(bookParams.gender && { gender: bookParams.gender }),
                    ...(bookParams.skin_color && { skin_color: bookParams.skin_color }),
                    ...(bookParams.photo_url && { photo_url: bookParams.photo_url })
                  }).toString()}` : 
                  `/${locale}/personalize?book_id=${item.id}`;
                console.log('Navigating to:', url); // 添加调试日志
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