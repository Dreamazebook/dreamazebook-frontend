/** @jsxImportSource react */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_CART_LIST, API_CART_REMOVE, API_CART_UPDATE, API_ORDER_CREATE } from '@/constants/api';
import { CartItem, CartItems } from './components/types';

// 导入组件
import CartHeader from './components/CartHeader';
import CouponInput from './components/CouponInput';
import CartItemList from './components/CartItemList';

export default function ShoppingCartPage() {
  const t = useTranslations('ShoppingCart');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

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
  const handleQuantityChange = async (id: number, delta: number) => {
    try {
      // 先更新本地状态
      setCartItems(prev => prev.map(item => 
        item.id === id 
          ? {...item, quantity: Math.max(1, (item.quantity || 1) + delta)} 
          : item
      ));
      
      // 调用API更新服务器
      const {success, data} = await api.post<ApiResponse>(`${API_CART_UPDATE}/${id}`, {
        quantity: Math.max(1, (cartItems.find(item => item.id === id)?.quantity || 1) + delta)
      });
      
      if (!success) {
        // 如果API失败，回滚本地状态
        setCartItems(data.cart_items || data.cart_item);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

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
    const item = cartItems.find(ci => ci.id === id);
    if (!item || !item.preview || !item.preview_id) {
      // 回退：跳原有创建页
      router.push(`/personalize?bookid=${id}`);
      return;
    }

    const bookId = item.preview.picbook_id;
    const previewId = item.preview_id;
    const query = new URLSearchParams({
      recipient_name: item.preview.recipient_name ?? '',
      gender: item.preview.gender,
      skin_color: (item.preview.skin_color?.[0] ?? '').toString(),
      photo_url: item.preview.face_image || ''
    });

    router.push(`/personalized-products/${bookId}/${previewId}/edit?${query.toString()}`);
  };

  // 结算时，仅包含已选中的商品
  const handleCheckout = async () => {
    // const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
    if (selectedItems.length === 0) {
      alert(t('noItemsSelected'));
      return;
    }
    const {success,message,code,data} = await api.post<ApiResponse>(API_ORDER_CREATE, {
      cart_item_ids: selectedItems,
      payment_method:'stripe'
    });
    if (success) {
      router.push(`/checkout?orderId=${data.order.id}`);
    } else {
      alert(message);
    }
  };

  // 示例计算价格：仅计算选中的书（含其子项目）
  const subtotal = cartItems.reduce((acc, item) => {
    if (!selectedItems.includes(item.id)) return acc; // 未选中则跳过
    let sum = item.price * (item.quantity || 1);
    if (item.subItems) {
      sum += item.subItems.reduce((subAcc, sub) => subAcc + sub.price, 0);
    }
    return acc + sum;
  }, 0);

  const shipping = 0;
  const total = subtotal + shipping - discount;

  const [appliedCoupon, setAppliedCoupon] = useState('');
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
              <CartItemList
                items={cartItems}
                selectedItems={selectedItems}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
                onToggleSelect={handleToggleSelectItem}
              />
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
                  className="w-full py-3 cursor-pointer bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {t('checkout')}
                </button>
                {/* <button
                  onClick={() => alert('Checkout with PayPal')}
                  disabled={selectedItems.length === 0}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
                >
                  {t('checkoutWithPayPal')}
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}