import { OrderDetail } from "@/types/order";

export const ORDER_SUMMARY_URL = (orderId: number) => `/order-summary?orderId=${orderId}`;
/**
 * 生成结账页面的 URL
 * @param {number} orderId - 订单 ID
 * @returns {string} 结账页面的 URL 路径
 */
export const ORDER_CHECKOUT_URL = (orderId: number) => `/checkout?orderId=${orderId}`;

export const getOrderLink = (orderDetail: OrderDetail) => {
  return orderDetail.payment_status === "paid" ? ORDER_SUMMARY_URL(orderDetail.id) : ORDER_CHECKOUT_URL(orderDetail.id);
}

export const BOOKS_URL = '/books';
export const BOOK_DETAIL_URL = (bookId: string) => `${BOOKS_URL}/${bookId}`;

export const CONTACT_US_URL = '/contact-us';
export const SURVEY_URL = '/survey';
export const KICKSTARTER_URL = 'https://www.kickstarter.com/projects/dreamazebook/dreamaze-personalized-books-to-truly-see-your-loved-ones?ref=nav_search&result=project&term=dreamazebook&total_hits=1';
export const FACEBOOK_GROUP_URL = 'https://www.facebook.com/groups/632313426083796/';

export const WELCOME_SUCCESS_URL = '/welcome/success';