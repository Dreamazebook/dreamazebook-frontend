/** @jsxImportSource react */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


interface CartSubItem {
  name: string;
  image: string;
  price: number;
}

interface CartItem {
  id: number;
  image: string;
  name: string;
  edition?: string;      // 如 "Premium Jumbo Hardcover"
  description?: string;  // 额外描述，比如 "a festive gift box"
  price: number;
  subItems?: CartSubItem[]; // 附加项目
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    image: '/cover1.png',
    name: 'Book name | lily child',
    edition: 'Premium Jumbo Hardcover',
    description: 'a festive gift box',
    price: 19.99,
    subItems: [
      {
        name: 'a festive gift box',
        image: '/giftbox1.png',
        price: 4.99,
      },
    ],
  },
  {
    id: 2,
    image: '/cover2.png',
    name: 'Book name | lily child',
    edition: 'Premium Jumbo Hardcover',
    price: 49.99,
  },
  {
    id: 3,
    image: '/cover3.png',
    name: 'Book name | lily child',
    edition: 'Premium Jumbo Hardcover',
    price: 39.99,
  },
  {
    id: 4,
    image: '/cover4.png',
    name: 'Book name | lily child',
    edition: 'Premium Jumbo Hardcover',
    price: 59.99,
  },
];

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  // 定义一个状态来存储优惠码
  const [couponCode, setCouponCode] = useState('');

  // 记录被选中的书本 ID，只有被选中的书才会结账
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const router = useRouter();

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
  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    // 同时若已在选中列表中，也要移除
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const handleEditBook = (id: number) => {
    alert(`Edit book with id = ${id}`);
  };

  const handleContinueShopping = () => {
    alert('Continue shopping...');
  };

  // 结算时，仅包含已选中的商品
  const handleCheckout = async () => {
    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
    if (itemsToCheckout.length === 0) {
      alert('No items selected for checkout!');
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
  const discount = subtotal * 0.25; // 假设 25% off
  const total = subtotal - discount + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-[1400px] px-4 flex gap-6">
        {/* 左侧：购物车列表 */}
        <div className="flex-1">
          {/* 标题行：Shopping Cart + Continue Shopping */}
          <div
            style={{
              width: '896px',
              height: '108px',
              padding: '48px 64px 24px 120px',
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h1 className="text-2xl font-normal">Shopping Cart</h1>
            <button
              onClick={handleContinueShopping}
              className="text-sm text-blue-600 hover:underline"
            >
              Continue Shopping
            </button>
          </div>

          {/* 购物车商品列表容器 */}
          <div className="w-[896px] h-[660px] flex flex-col gap-[12px] pr-[64px] pb-[64px] pl-[120px]">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                {/* 行1：Checkbox + 封面 + (书名 + 价格) + 移除按钮 */}
                <div className="flex items-start justify-between w-full">
                  {/* 左侧：Checkbox + 封面 + 文字内容 */}
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-blue-600"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleToggleSelectItem(item.id)}
                    />

                    {/* 封面图 */}
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-cover rounded"
                    />

                    {/* 文字部分：包含3行布局 */}
                    <div className="flex flex-col flex-1 w-[576px]">
                      {/* 第1行：书名在左 + (价格 + 删除按钮)在右 */}
                      <div className="flex items-center justify-between w-full">
                        {/* 左侧：书名 */}
                        <span className="font-semibold text-base">
                          {item.name}
                        </span>

                        {/* 右侧：价格 + 删除按钮 */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm sm:text-base font-semibold">
                            ${item.price.toFixed(2)} USD
                          </span>
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


                      {/* 第2行：版本 + 描述（如 a festive gift box） */}
                      {(item.edition || item.description) && (
                        <span className="text-sm text-gray-600">
                          {item.edition}
                          {item.edition && item.description && ' | '}
                          {item.description}
                        </span>
                      )}

                      {/* 第3行：Edit book 按钮 */}
                      <div className="mt-1">
                        <button
                          onClick={() => handleEditBook(item.id)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 若有附加子项目（如 a festive gift box），与母书本左对齐 */}
                {item.subItems && item.subItems.length > 0 && (
                  <div className="mt-3 ml-[2.5rem]">
                    {item.subItems.map((sub, idx) => (
                      <div
                        key={`${item.id}-sub-${idx}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Image
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
                          ${sub.price.toFixed(2)} USD
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：Summary 区域，宽度固定 544px */}
        <div className="w-[544px] bg-white rounded shadow p-6 flex flex-col h-fit">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="mb-4">
            <p className="text-sm mb-1">Do you have a coupon code?</p>
            <p className="text-blue-600 text-sm">
              25% off with code: <strong>BLACKFRIDAY</strong>
            </p>
            {/* 输入框 */}
            <div className="flex mt-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)} // 更新状态
                placeholder="Enter coupon code"
                className="flex-1 border border-gray-300 p-2 text-sm rounded-l focus:outline-none"
              />
              <button
                onClick={() => {
                  // 使用 couponCode 做相应逻辑
                  alert(`Applying coupon: ${couponCode}`);
                }}
                className="bg-gray-200 text-sm px-4 rounded-r hover:bg-gray-300"
              >
                Apply
              </button>
            </div>
          </div>

          {/* 价格小结：仅统计被选中的书本 */}
          <div className="border-t border-gray-300 pt-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Subtotal (Selected Items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discounts</span>
              <span>- ${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          {/* 结算按钮 */}
          <div className="mt-6 space-y-2">
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-2 rounded text-sm sm:text-base"
            >
              Checkout
            </button>
            <button
              onClick={() => alert('Checkout with PayPal')}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {/* <Image
                src="https://www.paypalobjects.com/webstatic/icon/pp72.png"
                alt="PayPal"
                width={16}
                height={16}
                className="object-contain"
              /> */}
              Checkout with PayPal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
