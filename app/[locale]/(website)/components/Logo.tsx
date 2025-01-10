import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';

const Logo = () => {
  const locale = useLocale();
  
  return (
    <Link href={`/${locale}`}>
      <Image
        src="/logo.png"
        alt="DreamAze Book"
        width={120}
        height={40}
        className="h-10 object-contain"
      />
    </Link>
  );
};

export default Logo;