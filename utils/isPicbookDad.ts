/** SPU / book 标识统一大写后是否为父亲节 / Dad 绘本 */
export function isPicbookDad(bookId: string | undefined | null): boolean {
  return String(bookId || '').trim().toUpperCase() === 'PICBOOK_DAD';
}
