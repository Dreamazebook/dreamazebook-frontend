export const API_DOMAIN = process.env.NEXT_PUBLIC_API_URL || 'https://api.dreamazebook.com/api';

export const API_USER_REGISTER = API_DOMAIN + '/auth/register';

export const API_USER_LOGIN = API_DOMAIN + '/auth/login';
export const API_USER_LOGOUT = API_DOMAIN + '/auth/logout';

export const API_USER_SEND_PASSWORD_RESET_EMAIL = API_DOMAIN + '/auth/forgot-password';

export const API_USER_CURRENT = API_DOMAIN + '/auth/me';

export const API_CART_LIST = API_DOMAIN + '/cart/list';
export const API_CART_CREATE = API_DOMAIN + '/cart/create';
export const API_CART_REMOVE = API_DOMAIN + '/cart/remove';
export const API_CART_UPDATE = API_DOMAIN + '/cart/update';

export const API_ORDER_LIST = API_DOMAIN + '/order/list';
export const API_ORDER_CREATE = API_DOMAIN + '/order/create';
export const API_ORDER_DETAIL = API_DOMAIN + '/order/detail';
export const API_ORDER_UPDATE_ADDRESS = API_DOMAIN + '/order/update-address'
export const API_ORDER_REMOVE = API_DOMAIN + '/order/remove';

export const API_ADDRESS_LIST = API_DOMAIN + '/addresses';


export const API_CREATE_STRIPE_PAYMENT = API_DOMAIN + '/stripe/create-payment-intent'


export const API_ADMIN_USERS = API_DOMAIN + '/admin/users'