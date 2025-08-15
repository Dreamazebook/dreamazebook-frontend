import { Address, formatAddress } from "@/types/address";

interface AddressCardProps {
  address: Address;
  handleDeleteAddress(id: string | undefined): void;
}

export default function AddressCard({ address, handleDeleteAddress }: AddressCardProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-gray-900 font-medium">{address.first_name}</span>
            <span className="text-gray-900">{address.email}</span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => handleDeleteAddress(address?.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                Delete
              </button>
              {/* <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                Edit
              </button> */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{formatAddress(address)}</span>
            {address?.is_default &&
              <span className="text-[#666] bg-[#F2F2F2] p-1 rounded-sm text-sm">Default</span>
            }
          </div>
        </div>
      </div>
    </div>      
  )
}