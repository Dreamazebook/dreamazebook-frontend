import Image from "next/image";

const Logo = () => {
  return (
    <div className="flex items-center justify-center">
      <Image src="/logo.png" alt="logo" className="h-10 object-contain" width={100} height={100} />
    </div>
  );
};
export default Logo;