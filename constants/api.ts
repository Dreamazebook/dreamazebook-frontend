// 使用相对路径，让 axios baseURL 生效
// 客户端会通过 /api 代理，服务器端会使用完整的 API URL
export const OAUTH_REDIRECT = (provider: string) => `/api/auth/${provider}/redirect`;
export const OAUTH_CALLBACK = (provider: string) => `/api/auth/${provider}/callback`;

export const API_USER_REGISTER = '/register';

export const API_USER_LOGIN = '/login';
export const API_GET_LOGIN_CODE = `${API_USER_LOGIN}/send-code`;
export const API_VERIFY_LOGIN_CODE = `${API_USER_LOGIN}/verify-code`;

export const API_USER_LOGOUT = '/logout';

export const API_USER_SEND_PASSWORD_RESET_EMAIL = '/forgot-password';
export const API_RESET_PASSWORD = '/reset-password';

export const API_USER_CURRENT = '/user/profile';
export const API_USER_PROFILE = '/user/profile';
export const API_USER_RESET_PASSWORD = '/user/change-password';

export const API_CART_LIST = '/cart';
export const API_CART_CALCULATE_COST = '/checkout/calculate-cost';
export const API_CART_CREATE = '/cart/create';
export const API_CART_REMOVE = '/cart/remove';
export const API_CART_UPDATE = (id:number) => `${API_CART_LIST}/${id}`;

export const API_ORDER_LIST = '/orders';
export const API_ORDER_STATUS = `${API_ORDER_LIST}/status`;
export const API_ORDER_CREATE = '/checkout/create-order';
export const API_ORDER_DETAIL = (id: string | number) => `${API_ORDER_LIST}/${id}`;
export const API_ORDER_PROGRESS = (id: string | number) => `${API_ORDER_LIST}/${id}/progress`;

export const API_ORDER_UPDATE_ADDRESS = (id: string | number) => `${API_ORDER_LIST}/${id}/address`;
export const API_ORDER_UPDATE_MESSAGE = '/order/update-message'
export const API_ORDER_REMOVE = '/order/remove';

export const API_ORDER_SHIPPING_METHODS = '/order/shipping-methods';
export const API_ORDER_UPDATE_SHIPPING = (id: string | number) => `${API_ORDER_LIST}/${id}/shipping-method`;
export const API_ORDER_STRIPE_PAID = '/stripe/confirm-payment';

export const API_ADDRESS_LIST = '/user/addresses';
export const API_ADDRESS_DETAIL = (id: string | number) => `${API_ADDRESS_LIST}/${id}`;
export const API_COUNTRY_LIST = '/shipping/countries';

export const API_SHIPPING_ESTIMATE = '/shipping/prices';


export const API_CREATE_STRIPE_PAYMENT = '/stripe/create-payment-intent'


export const API_ADMIN_LOGIN = '/admin/login';

export const API_ADMIN_USERS = '/admin/users';
export const API_ADMIN_ROLES = '/admin/roles';
export const API_ADMIN_ASSIGN_USER_ROLES = (userId: number) => `/admin/user-roles/${userId}/roles`;
export const API_ADMIN_PERMISSIONS = '/admin/permissions';

export const API_ADMIN_ORDERS = '/admin/orders'
export const API_ADMIN_ORDER_DETAIL = (id: string | number) => `${API_ADMIN_ORDERS}/${id}`
export const API_ADMIN_ORDER_ITEM_UPLOAD_FINAL_IMAGE = (orderId:string|number, itemId:string|number) => `${API_ADMIN_ORDERS}/${orderId}/items/${itemId}/upload-final-images`;
export const API_ADMIN_ORDER_DETAIL_MANUAL_CONFIRM = (orderId: string | number, itemId: string|number) => `${API_ADMIN_ORDER_DETAIL(orderId)}/items/${itemId}/confirm`
export const API_ADMIN_ORDER_DOWNLOAD_IMAGES = '/api/admin/orders/download-images'


export const API_ADMIN_LOGSTICS = '/admin/logistics'
export const API_ADMIN_LOGSTIC_DETAIL = (id: string | number) => `${API_ADMIN_LOGSTICS}/${id}`
export const API_ADMIN_LOGSTIC_DETAIL_PRINT_LABEL = (id: string | number) =>`${API_ADMIN_LOGSTIC_DETAIL(id)}/print-label`
export const API_ADMIN_LOGSTIC_COMFIRM = `${API_ADMIN_LOGSTICS}/confirm`;
export const API_ADMIN_LOGSTIC_PRINT_PICKUP_ORDER = `${API_ADMIN_LOGSTICS}/print-pickup-order`;
export const API_ADMIN_LOGSTIC_RESCHEDULE_PICKUP = (id:string|number) => `${API_ADMIN_LOGSTIC_DETAIL(id)}/reschedule-pickup`;

export const API_ADMIN_PICBOOKS = '/admin/picbooks'
export const API_ADMIN_PICBOOK_DETAIL = (id: string | number) => `${API_ADMIN_PICBOOKS}/${id}`

export const API_PRODUCTS = '/products';

export const API_PICBOOKS = '/picbooks'
export const API_PICBOOK_DETAIL = (id: string | number) => `${API_PICBOOKS}/${id}`

// Kickstarter
export const API_KS_PACKAGES = '/kickstarter-packages'
export const API_KS_PACKAGE_STATUS = (id: string | number) => `${API_KS_PACKAGES}/${id}/status`
export const API_KS_ITEM_PICBOOK = (itemId: string | number) => `${API_KS_PACKAGES}/items/${itemId}/picbook`
export const API_KS_ITEM_OPTIONS = (itemId: string | number) => `${API_KS_PACKAGES}/items/${itemId}/options`