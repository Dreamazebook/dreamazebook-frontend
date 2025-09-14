'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CartItem as CartItemType, Preview } from './types';
import DisplayPrice from '../../components/component/DisplayPrice';
import { Link, useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';

interface CartItemProps {
  showEditBook?: boolean;
  item: CartItemType;
  selectedItems?: number[];
  onQuantityChange?: (id: number, delta: number) => void;
  onRemoveItem?: (id: number) => void;
  onToggleSelect?: (id: number) => void;
  handleClickEditMessage?: (orderItem:any) => void;
  isSubItem?: boolean;
}

export default function CartItemCard({ 
  isSubItem = false,
  showEditBook,
  item,
  selectedItems,
  onQuantityChange,
  onRemoveItem,
  onToggleSelect,
  handleClickEditMessage
  }: CartItemProps) {
  const t = useTranslations('ShoppingCart');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(()=>{
    checkAndShowCountdown(item.created_at);
    return () => {
      setCountdown(null);
    }
  },[])

  const checkAndShowCountdown = (createdAt: string) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 4) {
      const remainingMs = 4 * 60 * 60 * 1000 - diffInMs;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setCountdown(`${hours}:${minutes}:${seconds}`);

      const timer = setInterval(() => {
        const updatedNow = new Date();
        const updatedDiffInMs = updatedNow.getTime() - createdDate.getTime();
        const updatedRemainingMs = 4 * 60 * 60 * 1000 - updatedDiffInMs;

        if (updatedRemainingMs <= 0) {
          clearInterval(timer);
          setCountdown(null);
        } else {
          const updatedHours = Math.floor(updatedRemainingMs / (1000 * 60 * 60));
          const updatedMinutes = Math.floor((updatedRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const updatedSeconds = Math.floor((updatedRemainingMs % (1000 * 60)) / 1000);
          setCountdown(`${updatedHours}:${updatedMinutes}:${updatedSeconds}`);
        }
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(null);
    }
  };
  
  return (
    <div className={`bg-white ${isSubItem ? 'p-4' : 'rounded p-4 shadow-sm'}`}>
      <div className="flex items-start gap-3">
        {(onToggleSelect && selectedItems) && 
        <div className="relative inline-block h-6 w-6 mt-1">
          <span onClick={()=>onToggleSelect(item.id)} className={`absolute top-0 left-0 h-6 w-6 rounded-full border-2 ${selectedItems.includes(item.id) ? 'bg-[#012CCE]' : 'border-gray-300'} transition-colors duration-200 flex items-center justify-center`}>
            {selectedItems.includes(item.id) && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        </div>
        }
        
        <div className="flex-1">
          {(item.item_type !== 'package') ?
          <div className="flex items-start gap-4">
            <div className="w-20 h-22 rounded overflow-hidden">
              <img 
                src={item.picbook_cover} 
                alt={item.picbook_name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className='flex justify-between items-center'>
                <h3 className="font-bold">{item.picbook_name}</h3>
                
                <div className='flex items-center gap-3'>
                  <DisplayPrice style='text-[#222222] font-bold' discount={item.discount_price} value={item.total_price || item.price * item.quantity} />
                  
                  {onRemoveItem && 
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
                  </button>}

                </div>

              </div>
                
                <p className='text-[#666666] font-[400] capitalize'>{item.binding_type}</p>
                

                {(countdown && handleClickEditMessage) ? 
                  <p className="text-sm text-gray-600">You can modify your message within {countdown} <a onClick={()=>handleClickEditMessage(item)} className='text-[#012CCE] cursor-pointer'>Edit</a></p>
                  :
                  <p className={`text-[#666] bg-[#f8f8f8] font-[400] ${item.message?'p-2':''} rounded`}>{item.message}</p>
                }
                
                {(item.edition || item.description) && (
                  <p className="text-sm text-gray-600">
                    {item.edition}
                    {item.edition && item.description && ' | '}
                    {item.description}
                  </p>
                )}
              
              <div className="flex items-center justify-between gap-4">

                {showEditBook &&
                <a
                  className="text-sm text-blue-600 hover:underline mt-2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (handleClickEditMessage) {
                      handleClickEditMessage(item);
                    } else {
                      const url = `/personalized-products/${item.preview?.picbook_id}/${item.preview_id}/edit`;
                      console.log('CartItemList - Navigating to:', url);
                      router.push(url);
                    }
                  }}
                >
                  Edit Book
                </a>}
                
                {onQuantityChange && 
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
                </div>}

                
              </div>
              
            </div>
          </div>
          :
          <div className="flex items-start gap-4">KICKSTARTER package</div>
          }


          
          {item.subItems && item.subItems.length > 0 && (
            <div className="mt-3">
              {item.subItems.map((sub, idx) => (
                <CartItemCard key={sub.id} item={sub} isSubItem={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}