export const EMPTY_ADDRESS = {
  id: '',
  email: '',
  first_name: '',
  last_name: '',
  street: '',
  city: '',
  postal_code: '',
  country: '',
  state: '',
  phone: '',
  is_default: false
}

export interface Address {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  state?: string;
  phone?: string;
  is_default:boolean;
}

export function formatAddress(address:Address) {
  if (!address) return '';
  return `${address.street} \n ${address.city}  ${address.postal_code} \n ${address.country}`
}