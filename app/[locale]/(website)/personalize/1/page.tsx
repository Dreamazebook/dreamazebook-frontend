import { redirect } from 'next/navigation';

export type PageProps = {
  params: Promise<{ locale: string }>
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/personalize?bookid=1`);
}


