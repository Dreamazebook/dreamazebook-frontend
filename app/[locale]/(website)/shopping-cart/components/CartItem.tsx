'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CartItem as CartItemType } from './types';
import CartSubItem from './CartSubItem';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const t = useTranslations('ShoppingCart');
  
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
          </div>
        </div>
        <p className="font-medium">${item.price.toFixed(2)}</p>
      </div>
      
      {item.subItems && item.subItems.map((subItem, index) => (
        <CartSubItem key={index} item={subItem} />
      ))}
    </div>
  );
}