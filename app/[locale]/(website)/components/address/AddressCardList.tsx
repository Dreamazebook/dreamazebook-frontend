import { Address } from "@/types/address";
import AddressCard from "./AddressCard";

interface AddressCardListProps {
  addressList: Address[];
  handleDeleteAddress?: (id: string | undefined) => void;
  handleEditAddress?: (address: Address) => void;
  handleClickAddress?: (address: Address) => void;
}

export default function AddressCardList({ addressList, handleDeleteAddress,handleEditAddress,handleClickAddress }: AddressCardListProps) {
  const addressListHTML = addressList.map((address) => (
    <AddressCard key={address.id} address={address} handleDeleteAddress={handleDeleteAddress} handleEditAddress={handleEditAddress} handleClickAddress={handleClickAddress}/>
  ));
  return addressListHTML;
}