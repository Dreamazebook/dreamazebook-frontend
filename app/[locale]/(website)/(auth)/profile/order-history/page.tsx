'use client';
import React, { useEffect, useState } from 'react';
import useUserStore from '@/stores/userStore';
import OrderHistoryCard from './components/OrderHistoryCard';
import { useTranslations } from 'next-intl';
import { OrderDetail } from '@/types/order';
import ReviewAndPay from '../../../(orders)/checkout/components/ReviewAndPay';
import { useAddressModal } from '@/hooks/useAddressModal';
import AddressEditModal from '../../../components/component/AddressEditModal';

const OrderHistory = () => {
  const {orderList, fetchOrderList, orderStatusMapping} = useUserStore();
  const t = useTranslations('orderHistory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderDetailForPayment, setSelectedOrderDetailForPayment] = useState<OrderDetail | null>(null);

  // Use address modal hook
  const {
    showAddressModal,
    selectedOrderDetail,
    address,
    setAddress,
    openAddressModal,
    closeAddressModal,
    updateShippingAddress,
  } = useAddressModal({
    onAddressUpdated: async () => {
      // Refresh order list after address update
      await fetchOrderList();
    }
  });

  const filteredOrders = activeTab === 'all' 
    ? orderList 
    : orderList.filter(order => orderStatusMapping?.[order.status] === activeTab);

  const tabs = [
    {
      id: 'all',
      label: t('allOrder'),
      count: orderList.length
    },
    {
      id: 'unpaid',
      label: t('unpaid'),
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'unpaid').length
    },
    {
      id: 'processing',
      label: t('digitalProduction'),
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'processing').length
    },
    {
      id: 'confirmed',
      label: t('printProduction'),
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'confirmed').length
    },
    {
      id: 'shipping',
      label: t('inTransit'),
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'shipping').length
    },
    {
      id: 'completed',
      label: t('delivered'),
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'completed').length
    },
    {
      id: 'closed',
      label: t('closed'),
      count: orderList.filter(order => orderStatusMapping?.[order.status] === 'closed').length
    },
  ];

  const openPaymentModal = (orderDetail: OrderDetail) => {
    setShowPaymentModal(true);
    setSelectedOrderDetailForPayment(orderDetail);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedOrderDetailForPayment(null);
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
      <div className="max-w-[1200px] mx-auto py-8 px-[16px] md:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-normal text-gray-900">{t('title')}</h1>
        </div>

        {/* Tab Navigation */}
        <div className="relative mb-6">
          {/* Scrollable Tab Container */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max gap-[32px]">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-none cursor-pointer text-[16px] whitespace-nowrap
                    transition-colors duration-200
                    ${activeTab === tab.id 
                      ? 'text-[#222222] border-b-2 border-primary font-medium' 
                      : 'text-[#666666] border-b-2 border-transparent'
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
            <OrderHistoryCard
              openModal={openPaymentModal}
              openAddressModal={openAddressModal}
              showStatus={activeTab==='all'}
              key={order.id}
              orderDetail={order}
            />
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedOrderDetailForPayment && (
        <>
          <div
            className='fixed h-full w-full bottom-0 left-0 bg-black/50 z-100'
            onClick={closePaymentModal}
          ></div>
          <div className='fixed bottom-0 rounded left-0 w-full z-200 max-h-full bg-white p-[24px] overflow-y-auto md:w-[600px] md:h-[620px] right-0 mx-auto md:top-[50%] md:-translate-y-1/2'>
            <span className='absolute top-3 right-3 text-xl cursor-pointer' onClick={closePaymentModal}>X</span>
            <ReviewAndPay orderDetail={selectedOrderDetailForPayment} />
          </div>
        </>
      )}

      {/* Address Edit Modal */}
      <AddressEditModal
        show={showAddressModal}
        orderDetail={selectedOrderDetail}
        address={address}
        setAddress={setAddress}
        updateShippingAddress={updateShippingAddress}
        onClose={closeAddressModal}
      />
    </div>
  );
};

export default OrderHistory;