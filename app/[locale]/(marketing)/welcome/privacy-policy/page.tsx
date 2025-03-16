import PrivacyPolicy from "@/app/components/PrivacyPolicy";
import Link from "next/link";
import Image from 'next/image';

export default function PrivacyPolicyPage() {
  return <section className="max-w-7xl mx-auto text-[#222222] p-5">
    <Link href={'/'} className="block mx-auto mb-5">
        <Image className="" src={'/welcome/dreamaze-logo.png'} alt="Logo" width={168} height={56} />
      </Link>
    <PrivacyPolicy />
  </section>
}