import Link from "next/link";

export default function Footer() {
  return (
    <footer className="max-w-7xl mx-auto flex items-center gap-4 py-10 text-[#222222] text-xl">
      <span>@{new Date().getFullYear()} Dreamazebook. All right reserved.</span>
      <Link className="underline" href={'/en/welcome/privacy-policy'}>Privacy Policy</Link>
    </footer>
  )
};