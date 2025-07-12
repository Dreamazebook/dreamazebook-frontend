export interface CartItem {
  id: number;
  name: string;
  format?: string;
  box?: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  state?: string;
}

export interface BillingErrors {
  billingEmail?: string;
  billingFirstName?: string;
  billingLastName?: string;
  billingAddress?: string;
}

export type DeliveryOption = "Standard" | "Express";
export type PaymentOption = "card" | "paypal" | null;