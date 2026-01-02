import AddressForm from "../../(orders)/checkout/components/AddressForm";
import { OrderDetail } from "@/types/order";
import { Address } from "@/types/address";

interface AddressEditModalProps {
  show: boolean;
  orderDetail: OrderDetail | null;
  address: Address;
  setAddress: (value: React.SetStateAction<Address>) => void;
  updateShippingAddress: (orderId: string | number) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
}

const AddressEditModal = ({
  show,
  orderDetail,
  address,
  setAddress,
  updateShippingAddress,
  onClose
}: AddressEditModalProps) => {
  if (!show || !orderDetail) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed h-full w-full bottom-0 left-0 bg-black/50 z-100"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="fixed bottom-0 rounded left-0 w-full z-200 max-h-full bg-white p-[24px] overflow-y-auto md:w-[600px] md:h-[620px] right-0 mx-auto md:top-[50%] md:-translate-y-1/2">
        {/* Close Button */}
        <span
          className="absolute top-3 right-3 text-xl cursor-pointer"
          onClick={onClose}
        >
          X
        </span>

        {/* Address Form */}
        <AddressForm
          orderDetail={orderDetail}
          address={address}
          setAddress={setAddress}
          updateShippingAddress={updateShippingAddress}
        />
      </div>
    </>
  );
};

export default AddressEditModal;
