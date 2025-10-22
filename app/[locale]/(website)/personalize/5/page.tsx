import { redirect } from 'next/navigation';

import {PageProps} from '../1/page';

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/personalize?bookid=5`);
}


