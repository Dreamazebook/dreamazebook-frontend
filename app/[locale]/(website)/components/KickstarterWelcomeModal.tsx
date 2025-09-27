"use client"

import Image from 'next/image'
import useUserStore from '@/stores/userStore'
import { useRouter } from '@/i18n/routing'
import { IoCloseOutline } from "react-icons/io5";

export default function KickstarterWelcomeModal() {
  const { showKickstarterWelcome, closeKickstarterWelcome, ksSummary } = useUserStore()
  const router = useRouter()

  if (!showKickstarterWelcome) return null

  const onChooseNow = () => {
    const packageId = ksSummary?.package_id
    closeKickstarterWelcome()
    if (packageId) {
      router.push(`/kickstarter-config/${packageId}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded w-[600px] h-[388px] pt-4 pr-6 pb-4 pl-6 text-center relative shadow-xl" style={{ fontFamily: 'var(--font-roboto)' }}>
        {/* 顶部关闭栏：宽 552，高 16，左右两端对齐 */}
        <div className="w-[552px] h-4 flex justify-between items-center mx-auto">
          <div></div>
          <button
            aria-label="close"
            onClick={() => closeKickstarterWelcome()}
            className="text-2xl leading-none"
          >
            <IoCloseOutline />
          </button>
        </div>

        <div className="flex justify-center items-start mb-4 gap-2 whitespace-nowrap w-[452px] h-[36px] mx-auto" style={{ width: 452, height: 36 }}>
          <span className="text-3xl font-normal leading-[36px]">Welcome friends from</span>
          <img
            src="/covers/ks.png"
            alt="KICKSTARTER"
            className="ml-[6px] block"
            style={{ width: 169.412, height: 18, objectFit: 'contain', marginTop: 11 }}
          />
        </div>
    
        {/* 中部容器（含封面与文案）：494×180，垂直排列，间距12px */}
        <div className="mx-auto my-4 w-[494px] h-[180px] flex flex-col items-center justify-start gap-3" style={{ width: 494, height: 180 }}>
          {/* 封面展示区域（母容器 356×120，圆角 4，左右 padding 16） */}
          <div className="bg-[#F8F8F8] rounded w-[356px] h-[120px] px-4 overflow-hidden" style={{ width: 356, height: 120 }}>
            <div className="flex items-center justify-center h-full">
              {['/covers/ks-3.png','/covers/ks-2.png','/covers/ks-1.png','/covers/ks-2.png','/covers/ks-1.png'].map((src, idx) => (
                <div key={idx} className="w-[100px] h-[120px] pt-4 pb-4 shrink-0 flex items-center justify-center" style={{ marginLeft: idx === 0 ? 0 : '-50px' }}>
                  {/* 单张封面固定 100×88，重叠 40%；强制覆盖全局 img 样式 */}
                  <img
                    src={src}
                    alt="book"
                    className="block max-w-none object-cover shadow-sm !w-[100px] !h-[88px]"
                    style={{ width: 100, height: 88 }}
                  />
                </div>
              ))}
            </div>
          </div>
          <p className="text-[#222] text-lg text-center px-4">You have already purchased a package on Kickstarer, please select the books you want first.</p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <button onClick={onChooseNow} className="bg-[#222222] text-white rounded-md text-lg w-[200px] h-[40px] flex items-center justify-center">
            Choose now
          </button>
          <button onClick={() => closeKickstarterWelcome()} className="text-[#666666] text-lg">later</button>
        </div>
      </div>
    </div>
  )
}



