/** 预览页大图（S3/R2）体积大，跳过 Next.js /_next/image 优化，避免超时 500 */
export function shouldBypassNextImageOptimization(
  src: string | null | undefined,
): boolean {
  if (!src) return false;
  const lower = src.toLowerCase();
  if (lower.startsWith('data:') || lower.startsWith('blob:')) return true;
  return (
    lower.includes('s3-dev-dre01') ||
    lower.includes('s3-pro-dre001') ||
    lower.includes('s3-pro-dre002') ||
    lower.includes('pro-s3-dre01') ||
    lower.includes('.r2.dev') ||
    lower.includes('/picbook_previews/')
  );
}
