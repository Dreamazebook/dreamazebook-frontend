import Link from "next/link";

export default function Footer() {
  return (
    <footer className="max-w-7xl mx-auto md:flex justify-center items-center gap-4 p-10 text-[#222222] text-sm md:text-xl">
      <div>@{new Date().getFullYear()} Dreamazebook. All right reserved.</div>
      <Link className="underline" href={'/en/welcome/privacy-policy'}>Privacy Policy</Link>
    </footer>
  )
};