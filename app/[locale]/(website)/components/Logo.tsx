import { Link } from "@/i18n/routing";
import Image from 'next/image';

const Logo = ({ useWhite = false }: { useWhite?: boolean }) => {
  return (
    <Link href={`/`}>
      <Image
        src={useWhite ? "/logo-white.png" : "/logo.png"}
        alt="DreamAze Book"
        width={120}
        height={40}
        className="h-10 object-contain"
      />
    </Link>
  );
};

export default Logo;