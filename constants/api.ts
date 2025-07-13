export const API_DOMAIN = process.env.NEXT_PUBLIC_API_URL || 'https://api.dreamazebook.com/api';

export const API_USER_REGISTER = API_DOMAIN + '/auth/register';

export const API_USER_LOGIN = API_DOMAIN + '/auth/login';

export const API_USER_SEND_PASSWORD_RESET_EMAIL = API_DOMAIN + '/auth/forgot-password';

export const API_USER_CURRENT = API_DOMAIN + '/auth/me';

export const API_CART_LIST = API_DOMAIN + '/cart/list';