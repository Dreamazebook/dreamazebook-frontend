'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CartSubItem as CartSubItemType } from './types';
import DisplayPrice from '../../components/component/DisplayPrice';

interface CartSubItemProps {
  item: CartSubItemType;
}

export default function CartSubItem({ item }: CartSubItemProps) {
  const t = useTranslations('ShoppingCart');
  
  return (
    <div className="flex items-center justify-between py-2 pl-12 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-md overflow-hidden mr-4">
          <Image 
            src={item.image} 
            alt={item.name} 
            width={48} 
            height={48} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-medium">{item.name}</p>
        </div>
      </div>
      <DisplayPrice value={item.price} />
    </div>
  );
}