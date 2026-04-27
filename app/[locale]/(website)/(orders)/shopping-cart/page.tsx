/** @jsxImportSource react */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_CART_LIST, API_CART_UPDATE, API_KS_PACKAGE_STATUS } from '@/constants/api';
import { CartItem, CartItems } from '@/types/cart';
import { useOrderSummary } from '@/hooks/useOrderSummary';
import { useCheckout } from '@/hooks/useCheckout';

// 导入组件
import CartHeader from './components/CartHeader';
import CartItemList from './components/CartItemList';
import ConfirmModal from '../../components/component/ConfirmModal';
import OrderSummary from './components/OrderSummary';
import ShippingProgressBanner from './components/ShippingProgressBanner';
import OAuthCallbackContent from './components/OAuthCallbackContent';
import useUserStore from '@/stores/userStore';

export default function ShoppingCartPage() {
  const t = useTranslations('ShoppingCart');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmContent, setConfirmContent] = useState<React.ReactNode>(null);
  const [confirmNextUrl, setConfirmNextUrl] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkKickstarterStatus } = useUserStore();

  // Check if this is an OAuth callback
  const isOAuthCallback = searchParams.get('code') !== null;

  // 记录被选中的书本 ID，只有被选中的书才会结账
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Use custom hooks for order summary and checkout
  const {
    calculatingCost,
    subtotal,
    shipping,
    discountInfo,
    discountAmount,
    total,
    itemsCount,
  } = useOrderSummary({ selectedItems, onCartItemsUpdate: setCartItems });

  const {
    checkoutLoading,
    paypalCheckoutLoading,
    error,
    setError,
    handleCheckout,
  } = useCheckout({ selectedItems });

  const fetchCartList = async () => {
    try {
      const { data, success, message } = await api.get<ApiResponse<CartItems>>(API_CART_LIST);
      if (!success) {
        console.error(message);
      }
      setDefaultCartItem(data?.items);
      if (data?.items) {
        // 为每个 package 拉取其 items 作为子项，便于显示 Create/Edit Book
        const augmented = await Promise.all(
          data.items.map(async (item: any) => {
            if (item.item_type === 'package' && item.package_id) {
              // 圣诞套装（CHRISTMAS_*）已经选好书，不需要走 Kickstarter 配置/状态接口
              const pkgCode = item?.package_code || item?.package_snapshot?.code;
              const isChristmasBundle = typeof pkgCode === 'string' && pkgCode.startsWith('CHRISTMAS_');
              if (isChristmasBundle) {
                return item;
              }
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
        if (data?.selection?.cart_item_ids.length > 0) {
          setSelectedItems(data.selection.cart_item_ids);
        }
      }
    } catch (err) {
      console.error('Failed to fetch carts:', err);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultCartItem = (items:CartItem[]|undefined) => {
    const scid = searchParams.get('selected_cart_id');
    if (scid) {
      const ids = scid.split(',');
      setSelectedItems(ids.map((id)=>parseInt(id, 10)));
    } else if (items && items?.length) {
      setSelectedItems([items[0].id]);
    }
  }

  useEffect(() => {

    fetchCartList();
    // 同步检查 Kickstarter 套餐状态（用于控制卡片显示）
    checkKickstarterStatus();
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
    // Toggle is_selected_for_checkout on the cart item
    setCartItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, is_selected_for_checkout: !item.is_selected_for_checkout }
        : item
    ));
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
      const { success, message, data } = await api.put<ApiResponse>(API_CART_UPDATE(id), {
        quantity: Math.max(1, (cartItems.find(item => item.id === id)?.quantity || 1) + delta)
      });

      // Note: calculateCost is automatically called when selectedItems changes via the custom hook

      if (!success) {
        // 如果API失败，回滚本地状态
        setCartItems(data.items || data.cart_item);
        setError(message);
      } else {
        // Trigger cost recalculation by forcing a re-render of the selectedItems
        setSelectedItems(prev => [...prev]);
      }
      // Remove the else block with fetchCartList() since we already updated local state optimistically
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      const { success, message } = await api.delete<ApiResponse>(`${API_CART_UPDATE(id)}`);
      if (success) {
        // 移除主商品
        setCartItems(prev => prev.filter(item => item.id !== id));
        // 同时若已在选中列表中，也要移除
        setSelectedItems(prev => prev.filter(itemId => itemId !== id));
        setError('');
      } else {
        setError(message || t('removeItemFailed'));
      }
    } catch (err) {
      setError(t('removeItemFailed'));
    }
  };

  

  // Show OAuth callback content if processing OAuth login
  if (isOAuthCallback) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] pb-40 lg:pb-0">
        <div className="w-full box-border flex flex-col gap-[12px] pr-[64px] pb-[64px] pl-[120px] opacity-100 pt-12">
          <OAuthCallbackContent onSuccess={fetchCartList} />
        </div>
      </div>
    );
  }

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
                  itemsCount={itemsCount}
                  items={cartItems}
                  selectedItems={selectedItems}
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={handleRemoveItem}
                  onToggleSelect={handleToggleSelectItem}
                  onClickEditBook={async (ci) => {
                    try {
                      // Use existing cart items state instead of fetching entire cart
                      const current = cartItems.find((it: any) => it.id === ci.id);
                      const remaining = current?.remaining_previews;
                      const url = `/personalized-products/${ci.spu_code}/${ci.preview_id}/edit`;

                      if (remaining && typeof remaining.remaining_previews === 'number') {
                        const desc = (
                          <div>
                            <p>{t('editLimitText')}</p>
                            <p>
                              {t('editUsageText', { count: remaining.used_previews_today, remaining: remaining.remaining_previews })}
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

                <ShippingProgressBanner itemsCount={selectedItems.length} />
              </div>
            )}
          </div>

          <OrderSummary
            calculatingCost={calculatingCost}
            subtotal={subtotal}
            shipping={shipping}
            discountInfo={discountInfo}
            discountAmount={discountAmount}
            total={total}
            itemsCount={itemsCount}
            checkoutLoading={checkoutLoading}
            paypalCheckoutLoading={paypalCheckoutLoading}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title={t('importantTips')}
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