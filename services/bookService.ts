import { ProductsResponse } from "@/types/product";
import api from "@/utils/api";

export const getBooks = async (locale:string) => {
  return await api.get<ProductsResponse>(`/products`, {
    params: {
      page: 1,
      per_page: 20,
      category: 'picbook',
      language: locale,
    },
  });
}