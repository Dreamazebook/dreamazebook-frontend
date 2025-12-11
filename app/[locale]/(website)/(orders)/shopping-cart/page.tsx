/** @jsxImportSource react */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_CART_LIST, API_CART_REMOVE, API_CART_UPDATE, API_ORDER_CREATE, API_KS_PACKAGE_STATUS, API_CART_CALCULATE_COST } from '@/constants/api';
import { CartItem, CartItems } from '@/types/cart';

// 导入组件
import CartHeader from './components/CartHeader';
import CouponInput from './components/CouponInput';
import CartItemList from './components/CartItemList';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/component/ConfirmModal';
import useUserStore from '@/stores/userStore';
import { ORDER_CHECKOUT_URL } from '@/constants/links';

export default function ShoppingCartPage() {
  const t = useTranslations('ShoppingCart');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const { checkKickstarterStatus } = useUserStore();

  // 记录被选中的书本 ID，只有被选中的书才会结账
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const fetchCartList = async () => {
    try {
      const { data, message, success, code } = await api.get<ApiResponse<CartItems>>(API_CART_LIST);
      if (data?.items) {
        // 为每个 package 拉取其 items 作为子项，便于显示 Create/Edit Book
        const augmented = await Promise.all(
          data.items.map(async (item: any) => {
            if (item.item_type === 'package' && item.package_id) {
              try {
                const status = await api.get<any>(API_KS_PACKAGE_STATUS(item.package_id));
                const packageItems = status?.data?.package_items || [];
                const progress = status?.data?.progress || {};
                const pendingCount = packageItems.filter((pi: any) => pi.config_status === 'pending').length;
                const subItems = packageItems.map((pi: any) => ({
                  id: pi.id,
                  item_type: 'package_item',
                  package_id: item.package_id,
                  picbook_id: pi.picbook_id,
                  picbook_cover: pi.picbook?.default_cover,
                  picbook_name: pi.picbook?.default_name,
                  price: 0,
                  quantity: 1,
                  total_price: 0,
                  preview_id: pi.preview_id,
                  preview: pi.preview, // 可能为 null
                  status: pi.config_status,
                  created_at: pi.created_at,
                  updated_at: pi.updated_at,
                  picbook: pi.picbook,
                  message: '',
                }));
                return { ...item, subItems, ks_pending: pendingCount > 0 || (progress.configured_items ?? 0) < (progress.total_items ?? 0), ks_progress: progress };
              } catch (e) {
                return item;
              }
            }
            return item;
          })
        );
        setCartItems(augmented as any);
        setSelectedItems(augmented.map((item: any) => item.id));
      }
    } catch (err) {
      console.error('Failed to fetch carts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchCartList();
    // 同步检查 Kickstarter 套餐状态（用于控制卡片显示）
    checkKickstarterStatus();
    console.log('mounted')
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
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
          : item
      ));

      // 调用API更新服务器
      const { success, code, message, data } = await api.put<ApiResponse>(API_CART_UPDATE(id), {
        quantity: Math.max(1, (cartItems.find(item => item.id === id)?.quantity || 1) + delta)
      });

      if (!success) {
        // 如果API失败，回滚本地状态
        setCartItems(data.items || data.cart_item);
        setError(message);
      } else {
        fetchCartList();
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const [error, setError] = useState<string | undefined>('');

  const handleRemoveItem = async (id: number) => {
    try {
      const { code, success, message, data } = await api.delete<ApiResponse>(`${API_CART_UPDATE(id)}`);
      if (success) {
        // 移除主商品
        setCartItems(prev => prev.filter(item => item.id !== id));
        // 同时若已在选中列表中，也要移除
        // setSelectedItems(prev => prev.filter(itemId => itemId !== id));
        setError('');
      } else {
        setError(message || t('removeItemFailed'));
      }
    } catch (err) {
      setError(t('removeItemFailed'));
    }
  };

  const handleEditBook = (id: number) => {
    const item = cartItems.find(ci => ci.id === id);
    if (!item || !item.preview_id) {
      // 回退：跳原有创建页
      const fallbackBookId = item?.spu_code || (item as any)?.picbook_id || (item as any)?.picbook?.id;
      if (fallbackBookId) {
        router.push(`/personalize?bookid=${fallbackBookId}`);
      } else {
        router.push('/shopping-cart');
      }
      return;
    }

    const spuCode = item.spu_code;
    const previewId = item.preview_id;
    const query = new URLSearchParams({
      // recipient_name: item.preview.recipient_name ?? '',
      // gender: item.preview.gender,
      // skin_color: (item.preview.skin_color?.[0] ?? '').toString(),
      // photo_url: item.preview.face_image || ''
      // 以上字段如需携带，可解注释
    });

    router.push(`/personalized-products/${spuCode}/${previewId}/edit?${query.toString()}`);
  };

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paypalCheckoutLoading, setPaypalCheckoutLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmContent, setConfirmContent] = useState<React.ReactNode>(null);
  const [confirmNextUrl, setConfirmNextUrl] = useState<string | null>(null);

  // 结算时，仅包含已选中的商品
  const handleCheckout = async (paymentMethod: 'stripe' | 'paypal' = 'stripe') => {
    if (selectedItems.length === 0) {
      setError(t('noItemsSelected'));
      return;
    }
    
    // 设置对应的加载状态
    if (paymentMethod === 'paypal') {
      setPaypalCheckoutLoading(true);
    } else {
      setCheckoutLoading(true);
    }
    
    try {
      const { success, message, code, data } = await api.post<ApiResponse>(API_ORDER_CREATE, {
        cart_item_ids: selectedItems,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon
      });
      if (success) {
        setError('');
        router.push(ORDER_CHECKOUT_URL(data.order.id) + `&paymentMethod=${paymentMethod}`);
      } else {
        setError(message || t('checkoutFailed'));
      }
    } catch (err) {
      setError(t('checkoutFailed'));
    } finally {
      // 清除对应的加载状态
      if (paymentMethod === 'paypal') {
        setPaypalCheckoutLoading(false);
      } else {
        setCheckoutLoading(false);
      }
    }
  };

  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [calculatedCost, setCalculatedCost] = useState<any>(null);

  // Calculate cost based on API response or fallback to local calculation
  const subtotal = calculatedCost?.original_subtotal || 0;
  const shipping = calculatedCost?.shipping ?? 0;
  const discountInfo = calculatedCost?.discount;
  const discountAmount = discountInfo?.applicable ? (discountInfo.amount || 0) : 0;
  const total = calculatedCost?.total_amount || 0;

  // Call API_CART_CALCULATE_COST whenever selectedItems changes
  useEffect(() => {
    const calculateCost = async () => {
      if (selectedItems.length === 0) {
        setCalculatedCost(null);
        return;
      }

      try {
        const { data, success, message } = await api.post<ApiResponse>(API_CART_CALCULATE_COST, {
          cart_item_ids: selectedItems
        });

        if (success && data) {
          setCalculatedCost(data);
        } else {
          alert(message);
        }
      } catch (err:any) {
        alert(err.toString());
        setCalculatedCost(null);
      }
    };

    calculateCost();
  }, [selectedItems]);

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
    setAppliedCoupon(code);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex gap-4 p-4 border-b border-gray-200">
                    <div className="w-24 h-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-white rounded p-6 shadow-sm space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-40 lg:pb-0">
      <div className="w-full">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="flex w-full mx-auto">
          <div className="flex-1 opacity-100 flex flex-col gap-6">
            <div className="w-full hidden lg:block box-border h-[108px] pt-12 pr-16 pb-6 pl-[120px]">
              <CartHeader />
            </div>
            {cartItems.length === 0 ? (
              <div className="w-full box-border flex flex-col gap-[12px] pr-[64px] pb-[64px] pl-[120px] opacity-100">
                <div className="bg-white rounded-xl p-6 shadow-sm text-center mt-4">
                  <p>{t('emptyCart')}</p>
                </div>
              </div>
            ) : (
              <div className="w-full box-border flex flex-col gap-[12px] pr-[16px] pl-[16px] pt-4 lg:pt-0 lg:pr-16 lg:pb-[64px] lg:pl-[120px] opacity-100">
                <CartItemList
                  items={cartItems}
                  selectedItems={selectedItems}
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={handleRemoveItem}
                  onToggleSelect={handleToggleSelectItem}
                  onClickEditBook={async (ci) => {
                    try {
                      const { data } = await api.get<ApiResponse<CartItems>>(API_CART_LIST);
                      const list = (data as any)?.items || [];
                      const current = list.find((it: any) => it.id === ci.id);
                      const remaining = current?.remaining_previews;
                      const url = `/personalized-products/${ci.spu_code}/${ci.preview_id}/edit`;

                      if (remaining && typeof remaining.remaining_previews === 'number') {
                        const desc = (
                          <div>
                            <p>A product can only be edited five times a day.</p>
                            <p>
                              You have edited it {remaining.used_previews_today} times and you have {remaining.remaining_previews} more chances.
                            </p>
                          </div>
                        );
                        setConfirmContent(desc);
                        setConfirmOpen(true);
                        setConfirmNextUrl(url);
                      } else {
                        router.push(url);
                      }
                    } catch (e) {
                      const url = `/personalized-products/${ci.spu_code}/${ci.preview_id}/edit`;
                      router.push(url);
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="hidden lg:flex bg-white lg:w-[480px] xl:w-[544px] relative pt-[64px] pr-[48px] pb-[64px] pl-[48px] xl:pr-[120px] xl:pl-[64px] flex-col gap-[10px] opacity-100 ml-auto min-h-screen">
            <div className="bg-white w-full rounded sticky top-4 right-0 flex flex-col opacity-100 gap-4">
              <h2 className="text-3xl font-normal">{t('orderSummary')}</h2>

              <div className="">
                <p className="text-md font-medium">{t('haveCouponCode')}</p>
                <p className="text-[#666666] text-md">
                  25% off with code: BLACKFRIDAY
                </p>
                <CouponInput onApply={handleApplyCoupon} />
              </div>

              {appliedCoupon && (
                <p className="text-green-600 text-sm">
                  {t('appliedCoupon')}: <strong>{appliedCoupon}</strong>
                </p>
              )}

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">{t('subtotal')} ({selectedItems.length} {t('items')})</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">{t('shipping')}</p>
                  <p>${shipping.toFixed(2)}</p>
                </div>
                {discountInfo?.applicable && discountAmount > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[#abd29b]">
                      <div>
                        <p>Multi-book discount:</p>
                        {/* {discountInfo.description && (
                          <p className="text-xs text-[#abd29b]">{discountInfo.description}</p>
                        )} */}
                      </div>
                      <div className="text-right">
                        <p>-${discountAmount.toFixed(2)} ({discountInfo.percentage}%)</p>
                        {/* {discountInfo.percentage && (
                          <p className="text-xs text-[#abd29b]">-{discountInfo.percentage}%</p>
                        )} */}
                      </div>
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <p>{t('total')}</p>
                  <p className='font-bold'>${total.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  {/* <button
                    onClick={() => setSelectedItems([])}
                    disabled={selectedItems.length === 0}
                    className="flex-1 py-3 cursor-pointer bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    {t('deselectAll')}
                  </button>
                  <button
                    onClick={() => setSelectedItems(cartItems.map(item => item.id))}
                    disabled={selectedItems.length === cartItems.length}
                    className="flex-1 py-3 cursor-pointer bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    {t('selectAll')}
                  </button> */}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => handleCheckout('stripe')}
                    disabled={selectedItems.length === 0 || checkoutLoading}
                    className="w-full py-3 cursor-pointer bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('processing')}
                      </>
                    ) : (
                      'Checkout'
                    )}
                  </button>
                  <button
                    onClick={() => handleCheckout('paypal')}
                    disabled={selectedItems.length === 0 || paypalCheckoutLoading}
                    className="w-full py-3 bg-[#0070BA] text-white rounded-md hover:bg-[#003087] disabled:bg-blue-300 flex items-center justify-center gap-2"
                  >
                    {paypalCheckoutLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('processing')}
                      </>
                    ) : (
                      'Checkout with PayPal'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile bottom summary sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded z-10">
        <div className="max-w-screen-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {!mobileSummaryOpen && <p className="text-base font-normal">{t('total')}</p>}
            {!mobileSummaryOpen && (
              <button
                aria-label="toggle-summary"
                onClick={() => setMobileSummaryOpen(true)}
                className="flex items-center gap-2"
              >
                <span className="font-md text-lg">${total.toFixed(2)}</span>
                <svg className={`w-5 h-5 transition-transform`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            )}
          </div>
          {!mobileSummaryOpen && (
            <div className="mt-2 space-y-3">
              <button
                onClick={() => handleCheckout('stripe')}
                disabled={selectedItems.length === 0 || checkoutLoading}
                className="w-full py-3 cursor-pointer bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('processing')}
                  </>
                ) : (
                  'Checkout'
                )}
              </button>
              <button
                onClick={() => handleCheckout('paypal')}
                disabled={selectedItems.length === 0 || paypalCheckoutLoading}
                className="w-full py-3 bg-[#0070BA] text-white rounded-md hover:bg-[#003087] disabled:bg-blue-300 flex items-center justify-center gap-2"
              >
                {paypalCheckoutLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('processing')}
                  </>
                ) : (
                  'Checkout with PayPal'
                )}
              </button>
            </div>
          )}
          {mobileSummaryOpen && (
            <div className="mt-3 space-y-3">
              <div className="border-b border-[#E5E5E5] pb-4">
                <h2 className="text-3xl font-normal mb-4">{t('orderSummary')}</h2>
                <p className="text-md font-medium">{t('haveCouponCode')}</p>
                <p className="text-[#666666] text-md">25% off with code: BLACKFRIDAY</p>
                <CouponInput onApply={handleApplyCoupon} />
              </div>

              <div className="space-y-3 text-[#666666]">
                <div className="flex justify-between">
                  <p className="text-[#666666]">{t('subtotal')} ({selectedItems.length} {t('items')})</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[#666666]">{t('shipping')}</p>
                  <p>${shipping.toFixed(2)}</p>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#666666]">
                    <p>{t('discount')}</p>
                    <p>-${discount.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#E5E5E5] pt-3 flex items-center justify-between mb-6">
                <p className='font-normal'>{t('total')}</p>
                <div className="flex items-center gap-2">
                  <p className='font-md text-lg'>${total.toFixed(2)}</p>
                  <button aria-label="toggle-summary" onClick={() => setMobileSummaryOpen(false)} className="p-1">
                    <svg className={`w-5 h-5 transition-transform rotate-180`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleCheckout('stripe')}
                  disabled={selectedItems.length === 0 || checkoutLoading}
                  className="w-full py-3 cursor-pointer bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('processing')}
                    </>
                  ) : (
                    'Checkout'
                  )}
                </button>
                <button
                  onClick={() => handleCheckout('paypal')}
                  disabled={selectedItems.length === 0 || paypalCheckoutLoading}
                  className="w-full py-3 bg-[#0070BA] text-white rounded-md hover:bg-[#003087] disabled:bg-blue-300 flex items-center justify-center gap-2"
                >
                  {paypalCheckoutLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('processing')}
                    </>
                  ) : (
                    'Checkout with PayPal'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="Important tips"
        description={confirmContent}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          if (confirmNextUrl) {
            router.push(confirmNextUrl);
          }
        }}
      />
    </div>
  );
}