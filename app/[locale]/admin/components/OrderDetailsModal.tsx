import { FC } from 'react';
import { Order, OrderStatus, ShippingStatus } from '../types/order';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdate: (orderId: string, field: 'status' | 'shippingStatus', value: OrderStatus | ShippingStatus) => void;
}

const OrderDetailsModal: FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                <p className="mt-1 text-sm text-gray-900">{order.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                <select
                  value={order.status}
                  onChange={(e) => onStatusUpdate(order.id, 'status', e.target.value as OrderStatus)}
                  className="mt-1 text-sm border rounded p-1 w-full"
                >
                  <option value="cart">Cart</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Shipping Status</h3>
                <select
                  value={order.shippingStatus}
                  onChange={(e) => onStatusUpdate(order.id, 'shippingStatus', e.target.value as ShippingStatus)}
                  className="mt-1 text-sm border rounded p-1 w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
              <div className="mt-1 text-sm text-gray-900">
                <p>{order.customerName}</p>
                <p>{order.customerEmail}</p>
                <p>{order.shippingAddress}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Order Items</h3>
              <div className="mt-2">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.orderItems.map((item) => (
                      <tr key={item.bookId}>
                        <td className="py-2 text-sm text-gray-900">{item.title}</td>
                        <td className="py-2 text-sm text-gray-900">{item.quantity}</td>
                        <td className="py-2 text-sm text-gray-900 text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-2 text-sm text-gray-900 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="py-2 text-right font-medium">Total:</td>
                      <td className="py-2 text-right font-medium">${order.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Print Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 