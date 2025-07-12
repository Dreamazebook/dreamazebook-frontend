'use client';

import { useTranslations } from 'next-intl';
import { CartItem as CartItemType } from './types';
import CartItem from './CartItem';

interface CartItemListProps {
  items: CartItemType[];
}

export default function CartItemList({ items }: CartItemListProps) {
  const t = useTranslations('ShoppingCart');
  
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
        <p>{t('emptyCart')}</p>
      </div>
    );
  }
  
  return (
    <div>
      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
}