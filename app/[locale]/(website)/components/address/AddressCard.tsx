import { Address, formatAddress } from "@/types/address";

interface AddressCardProps {
  address: Address;
  handleDeleteAddress?(id: string | undefined): void;
  handleEditAddress?(address: Address): void;
  handleClickAddress?(address: Address): void;
}

export default function AddressCard({ address, handleDeleteAddress,handleEditAddress,handleClickAddress }: AddressCardProps) {
  return (
    <div className="p-6 flex justify-between items-start border-b border-gray-200 bg-[#F8F8F8]">

      <div className="cursor-pointer text-gray-900" onClick={handleClickAddress ? ()=> handleClickAddress(address) : undefined}>
        <div className="flex items-center gap-4 mb-3">
          <span className="text-gray-900 font-medium">{address.first_name}</span>
          <span className="text-gray-900">{address.email}</span>
          
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">{formatAddress(address)}</span>
          {address?.is_default &&
            <span className="text-[#666] bg-[#F2F2F2] p-1 rounded-sm text-sm">Default</span>
          }
        </div>
      </div>


      <div className="flex gap-2 ml-auto">
        {handleEditAddress && 
        <button 
          onClick={() => handleEditAddress(address)}
          className="ml-4 p-1 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
          aria-label="Edit address"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        }

        {handleDeleteAddress &&
        <button
          onClick={() => handleDeleteAddress(address?.id)}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          Delete
        </button>
        }
      </div>


    </div>      
  )
}