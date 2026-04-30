/** SPU / book 标识统一大写后是否为母亲节 / Mom 绘本 */
export function isPicbookMom(bookId: string | undefined | null): boolean {
  return String(bookId || '').trim().toUpperCase() === 'PICBOOK_MOM';
}
