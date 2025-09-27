import { redirect } from 'next/navigation';

type PageProps = { params: { locale: string } };

export default function Page({ params: { locale } }: PageProps) {
  redirect(`/${locale}/personalize?bookid=3`);
}


