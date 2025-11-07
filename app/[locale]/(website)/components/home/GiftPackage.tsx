import { HOME_IMAGE } from "@/constants/cdn";
import { Link } from "@/i18n/routing";
import { ArrowRightIcon } from "@mui/x-date-pickers/icons";

export default function GiftPackage() {
  return (
    <section
      style={{
        '--bg-image': `url(${HOME_IMAGE('slide2.png')})`,
        '--bg-image-desktop': `url(${HOME_IMAGE('slide2_desktop.png')})`
      } as React.CSSProperties }
      className="h-[60vh] flex flex-col md:flex-row bg-(image:--bg-image) md:bg-(image:--bg-image-desktop) bg-cover bg-no-repeat md:items-center md:justify-between p-6 md:p-20 gap-6 md:gap-0 mb-20">
      <div className="space-y-5 mt-20 md:ml-30 text-center md:text-left">
        <h2 className="text-[20px] md:text-[40px] font-bold">Ready to Gift Packages</h2>
        <p className="text-[18px]">Handpicked bundles with books + keepsafes<br/>beautifully wrapped for effortless gifting</p>
        <Link className="text-[18px] hidden md:block" href={'#'}>Learn Now <ArrowRightIcon /></Link>
      </div>
    </section>
  )
}