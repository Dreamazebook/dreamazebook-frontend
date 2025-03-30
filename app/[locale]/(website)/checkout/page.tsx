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
  const [subscribe, setSubscribe] = useState(false);

  // Billing 表单字段
  const [billingEmail, setBillingEmail] = useState('');
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  // 是否需要单独填写账单地址
  const [needsBillingAddress, setNeedsBillingAddress] = useState(false);

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
    <div className="min-h-screen">
      <div className="mx-auto flex flex-row">
        {/* 左侧：Back 区域和 Shipping / Delivery / Review & Pay */}
        <div className="flex-1 min-w-0 bg-gray-50 flex flex-col gap-6">
          {/* Back 区域 */}
          <div className="py-12 pb-6 pl-[120px] border-b border-black">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-[#222222] flex items-center gap-2"
            >
              <svg
                width="17"
                height="10"
                viewBox="0 0 17 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17 5H1M1 5L5.5 1M1 5L5.5 9" stroke="#222222"/>
              </svg>
              Back
            </button>
          </div>

          {/* Shipping / Delivery / Review & Pay */}
          <div className="flex flex-col pl-[120px] pr-[64px] py-4 bg-gray-50 gap-4">
            {/* 01 Shipping */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsShippingOpen(!isShippingOpen)}
            >
              <div className="flex items-center gap-4">
                <h2 className="text-2xl">01 Shipping</h2>
                <p className="text-sm text-gray-600">
                  已有账号？{' '}
                  <a href="#" className="text-blue-600 underline">
                    登录
                  </a>{' '}
                  快速结账
                </p>
              </div>
              <button className="text-xl">{isShippingOpen ? '-' : '+'}</button>
            </div>
            {isShippingOpen && (
              <div className="rounded-[4px]">
                <div>
                  <form className="bg-white p-6 space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-[#222222]">
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
                      {/* 提示文本 */}
                      <p className="text-[#999999] text-sm mt-1">
                        We will confirm the final effect of the book with you and update you on
                        the status of your order
                      </p>

                      {/* 单选按钮 + 文本（可改成复选按钮或普通按钮） */}
                      <label className="flex items-center gap-2 text-sm text-[#999999]">
                        <input
                          type="radio"
                          checked={subscribe}
                          onChange={() => setSubscribe(true)}
                          className="h-5 w-5 accent-blue-600"
                        />
                        email me with news and offers
                      </label>
                    </div>
                    {/* First name & Last name */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[#222222]">
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
                        <label className="block text-sm font-medium text-[#222222]">
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
                      <label className="block text-sm font-medium text-[#222222]">
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
                      <label className="block text-sm font-medium text-[#222222]">
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
                        <label className="block text-sm font-medium text-[#222222]">
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
                        <label className="block text-sm font-medium text-[#222222]">
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
                        <label className="block text-sm font-medium text-[#222222]">
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
                        <label className="block text-sm font-medium text-[#222222]">
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
                      <label className="block text-sm font-medium text-[#222222]">
                        Phone number (optional)
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="请输入电话"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <p className="text-[#999999] text-sm mt-1">
                        Get free updates on where your parcel is
                      </p>
                    </div>
                  </form>
                
                
                  {/* Billing 地址区域 */}
                  <div className="bg-white p-6 gap-6 mt-4 bg-white">
                    <p className="text-sm font-medium mb-2">
                      Bills need to be sent to a new address?
                    </p>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio"
                          name="billing"
                          value="no"
                          checked={!needsBillingAddress}
                          onChange={() => setNeedsBillingAddress(false)}
                          className="h-5 w-5 accent-blue-600"
                        />
                        <span>no need</span>
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio"
                          name="billing"
                          value="yes"
                          checked={needsBillingAddress}
                          onChange={() => setNeedsBillingAddress(true)}
                          className="h-5 w-5 accent-blue-600"
                        />
                        <span>yes</span>
                      </label>
                    </div>

                    {needsBillingAddress && (
                      <div className="mt-4 space-y-4">
                        {/* Billing Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Billing Email
                          </label>
                          <input
                            type="email"
                            placeholder="请输入账单邮箱"
                            value={billingEmail}
                            onChange={(e) => setBillingEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                          />
                        </div>
                        {/* Billing First & Last Name */}
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              First Name
                            </label>
                            <input
                              type="text"
                              placeholder="请输入名"
                              value={billingFirstName}
                              onChange={(e) => setBillingFirstName(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Last Name
                            </label>
                            <input
                              type="text"
                              placeholder="请输入姓"
                              value={billingLastName}
                              onChange={(e) => setBillingLastName(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                            />
                          </div>
                        </div>
                        {/* Billing Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Billing Address
                          </label>
                          <input
                            type="text"
                            placeholder="请输入账单地址"
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 继续按钮 */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 mb-2">
                      By clicking Continue, you agree to our{" "}
                      <a href="#" className="text-blue-600 underline mx-1">
                        terms & conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-blue-600 underline ml-1">
                        privacy policy
                      </a>
                    </p>
                    <button
                      onClick={handleNextFromShipping}
                      className="bg-black text-white px-4 py-2 rounded text-sm"
                    >
                      continue to delivery
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 02 Delivery */}
            <div className="rounded-md shadow p-4">
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
            <div className="rounded-md shadow p-4">
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
        </div>

        {/* 右侧：订单详情（价格明细） */}
        <div className="w-[544px] bg-white border-l border-black p-12 !pr-[120px] gap-[10px] flex flex-col">
          <div className="space-y-4">
            {/* 订单商品列表 */}
            {mockCartItems.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{item.name}</p>
                  {item.edition && <p className="text-gray-500">{item.edition}</p>}
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
