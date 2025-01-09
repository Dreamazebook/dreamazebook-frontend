import { Link } from "@/i18n/routing";
import Image from "next/image";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center justify-center">
      <Image src="/logo.png" alt="logo" className="h-10 object-contain" width={100} height={100} />
    </Link>
  );
};
export default Logo;