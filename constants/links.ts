export const ORDER_SUMMARY_URL = (orderId: number) => `/order-summary?orderId=${orderId}`;
export const ORDER_CHECKOUT_URL = (orderId: number) => `/checkout?orderId=${orderId}`;

export const BOOKS_URL = '/books';
export const BOOK_DETAIL_URL = (bookId: string) => `${BOOKS_URL}/${bookId}`;

export const CONTACT_US_URL = '/contact-us';
export const SURVEY_URL = '/survey';
export const KICKSTARTER_URL = 'https://www.kickstarter.com/projects/dreamazebook/dreamaze-personalized-books-to-truly-see-your-loved-ones?ref=nav_search&result=project&term=dreamazebook&total_hits=1';
export const FACEBOOK_GROUP_URL = 'https://www.facebook.com/groups/632313426083796/';

export const WELCOME_SUCCESS_URL = '/welcome/success';