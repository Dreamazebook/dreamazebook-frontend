import React from 'react';
import { CartItem } from '@/types/cart';
import CartItemCard from './CartItemCard';

interface SubItem {
  id: number;
  name: string;
  image: string;
  price: number;
}


interface CartItemListProps {
  items: CartItem[];
  itemsCount: number;
  selectedItems: number[];
  onQuantityChange: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onToggleSelect: (id: number) => void;
  onClickEditBook?: (item: CartItem) => void;
  flashItemId?: number | null;
}

const CartItemList: React.FC<CartItemListProps> = ({
  items,
  itemsCount,
  selectedItems,
  onQuantityChange,
  onRemoveItem,
  onToggleSelect,
  onClickEditBook,
  flashItemId,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {items.map(item => (
        <div id={`cart-item-${item.id}`} key={item.id}>
          <CartItemCard 
            itemsCount={itemsCount} 
            item={item} 
            showEditBook={true} 
            selectedItems={selectedItems} 
            onQuantityChange={onQuantityChange} 
            onRemoveItem={onRemoveItem} 
            onToggleSelect={onToggleSelect} 
            handleClickEditMessage={onClickEditBook as any}
            flash={flashItemId === item.id}
          />
        </div>
      ))}
    </div>
  );
};

export default CartItemList;