'use client';
import React, { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  format?: string;
  box?: string;
  image: string;
  price: number;
  quantity: number;
}

const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: 'Book name',
    box: 'Premium Jumbo Hardcover',
    format: 'Festive Gift Box',
    image: '/book.png',
    price: 159.99,
    quantity: 1,
  },
  {
    id: 2,
    name: 'Book name',
    box: 'Softcover Book',
    format: 'Standard Edition',
    image: '/book.png',
    price: 39.99,
    quantity: 1,
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
  const [billingErrors, setBillingErrors] = useState<{
    billingEmail?: string;
    billingFirstName?: string;
    billingLastName?: string;
    billingAddress?: string;
  }>({});

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
    if (!email) newErrors.email = 'Required';
    if (!firstName) newErrors.firstName = 'Required';
    if (!lastName) newErrors.lastName = 'Required';
    if (!address) newErrors.address = 'Required';
    if (!city) newErrors.city = 'Required';
    if (!zip) newErrors.zip = 'Required';
    if (!country) newErrors.country = 'Required';
    if (!state) newErrors.state = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    // 如果需要单独填写账单地址，则校验 Billing 字段
    if (needsBillingAddress) {
      let newBillingErrors: {
        billingEmail?: string;
        billingFirstName?: string;
        billingLastName?: string;
        billingAddress?: string;
      } = {};
      if (!billingEmail) newBillingErrors.billingEmail = 'Required';
      if (!billingFirstName) newBillingErrors.billingFirstName = 'Required';
      if (!billingLastName) newBillingErrors.billingLastName = 'Required';
      if (!billingAddress) newBillingErrors.billingAddress = 'Required';

      if (Object.keys(newBillingErrors).length > 0) {
        setBillingErrors(newBillingErrors);
        return;
      }
      setBillingErrors({});
    }

    // 校验通过，隐藏 Shipping 部分，显示 Delivery 部分
    setShippingCompleted(true);
    setIsShippingOpen(false);
    setIsDeliveryOpen(true);
  };

  const handleNextFromDelivery = () => {
    setDeliveryCompleted(true);
    setIsDeliveryOpen(false);
    setIsReviewOpen(true);
  };

  const handlePlaceOrder = () => {
    if (!selectedPaymentOption) {
      alert("Please select a payment method before placing your order.");
      return;
    }

    alert('Order submitted!');
  };

  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<"Standard" | "Express">("Standard");
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<"card" | "paypal" | null>(null);
  
  const [shippingCompleted, setShippingCompleted] = useState(false);
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  //const [paymentCompleted, setPaymentCompleted] = useState(false);


  return (
    <div className="flex-grow">
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
              <button className="p-2">
                {isShippingOpen ? (
                  // 当打开时显示减号图标
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8H14"
                      stroke="#222222"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  // 当关闭时显示加号图标
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 2V14"
                      stroke="#222222"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 8H14"
                      stroke="#222222"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            {isShippingOpen && (
              <div className="rounded-[4px]">
                <div>
                  <form className="bg-white p-6 space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-medium font-medium text-[#222222]">
                        Email address
                      </label>
                      <input
                        type="email"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Enter your email"
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
                        <label className="block text-medium font-medium text-[#222222]">
                          First name
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                          placeholder="Enter your first name"
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
                        <label className="block text-medium font-medium text-[#222222]">
                          Last name
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                          placeholder="Enter your last name"
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
                      <label className="block text-medium font-medium text-[#222222]">
                        Address
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Enter your address"
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
                      <label className="block text-medium font-medium text-[#222222]">
                        Apt, Building, ETC
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Enter your apartment/building/etc."
                        value={apt}
                        onChange={(e) => setApt(e.target.value)}
                      />
                    </div>
                    {/* City & ZIP */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-medium font-medium text-[#222222]">
                          Town/City
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                          placeholder="Enter your city"
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
                        <label className="block text-medium font-medium text-[#222222]">
                          ZIP/Postcode
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                          placeholder="Enter your ZIP code"
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
                        <label className="block text-medium font-medium text-[#222222]">
                          Country
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                          placeholder="Enter your country"
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
                        <label className="block text-medium font-medium text-[#222222]">
                          State/Province
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                          placeholder="Enter your state/province"
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
                      <label className="block text-medium font-medium text-[#222222]">
                        Phone number (optional)
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <p className="text-[#999999] text-l mt-1">
                        Get free updates on where your parcel is
                      </p>
                    </div>
                  </form>
                
                
                  {/* Billing 地址区域 */}
                  <div className="bg-white p-6 mt-4">
                    <p className="text-medium font-medium mb-2">
                      Bills need to be sent to a new address?
                    </p>
                    <div className="flex items-center gap-6">
                      {/* "no need" 选项 */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="billing"
                          value="no"
                          checked={!needsBillingAddress}
                          onChange={() => setNeedsBillingAddress(false)}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center ${
                            !needsBillingAddress ? "bg-[#012CCE] border-transparent" : ""
                          }`}
                        >
                          {!needsBillingAddress && (
                            <svg
                              width="10"
                              height="8"
                              viewBox="0 0 12 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1.5 3.5L5 7L11 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-l">no need</span>
                      </label>

                      {/* "yes" 选项 */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="billing"
                          value="yes"
                          checked={needsBillingAddress}
                          onChange={() => setNeedsBillingAddress(true)}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center ${
                            needsBillingAddress ? "bg-[#012CCE] border-transparent" : ""
                          }`}
                        >
                          {needsBillingAddress && (
                            <svg
                              width="10"
                              height="8"
                              viewBox="0 0 12 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1.5 3.5L5 7L11 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-l">yes</span>
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
                            placeholder="Enter your billing email"
                            value={billingEmail}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBillingEmail(val);
                              if (val) {
                                setBillingErrors((prev) => ({ ...prev, billingEmail: undefined }));
                              }
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                          />
                          {billingErrors.billingEmail && (
                            <p className="text-red-500 text-sm mt-1">{billingErrors.billingEmail}</p>
                          )}
                        </div>
                        {/* Billing First & Last Name */}
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              First Name
                            </label>
                            <input
                              type="text"
                              placeholder="Enter your billing first name"
                              value={billingFirstName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBillingFirstName(val);
                                if (val) {
                                  setBillingErrors((prev) => ({ ...prev, billingFirstName: undefined }));
                                }
                              }}
                              className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                            />
                            {billingErrors.billingFirstName && (
                              <p className="text-red-500 text-sm mt-1">{billingErrors.billingFirstName}</p>
                            )}
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Last Name
                            </label>
                            <input
                              type="text"
                              placeholder="Enter your billing last name"
                              value={billingLastName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBillingLastName(val);
                                if (val) {
                                  setBillingErrors((prev) => ({ ...prev, billingLastName: undefined }));
                                }
                              }}
                              className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                            />
                            {billingErrors.billingLastName && (
                              <p className="text-red-500 text-sm mt-1">{billingErrors.billingLastName}</p>
                            )}
                          </div>
                        </div>
                        {/* Billing Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Billing Address
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your billing address"
                            value={billingAddress}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBillingAddress(val);
                              if (val) {
                                setBillingErrors((prev) => ({ ...prev, billingAddress: undefined }));
                              }
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                          />
                          {billingErrors.billingAddress && (
                            <p className="text-red-500 text-sm mt-1">{billingErrors.billingAddress}</p>
                          )}
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
            <div>
              <div className="flex justify-between items-center cursor-pointer border-t pt-4 border-[#E5E5E5]"
                onClick={() => {
                  if (shippingCompleted) {
                    setIsDeliveryOpen(!isDeliveryOpen);
                  } else {
                    alert("Please fill in Shipping information first");
                  }
                }}
              >
                <h2 className={`text-2xl ${!shippingCompleted ? 'text-[#999999]' : ''}`}>02 Delivery</h2>
                {shippingCompleted && (
                  <button className="p-2">
                    {isDeliveryOpen ? (
                      // 当打开时显示减号图标
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 8H14"
                          stroke="#222222"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      // 当关闭时显示加号图标
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 2V14"
                          stroke="#222222"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 8H14"
                          stroke="#222222"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              {isDeliveryOpen && (
                <div className="mt-4 space-y-4 text-center">
                  {/* 第一个配送选项：Standard */}
                  <label className="p-6 rounded-[4px] bg-white flex flex-col gap-1">
                    {/* 第一行：左侧为按钮和标题，右侧为价格 */}
                    <div className="flex justify-between items-center">
                      {/* 左侧按钮和标题 */}
                      <div className="flex flex-row gap-3 items-center">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          className="sr-only" 
                          checked={selectedDeliveryOption === "Standard"}
                          onChange={() => setSelectedDeliveryOption("Standard")}
                        />
                        <div
                          className={`w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center ${
                            selectedDeliveryOption === "Standard" ? "bg-[#012CCE] border-transparent" : ""
                          }`}
                        >
                          {selectedDeliveryOption === "Standard" && (
                            <svg
                              width="12"
                              height="8"
                              viewBox="0 0 12 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1.5 3.5L5 7L11 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-[18px] font-medium">Standard</span>
                      </div>
                      {/* 右侧价格 */}
                      <span className="text-[18px] font-medium">$19.99 USD</span>
                    </div>

                    {/* 第二部分：配送详情 */}
                    <div className="px-8 flex-1 flex flex-col gap-1">
                      <div className="flex flex-row gap-1">
                        <p className="text-l font-normal text-[#222222]">
                          Estimated delivery:
                        </p>
                        <p className="text-l font-medium text-[#012CCE]">
                          December 10 2024
                        </p>
                      </div>
                      <p className="text-l text-[#999999] flex">
                        Delivered by your trusty postperson with the speed and reliability you&apos;re used to.
                      </p>
                    </div>
                  </label>
 

                  {/* 第二个配送选项：Express */}
                  <label className="p-6 rounded-[4px] bg-white flex flex-col gap-1">
                    {/* 第一行：左侧为按钮和标题，右侧为价格 */}
                    <div className="flex justify-between items-center">
                      {/* 左侧按钮和标题 */}
                      <div className="flex flex-row gap-3 items-center">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          className="sr-only" 
                          checked={selectedDeliveryOption === "Express"}
                          onChange={() => setSelectedDeliveryOption("Express")}
                        />
                        <div
                          className={`w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center ${
                            selectedDeliveryOption === "Express" ? "bg-[#012CCE] border-transparent" : ""
                          }`}
                        >
                          {selectedDeliveryOption === "Express" && (
                            <svg
                              width="12"
                              height="8"
                              viewBox="0 0 12 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1.5 3.5L5 7L11 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-[18px] font-medium">Express</span>
                      </div>
                      {/* 右侧价格 */}
                      <span className="text-[18px] font-medium">$19.99 USD</span>
                    </div>
                    {/* 第二部分：配送详情 */}
                    <div className="px-8 flex-1 flex flex-col gap-1">
                      <div className="flex flex-row gap-1">
                        <p className="text-l font-normal text-[#222222]">
                          Estimated delivery:
                        </p>
                        <p className="text-l font-medium text-[#012CCE]">
                          December 7 2024
                        </p>
                      </div>
                      <p className="text-l text-[#999999] flex">
                        So speedy, it'll get to you much faster than standard delivery.
                      </p>
                      <p className="text-l text-[#999999] flex">
                        Plus, you can follow your parcel online. (Delivered by UPS Ground so no PO Boxes please)
                      </p>
                    </div>
                  </label>

                  {/* 按钮 */}
                  <button
                      onClick={handleNextFromDelivery}
                      className="bg-black text-white px-4 py-2 rounded text-sm"
                    >
                    continue to payment
                  </button>
                </div>
              )}
            </div>

            {/* 03 Review & Pay */}
            <div>
              <div
                className="flex justify-between items-center cursor-pointer border-t pt-4 border-[#E5E5E5]"
                onClick={() => {
                  if (deliveryCompleted) {
                    setIsReviewOpen(!isReviewOpen);
                  } else {
                    alert("Please fill in delivery information first");
                  }
                }}
              >
                <h2 className={`text-2xl ${!deliveryCompleted ? 'text-[#999999]' : ''}`}>03 Review &amp; Pay</h2>
                {deliveryCompleted && (
                  <button className="p-2">
                    {isReviewOpen ? (
                      // 当打开时显示减号图标
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 8H14"
                          stroke="#222222"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      // 当关闭时显示加号图标
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 2V14"
                          stroke="#222222"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 8H14"
                          stroke="#222222"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              {isReviewOpen && (
                <div className="mt-4 space-y-4 text-center">
                  {/* detail*/}
                  <div className="p-6 rounded-[4px] bg-white flex flex-col gap-1">
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex flex-row gap-1">
                        <p className="flex text-l w-[64px] text-[#999999]">
                          Contact
                        </p>
                        <p className="text-l text-[#222222]">
                          15574892055@163.com
                        </p>
                      </div>
                      <div className="flex flex-row gap-1">
                        <p className="flex text-l w-[64px] text-[#999999]">
                          Ship to
                        </p>
                        <p className="text-l text-[#222222]">
                          szzckduydskj, s, 400000, adxcuix7ds, United States
                        </p>
                      </div>
                      <div className="flex flex-row gap-1">
                        <p className="flex text-l w-[64px] text-[#999999]">
                          Delivery
                        </p>
                        <p className="text-l text-[#222222]">
                          Standard (Get it by Tuesday, December 10)
                        </p>
                      </div>
                    </div>
                  </div>
                
                  <div className="p-6 rounded-[4px] bg-white flex flex-col gap-1">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="sr-only" 
                          checked={selectedPaymentOption === "card"}
                          onChange={() => setSelectedPaymentOption("card")}
                        />
                        <div
                          className={`w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center ${
                            selectedPaymentOption === "card" ? "bg-[#012CCE] border-transparent" : ""
                          }`}
                        >
                          {selectedPaymentOption === "card" && (
                            <svg
                              width="12"
                              height="8"
                              viewBox="0 0 12 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1.5 3.5L5 7L11 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-l">Credit Card</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="sr-only" 
                          checked={selectedPaymentOption === "paypal"}
                          onChange={() => setSelectedPaymentOption("paypal")}
                        />
                        <div
                          className={`w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center ${
                            selectedPaymentOption === "paypal" ? "bg-[#012CCE] border-transparent" : ""
                          }`}
                        >
                          {selectedPaymentOption === "paypal" && (
                            <svg
                              width="12"
                              height="8"
                              viewBox="0 0 12 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1.5 3.5L5 7L11 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-l">PayPal</span>
                      </label>
                    </div>
                  </div>
                  <p className="text-sm text-[#999999] mb-4">
                    Complete your payment with one of our secure checkout methods.
                  </p>
                  <button
                      onClick={handlePlaceOrder}
                      className="bg-black text-white px-4 py-2 rounded text-sm"
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
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1 flex flex-col text-sm gap-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.box && <p className="text-gray-500">{item.format}</p>}
                    <p className="text-gray-500">{item.box}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">${(item.price).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E5E5E5] mt-4 pt-4 text-sm space-y-2">
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
            <div className="border-t border-[#E5E5E5] flex justify-between font-bold text-base pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>    
          </div>
        </div>
      </div>
    </div>
  );
}
