declare const api: {
    get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
};

declare const uploadApi: {
    get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
};

export function fetchDreamazebookApi(
    path: string,
    options?: Omit<RequestInit, 'credentials'> & { timeoutMs?: number }
): Promise<any>;

export const GUEST_SESSION_HEADER: string;
export const GUEST_SESSION_STORAGE_KEY: string;
export function readGuestSessionId(): string | null;
export function writeGuestSessionId(id: string, options?: { force?: boolean }): void;

export { uploadApi };
export default api;