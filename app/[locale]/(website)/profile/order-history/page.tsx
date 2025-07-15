import React from 'react';

const OrderHistory = () => {
  const orders = [
    {
      id: "#249334545652",
      status: "已付款",
      statusColor: "text-green-600",
      shipTo: "Wuhou District, Chengdu City, Sichuan Province, China",
      orderDate: "09/11/2024",
      deliveryDate: "04/12/2024",
      qty: 1,
      price: "$59.99 USD",
      image: "https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=Product"
    },
    {
      id: "#249334545652", 
      status: "制作中",
      statusColor: "text-orange-500",
      shipTo: "Wuhou District, Chengdu City, Sichuan Province, China",
      orderDate: "09/11/2024",
      deliveryDate: null,
      qty: 6,
      price: "$59.99 USD",
      images: [
        "https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=1",
        "https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=2"
      ],
      extraCount: "+6"
    },
    {
      id: "#249348729398",
      status: "已关闭", 
      statusColor: "text-red-500",
      shipTo: "Wuhou District, Chengdu City, Sichuan Province, China",
      orderDate: "09/11/2024",
      deliveryDate: null,
      qty: 1,
      price: "$59.99 USD",
      image: "https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=Product"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-normal text-gray-900">Order History</h1>
          <div className="flex gap-3">
            <button className="px-5 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50">
              Show Invoice
            </button>
            <button className="px-5 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
              Buy now
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-0 border-b border-gray-200">
            <button className="px-0 py-3 mr-8 text-blue-600 border-b-2 border-blue-600 font-medium text-sm">
              All Order(50)
            </button>
            <button className="px-0 py-3 mr-8 text-gray-600 hover:text-gray-800 text-sm">
              Pending(10)
            </button>
            <button className="px-0 py-3 mr-8 text-gray-600 hover:text-gray-800 text-sm">
              Completed(25)
            </button>
            <button className="px-0 py-3 mr-8 text-gray-600 hover:text-gray-800 text-sm">
              Cancelled(15)
            </button>
          </div>
        </div>

        {/* Order List */}
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div key={index} className="flex gap-4 py-4">
              {/* Product Images */}
              <div className="flex-shrink-0">
                {order.images ? (
                  <div className="relative">
                    <img
                      src={order.images[0]}
                      alt="Product"
                      className="w-20 h-20 object-cover"
                    />
                    <img
                      src={order.images[1]}
                      alt="Product"
                      className="w-20 h-20 object-cover absolute -right-4 -bottom-4"
                    />
                    <div className="absolute -right-6 -bottom-2 text-sm text-gray-500">
                      {order.extraCount}
                    </div>
                  </div>
                ) : (
                  <img
                    src={order.image}
                    alt="Product"
                    className="w-20 h-20 object-cover"
                  />
                )}
              </div>

              {/* Order Details */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium text-base">{order.id}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                    <span className={`${order.statusColor} font-medium`}>{order.status}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{order.price}</span>
                </div>

                <div className="text-sm text-gray-600 mb-1">
                  <span className="text-gray-900">Ship to:</span> {order.shipTo}
                </div>

                <div className="flex gap-8 text-sm text-gray-600 mb-1">
                  <span><span className="text-gray-900">Order date:</span> {order.orderDate}</span>
                  {order.deliveryDate && (
                    <span><span className="text-gray-900">Delivery date:</span> {order.deliveryDate}</span>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <span className="text-gray-900">Qty:</span> {order.qty}
                </div>

                <div className="flex gap-6">
                  <button className="text-blue-600 hover:underline text-sm">
                    Download Invoice
                  </button>
                  <button className="text-blue-600 hover:underline text-sm">
                    Buy the Same
                  </button>
                  <button className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                    More Details
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;