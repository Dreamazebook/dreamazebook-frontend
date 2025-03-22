'use client';
import React, { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  edition?: string;
  description?: string;
  image: string;
  price: number;
  quantity: number;
}

const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: 'Premium Jumbo Hardcover',
    edition: 'Festive Gift Box',
    description: 'Special edition with gift wrap',
    image: '/cover1.png',
    price: 159.99,
    quantity: 1,
  },
  {
    id: 2,
    name: 'Softcover Book',
    edition: 'Standard Edition',
    description: 'Lightweight and portable',
    image: '/cover2.png',
    price: 39.99,
    quantity: 2,
  },
];

interface ShippingErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  state?: string;
}

export default function CheckoutPage() {
  // 控制左侧步骤展开/收起状态
  const [isShippingOpen, setIsShippingOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Shipping 表单字段
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<ShippingErrors>({});

  // 价格计算
  const subtotal = mockCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingCost = 9.99;
  const discount = 10;
  const total = subtotal + shippingCost - discount;

  // Shipping 步骤：校验必填项并显示错误信息
  const handleNextFromShipping = () => {
    let newErrors: ShippingErrors = {};
    if (!email) newErrors.email = '必填项';
    if (!firstName) newErrors.firstName = '必填项';
    if (!lastName) newErrors.lastName = '必填项';
    if (!address) newErrors.address = '必填项';
    if (!city) newErrors.city = '必填项';
    if (!zip) newErrors.zip = '必填项';
    if (!country) newErrors.country = '必填项';
    if (!state) newErrors.state = '必填项';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsShippingOpen(false);
    setIsDeliveryOpen(true);
  };

  const handleNextFromDelivery = () => {
    setIsDeliveryOpen(false);
    setIsReviewOpen(true);
  };

  const handlePlaceOrder = () => {
    alert('订单已提交！');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-row gap-8">
        {/* 左侧：Shipping / Delivery / Review & Pay */}
        <div className="flex-1 space-y-6">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-blue-600 hover:underline"
          >
            &lt; 返回
          </button>

          {/* 01 Shipping */}
          <div className="bg-white rounded-md shadow p-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsShippingOpen(!isShippingOpen)}
            >
              <h2 className="text-lg font-semibold">01 Shipping</h2>
              <button className="text-xl">{isShippingOpen ? '-' : '+'}</button>
            </div>
            {isShippingOpen && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-4">
                  已有账号？{' '}
                  <a href="#" className="text-blue-600 underline">
                    登录
                  </a>{' '}
                  快速结账
                </p>
                <form className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="请输入邮箱"
                      value={email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        if (val) {
                          setErrors((prev) => ({ ...prev, email: undefined }));
                        }
                      }}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  {/* First name & Last name */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="请输入名"
                        value={firstName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFirstName(val);
                          if (val) {
                            setErrors((prev) => ({ ...prev, firstName: undefined }));
                          }
                        }}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="请输入姓"
                        value={lastName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLastName(val);
                          if (val) {
                            setErrors((prev) => ({ ...prev, lastName: undefined }));
                          }
                        }}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="请输入地址"
                      value={address}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddress(val);
                        if (val) {
                          setErrors((prev) => ({ ...prev, address: undefined }));
                        }
                      }}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                  {/* Apt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Apt, Building, ETC
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="请输入公寓号/楼层等"
                      value={apt}
                      onChange={(e) => setApt(e.target.value)}
                    />
                  </div>
                  {/* City & ZIP */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Town/City
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="请输入城市"
                        value={city}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCity(val);
                          if (val) {
                            setErrors((prev) => ({ ...prev, city: undefined }));
                          }
                        }}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        ZIP/Postcode
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="请输入邮编"
                        value={zip}
                        onChange={(e) => {
                          const val = e.target.value;
                          setZip(val);
                          if (val) {
                            setErrors((prev) => ({ ...prev, zip: undefined }));
                          }
                        }}
                      />
                      {errors.zip && (
                        <p className="text-red-500 text-sm mt-1">{errors.zip}</p>
                      )}
                    </div>
                  </div>
                  {/* Country & State/Province */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="请输入国家"
                        value={country}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCountry(val);
                          if (val) {
                            setErrors((prev) => ({ ...prev, country: undefined }));
                          }
                        }}
                      />
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="请输入省份/州"
                        value={state}
                        onChange={(e) => {
                          const val = e.target.value;
                          setState(val);
                          if (val) {
                            setErrors((prev) => ({ ...prev, state: undefined }));
                          }
                        }}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone number (optional)
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="请输入电话"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="updates"
                      className="h-4 w-4 accent-blue-600"
                    />
                    <label htmlFor="updates" className="ml-2 text-sm text-gray-700">
                      获取包裹物流更新
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextFromShipping}
                    className="mt-4 w-full bg-black text-white py-2 rounded text-sm"
                  >
                    Next: Delivery
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* 02 Delivery */}
          <div className="bg-white rounded-md shadow p-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
            >
              <h2 className="text-lg font-semibold">02 Delivery</h2>
              <button className="text-xl">{isDeliveryOpen ? '-' : '+'}</button>
            </div>
            {isDeliveryOpen && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-4">选择你的配送方式</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      className="h-4 w-4 accent-blue-600"
                      defaultChecked
                    />
                    <span className="text-sm">
                      Standard (5-7 business days) - $0
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm">
                      Express (2-3 business days) - $9.99
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm">
                      Overnight (1 business day) - $19.99
                    </span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleNextFromDelivery}
                  className="mt-4 w-full bg-black text-white py-2 rounded text-sm"
                >
                  Next: Review & Pay
                </button>
              </div>
            )}
          </div>

          {/* 03 Review & Pay */}
          <div className="bg-white rounded-md shadow p-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsReviewOpen(!isReviewOpen)}
            >
              <h2 className="text-lg font-semibold">03 Review &amp; Pay</h2>
              <button className="text-xl">{isReviewOpen ? '-' : '+'}</button>
            </div>
            {isReviewOpen && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-4">
                  最后确认你的订单并选择支付方式
                </p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="h-4 w-4 accent-blue-600"
                      defaultChecked
                    />
                    <span className="text-sm">Credit Card</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm">PayPal</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="mt-4 w-full bg-black text-white py-2 rounded text-sm"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：购物车详情 */}
        <div className="w-[320px] xl:w-[400px] bg-white rounded-md shadow p-4 h-fit">
          <h2 className="text-lg font-semibold mb-4">Your Order</h2>
          <div className="space-y-4">
            {mockCartItems.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{item.name}</p>
                  {item.edition && (
                    <p className="text-gray-500">{item.edition}</p>
                  )}
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-300 mt-4 pt-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
