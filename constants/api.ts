export const API_DOMAIN = process.env.NEXT_PUBLIC_API_URL || 'https://api.dreamazebook.com/api';

export const API_USER_REGISTER = API_DOMAIN + '/auth/register';

export const API_USER_LOGIN = API_DOMAIN + '/auth/login';
export const API_USER_LOGOUT = API_DOMAIN + '/auth/logout';

export const API_USER_SEND_PASSWORD_RESET_EMAIL = API_DOMAIN + '/auth/forgot-password';

export const API_USER_CURRENT = API_DOMAIN + '/auth/me';
export const API_USER_PROFILE = API_DOMAIN + '/auth/profile';

export const API_CART_LIST = API_DOMAIN + '/cart/list';
export const API_CART_CREATE = API_DOMAIN + '/cart/create';
export const API_CART_REMOVE = API_DOMAIN + '/cart/remove';
export const API_CART_UPDATE = API_DOMAIN + '/cart/update';

export const API_ORDER_LIST = API_DOMAIN + '/order/list';
export const API_ORDER_CREATE = API_DOMAIN + '/order/create';
export const API_ORDER_DETAIL = API_DOMAIN + '/order/detail';
export const API_ORDER_UPDATE_ADDRESS = API_DOMAIN + '/order/update-address'
export const API_ORDER_UPDATE_MESSAGE = API_DOMAIN + '/order/update-message'
export const API_ORDER_REMOVE = API_DOMAIN + '/order/remove';
export const API_ORDER_PROGRESS = API_DOMAIN + '/order/processing-progress';
export const API_ORDER_SHIPPING_METHODS = API_DOMAIN + '/order/shipping-methods';
export const API_ORDER_UPDATE_SHIPPING = API_DOMAIN + '/order/select-shipping';
export const API_ORDER_STRIPE_PAID = API_DOMAIN + '/stripe/confirm-payment';

export const API_ADDRESS_LIST = API_DOMAIN + '/addresses';


export const API_CREATE_STRIPE_PAYMENT = API_DOMAIN + '/stripe/create-payment-intent'


export const API_ADMIN_LOGIN = API_DOMAIN + '/admin/login'
export const API_ADMIN_USERS = API_DOMAIN + '/admin/users'
export const API_ADMIN_ORDERS = API_DOMAIN + '/admin/orders'

export const API_PICBOOKS = API_DOMAIN + '/picbooks'
export const API_PICBOOK_DETAIL = (id: string | number) => `${API_PICBOOKS}/${id}`