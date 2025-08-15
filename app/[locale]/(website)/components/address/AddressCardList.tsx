import { Address } from "@/types/address";
import AddressCard from "./AddressCard";

interface AddressCardListProps {
  addressList: Address[];
  handleDeleteAddress(id: string | undefined): void;
}

export default function AddressCardList({ addressList, handleDeleteAddress }: AddressCardListProps) {
  const addressListHTML = addressList.map((address) => (
    <AddressCard key={address.id} address={address} handleDeleteAddress={handleDeleteAddress}/>
  ));
  return addressListHTML;
}