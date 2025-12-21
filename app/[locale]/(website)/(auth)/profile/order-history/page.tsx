'use client';
import React, { useEffect, useState } from 'react';
import useUserStore from '@/stores/userStore';
import OrderHistoryCard from './components/OrderHistoryCard';
import { useTranslations } from 'next-intl';
import { OrderDetail, statusLabelMap } from '@/types/order';
import ReviewAndPay from '../../../(orders)/checkout/components/ReviewAndPay';

const OrderHistory = () => {
  const {orderList, fetchOrderList, orderStatusMapping} = useUserStore();
  const t = useTranslations('orderHistory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail|null>(null);

  const filteredOrders = activeTab === 'all' 
    ? orderList 
    : orderList.filter(order => orderStatusMapping?.[order.status] === activeTab);

  const tabs = [
    { 
      id: 'all', 
      label: t(statusLabelMap.all), 
      count: orderList.length 
    },
    { 
      id: 'unpaid', 
      label: t(statusLabelMap.unpaid), 
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'unpaid').length 
    },
    { 
      id: 'processing', 
      label: t(statusLabelMap.processing), 
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'processing').length 
    },
    { 
      id: 'confirmed', 
      label: t(statusLabelMap.confirmed), 
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'confirmed').length 
    },
    { 
      id: 'shipping', 
      label: t(statusLabelMap.shipping), 
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'shipping').length 
    },
    { 
      id: 'completed', 
      label: t(statusLabelMap.completed), 
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'completed').length 
    },
    { 
      id: 'closed', 
      label: t(statusLabelMap.closed), 
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'closed').length 
    },
  ];

  const handlePayment = (orderDetail: OrderDetail) => {
    setSelectedOrderDetail(orderDetail);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        fetchOrderList();
      } catch (err) {
        setError(t('failedToLoadOrders'));
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-8">{t('loadingOrders')}</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (orderList.length === 0) return <div className="text-center py-8">{t('noOrdersFound')}</div>;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-[12px] py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-normal text-gray-900">{t('title')}</h1>
        </div>

        {/* Tab Navigation */}
        <div className="relative mb-6">
          {/* Left Shadow Gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          
          {/* Right Shadow Gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable Tab Container */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex border-b border-gray-200 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-none cursor-pointer px-6 py-3 text-sm whitespace-nowrap
                    transition-colors duration-200
                    ${activeTab === tab.id 
                      ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                      : 'text-gray-600 hover:text-gray-800 border-b-2 border-transparent'
                    }
                  `}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        <style jsx global>{`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          /* Hide scrollbar for IE, Edge and Firefox */
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>

        {/* Order List */}
        <div className="space-y-[12px]">
          {filteredOrders.map((order) => (
            <OrderHistoryCard handlePayment={handlePayment} showStatus={activeTab==='all'} key={order.id} orderDetail={order} />
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedOrderDetail && (
        <>
        <div className='fixed h-full w-full bottom-0 left-0 bg-black/50 z-100' onClick={()=>setSelectedOrderDetail(null)}></div>
        <div className='fixed bottom-0 left-0 w-full z-200 max-h-full overflow-y-auto md:w-[600px] md:h-[620px] right-0 mx-auto md:top-[50%] md:-translate-y-1/2'>
          <span className='absolute top-5 right-5 text-2xl cursor-pointer' onClick={()=>setSelectedOrderDetail(null)}>X</span>
          <ReviewAndPay orderDetail={selectedOrderDetail} />
        </div>
        </>
      )}

    </div>
  );
};

export default OrderHistory;