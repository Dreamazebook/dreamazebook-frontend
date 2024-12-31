import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // 配置支持的语言
  locales: ['en', 'zh'],
  defaultLocale: 'en'
});
 
export const config = {
  // 匹配所有路径
  matcher: ['/((?!api|_next|.*\\..*).*)']
};