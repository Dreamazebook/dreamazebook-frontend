/** @jsxImportSource react */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_CART_LIST, API_CART_REMOVE } from '@/constants/api';
import { CartItem, CartItems } from './components/types';

// 导入组件
import CartHeader from './components/CartHeader';
import CartItemList from './components/CartItemList';
import CartSummary from './components/CartSummary';
import CouponInput from './components/CouponInput';

export default function ShoppingCartPage() {
  const t = useTranslations('ShoppingCart');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState(0);
  const router = useRouter();

  // 记录被选中的书本 ID，只有被选中的书才会结账
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    const fetchCartList = async () => {
      try {
        const { data, message, success, code } = await api.get<ApiResponse<CartItems>>(API_CART_LIST);
        if (data?.cart_items) {
          setCartItems(data.cart_items);
          // 默认全选所有商品
          setSelectedItems(data.cart_items.map(item => item.id));
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch carts:', err);
        setLoading(false);
      }
    };

    fetchCartList();
  }, []);

  const handleToggleSelectItem = (id: number) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        // 若已选中，则取消选中
        return prev.filter(itemId => itemId !== id);
      } else {
        // 若未选中，则添加
        return [...prev, id];
      }
    });
  };

  // 移除主商品及其附加项
  const handleRemoveItem = async (id: number) => {
    const {code,success,message,data} = await api.delete<ApiResponse>(`${API_CART_REMOVE}/${id}`);
    if (success) {
      // 移除主商品
      setCartItems(prev => prev.filter(item => item.id !== id));
      // 同时若已在选中列表中，也要移除
      // setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    } else {
      alert(message);
    }
  };

  const handleEditBook = (id: number) => {
    alert(`Edit book with id = ${id}`);
  };

  // 结算时，仅包含已选中的商品
  const handleCheckout = async () => {
    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
    if (itemsToCheckout.length === 0) {
      alert(t('noItemsSelected'));
      return;
    }
    router.push('/checkout');
  };

  // 示例计算价格：仅计算选中的书（含其子项目）
  const subtotal = cartItems.reduce((acc, item) => {
    if (!selectedItems.includes(item.id)) return acc; // 未选中则跳过
    let sum = item.price;
    if (item.subItems) {
      sum += item.subItems.reduce((subAcc, sub) => subAcc + sub.price, 0);
    }
    return acc + sum;
  }, 0);

  const shipping = 0;
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = (code: string) => {
    // 这里应该是调用API验证优惠码并获取折扣金额
    // 为了演示，我们假设"BLACKFRIDAY"优惠码会给25%的折扣
    if (code.toUpperCase() === 'BLACKFRIDAY') {
      const newDiscount = Math.round(subtotal * 0.25 * 100) / 100;
      setDiscount(newDiscount);
      alert(t('couponApplied'));
    } else {
      alert(t('invalidCoupon'));
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <CartHeader />
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p>{t('emptyCart')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-blue-600"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleToggleSelectItem(item.id)}
                      />
                      
                      <div className="ml-3 flex-1">
                        <div className="flex items-start">
                          <div className="w-20 h-20 rounded-md overflow-hidden mr-4">
                            <img 
                              src={item.picbook_cover} 
                              alt={item.picbook_name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-bold">{item.picbook_name}</h3>
                              <div className="flex items-center gap-4">
                                <p className="font-medium">${item.price.toFixed(2)}</p>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
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
                            
                            {(item.edition || item.description) && (
                              <p className="text-sm text-gray-600">
                                {item.edition}
                                {item.edition && item.description && ' | '}
                                {item.description}
                              </p>
                            )}
                            
                            <button
                              onClick={() => handleEditBook(item.id)}
                              className="text-sm text-blue-600 hover:underline mt-1"
                            >
                              {t('editBook')}
                            </button>
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
            )}
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">{t('orderSummary')}</h2>
              
              <div className="mb-6">
                <p className="text-sm mb-1">{t('haveCouponCode')}</p>
                <p className="text-blue-600 text-sm">
                  25% off with code: <strong>BLACKFRIDAY</strong>
                </p>
                <CouponInput onApply={handleApplyCoupon} />
              </div>
              
              <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">{t('subtotal')} ({selectedItems.length} {t('items')})</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">{t('shipping')}</p>
                  <p>${shipping.toFixed(2)}</p>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p>{t('discount')}</p>
                    <p>-${discount.toFixed(2)}</p>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold">
                  <p>{t('total')}</p>
                  <p>${total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {t('checkout')}
                </button>
                <button
                  onClick={() => alert('Checkout with PayPal')}
                  disabled={selectedItems.length === 0}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
                >
                  {t('checkoutWithPayPal')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}