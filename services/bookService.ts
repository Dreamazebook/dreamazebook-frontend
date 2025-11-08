import { ProductsResponse } from "@/types/product";
import api from "@/utils/api";
import { apiCache } from "@/utils/apiCache";

export const getBooks = async (locale: string, options?: { useCache?: boolean }) => {
  const params = {
    page: 1,
    per_page: 20,
    category: 'picbook',
    language: locale,
  };

  // 使用缓存，书籍列表缓存 5 分钟
  return await apiCache.request<ProductsResponse>(
    () => api.get<ProductsResponse>(`/products`, { params }),
    `/products`,
    params,
    {
      ttl: 5 * 60 * 1000, // 5分钟缓存
      useCache: options?.useCache !== false,
      useDedupe: true, // 启用请求去重
    }
  );
}