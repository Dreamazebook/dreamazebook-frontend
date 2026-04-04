/** SPU / book 标识统一大写后是否为生日绘本 */
export function isPicbookBirthday(bookId: string | undefined | null): boolean {
  return String(bookId || '')
    .trim()
    .toUpperCase() === 'PICBOOK_BIRTHDAY';
}
