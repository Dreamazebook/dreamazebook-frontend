import React from 'react';
import { CartItem } from './types';
import CartItemCard from './CartItemCard';

interface SubItem {
  id: number;
  name: string;
  image: string;
  price: number;
}


interface CartItemListProps {
  items: CartItem[];
  selectedItems: number[];
  onQuantityChange: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onToggleSelect: (id: number) => void;
}

const CartItemList: React.FC<CartItemListProps> = ({
  items,
  selectedItems,
  onQuantityChange,
  onRemoveItem,
  onToggleSelect,
}) => {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <CartItemCard key={item.id} item={item} showEditBook={true} selectedItems={selectedItems} onQuantityChange={onQuantityChange} onRemoveItem={onRemoveItem} onToggleSelect={onToggleSelect} />
      ))}
    </div>
  );
};

export default CartItemList;