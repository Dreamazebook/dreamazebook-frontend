import React from 'react';
import { CartItem } from './types';
import DisplayPrice from '../../components/component/DisplayPrice';
import { Link } from "@/i18n/routing";

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
        <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="mt-1 h-6 w-6 accent-blue-600 rounded-2xl"
              checked={selectedItems.includes(item.id)}
              onChange={() => onToggleSelect(item.id)}
            />
            
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-md overflow-hidden">
                  <img 
                    src={item.picbook_cover} 
                    alt={item.picbook_name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{item.picbook_name}</h3>
                      {(item.edition || item.description) && (
                        <p className="text-sm text-gray-600">
                          {item.edition}
                          {item.edition && item.description && ' | '}
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => onQuantityChange(item.id, -1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) - item.quantity)}
                          className="w-12 text-center border-x py-1"
                        />
                        <button
                          onClick={() => onQuantityChange(item.id, 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <DisplayPrice value={item.total_price || item.price * item.quantity} />
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 2a2 2 0 00-2 2v1H2.5a.5.5 0 000 1h.548l.764 10.697A2 2 0 005.8 19h8.4a2 2 0 001.988-1.303L16.952 6H17.5a.5.5 0 000-1H15V4a2 2 0 00-2-2H6zm3 13a.5.5 0 01-1 0V8a.5.5 0 011 0v7zm3 0a.5.5 0 01-1 0V8a.5.5 0 011 0v7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <Link
                    href={(() => {
                      const bookParams = item.preview ? {
                        name: item.preview.recipient_name || '',
                        gender: item.preview.gender,
                        skin_color: item.preview.skin_color?.[0]?.toString(),
                        photo_url: item.preview.face_image
                      } : null;
                      
                      return bookParams ? 
                        `/personalized-products/${item.preview?.picbook_id}/${item.preview_id}/edit?${new URLSearchParams({
                          ...(bookParams.name && { recipient_name: bookParams.name }),
                          ...(bookParams.gender && { gender: bookParams.gender }),
                          ...(bookParams.skin_color && { skin_color: bookParams.skin_color }),
                          ...(bookParams.photo_url && { photo_url: bookParams.photo_url })
                        }).toString()}` : 
                        `/personalized-products/${item.preview?.picbook_id}/${item.preview_id}/edit`;
                    })()}
                    className="text-sm text-blue-600 hover:underline mt-2"
                    onClick={() => {
                      const bookParams = item.preview ? {
                        name: item.preview.recipient_name || '',
                        gender: item.preview.gender,
                        skin_color: item.preview.skin_color?.[0]?.toString(),
                        photo_url: item.preview.face_image
                      } : null;
                      
                      const url = bookParams ? 
                        `/personalized-products/${item.preview?.picbook_id}/${item.preview_id}/edit?${new URLSearchParams({
                          ...(bookParams.name && { recipient_name: bookParams.name }),
                          ...(bookParams.gender && { gender: bookParams.gender }),
                          ...(bookParams.skin_color && { skin_color: bookParams.skin_color }),
                          ...(bookParams.photo_url && { photo_url: bookParams.photo_url })
                        }).toString()}` : 
                        `/personalized-products/${item.preview?.picbook_id}/${item.preview_id}/edit`;
                      
                      console.log('CartItemList - Preview data:', item.preview);
                      console.log('CartItemList - BookParams:', bookParams);
                      console.log('CartItemList - Generated URL:', url);
                    }}
                  >
                    Edit Book
                  </Link>
                </div>
              </div>
              
              {item.subItems && item.subItems.length > 0 && (
                <div className="mt-3 ml-6">
                  {item.subItems.map((sub, idx) => (
                    <div
                      key={`${item.id}-sub-${idx}`}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.image}
                          alt={sub.name}
                          width={48}
                          height={48}
                          className="object-cover rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        ${sub.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartItemList;