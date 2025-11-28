export const API_DOMAIN = process.env.NEXT_PUBLIC_API_URL || 'https://api.dreamazebook.com/api';

export const API_USER_REGISTER = API_DOMAIN + '/register';

export const API_USER_LOGIN = API_DOMAIN + '/login';
export const API_USER_LOGOUT = API_DOMAIN + '/logout';

export const API_USER_SEND_PASSWORD_RESET_EMAIL = API_DOMAIN + '/auth/forgot-password';

export const API_USER_CURRENT = API_DOMAIN + '/user/profile';
export const API_USER_PROFILE = API_DOMAIN + '/user/profile';

export const API_CART_LIST = API_DOMAIN + '/cart';
export const API_CART_CREATE = API_DOMAIN + '/cart/create';
export const API_CART_REMOVE = API_DOMAIN + '/cart/remove';
export const API_CART_UPDATE = (id:number) => `${API_CART_LIST}/${id}`;

export const API_ORDER_LIST = API_DOMAIN + '/orders';
export const API_ORDER_CREATE = API_DOMAIN + '/checkout/create-order';
export const API_ORDER_DETAIL = (id: string | number) => `${API_ORDER_LIST}/${id}`;
export const API_ORDER_PROGRESS = (id: string | number) => `${API_ORDER_LIST}/${id}/progress`;

export const API_ORDER_UPDATE_ADDRESS = (id: string | number) => `${API_ORDER_LIST}/${id}/address`;
export const API_ORDER_UPDATE_MESSAGE = API_DOMAIN + '/order/update-message'
export const API_ORDER_REMOVE = API_DOMAIN + '/order/remove';

export const API_ORDER_SHIPPING_METHODS = API_DOMAIN + '/order/shipping-methods';
export const API_ORDER_UPDATE_SHIPPING = (id: string | number) => `${API_ORDER_LIST}/${id}/shipping-method`;
export const API_ORDER_STRIPE_PAID = API_DOMAIN + '/stripe/confirm-payment';

export const API_ADDRESS_LIST = API_DOMAIN + '/user/addresses';
export const API_ADDRESS_DETAIL = (id: string | number) => `${API_ADDRESS_LIST}/${id}`;
export const API_COUNTRY_LIST = API_DOMAIN + '/shipping/countries';

export const API_SHIPPING_ESTIMATE = API_DOMAIN + '/shipping/prices';


export const API_CREATE_STRIPE_PAYMENT = API_DOMAIN + '/stripe/create-payment-intent'


export const API_ADMIN_LOGIN = API_DOMAIN + '/admin/login';

export const API_ADMIN_USERS = API_DOMAIN + '/admin/users';
export const API_ADMIN_ROLES = API_DOMAIN + '/admin/roles';
export const API_ADMIN_ASSIGN_USER_ROLES = (userId: number) => `${API_DOMAIN}/admin/user-roles/${userId}/roles`;
export const API_ADMIN_PERMISSIONS = API_DOMAIN + '/admin/permissions';

export const API_ADMIN_ORDERS = API_DOMAIN + '/admin/orders'
export const API_ADMIN_ORDER_DETAIL = (id: string | number) => `${API_ADMIN_ORDERS}/${id}`
export const API_ADMIN_ORDER_DETAIL_MANUAL_CONFIRM = (id: string | number) => `${API_ADMIN_ORDER_DETAIL(id)}/manual-confirm`
export const API_ADMIN_ORDER_DOWNLOAD_IMAGES = '/api/admin/orders/download-images'


export const API_ADMIN_LOGSTICS = API_DOMAIN + '/admin/logistics'
export const API_ADMIN_LOGSTIC_DETAIL = (id: string | number) => `${API_ADMIN_LOGSTICS}/${id}`

export const API_ADMIN_PICBOOKS = API_DOMAIN + '/admin/picbooks'
export const API_ADMIN_PICBOOK_DETAIL = (id: string | number) => `${API_ADMIN_PICBOOKS}/${id}`

export const API_PRODUCTS = API_DOMAIN + '/products';

export const API_PICBOOKS = API_DOMAIN + '/picbooks'
export const API_PICBOOK_DETAIL = (id: string | number) => `${API_PICBOOKS}/${id}`

// Kickstarter
export const API_KS_PACKAGES = API_DOMAIN + '/kickstarter-packages'
export const API_KS_PACKAGE_STATUS = (id: string | number) => `${API_KS_PACKAGES}/${id}/status`
export const API_KS_ITEM_PICBOOK = (itemId: string | number) => `${API_KS_PACKAGES}/items/${itemId}/picbook`
export const API_KS_ITEM_OPTIONS = (itemId: string | number) => `${API_KS_PACKAGES}/items/${itemId}/options`