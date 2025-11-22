"use client";

import React from 'react';
import { useRouter } from '@/i18n/routing';

interface Props {
  packageId: number;
}

export default function KickstarterInlineCard({ packageId }: Props) {
  const router = useRouter();

  const onChooseNow = () => {
    if (packageId) {
      router.push(`/kickstarter-config/${packageId}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-[494px] h-[256px] mx-auto">
      <div className="bg-[#F8F8F8] rounded w-[356px] h-[120px] overflow-hidden">
        <div className="flex items-center justify-center h-full">
          {["/covers/ks-3.png","/covers/ks-2.png","/covers/ks-1.png","/covers/ks-2.png","/covers/ks-1.png"].map((src, idx) => (
            <div key={idx} className="w-[100px] h-[120px] pt-4 pb-4 shrink-0 flex items-center justify-center" style={{ marginLeft: idx === 0 ? 0 : '-50px' }}>
              <img src={src} alt="book" className="block max-w-none object-cover shadow-sm" style={{ width: 100, height: 88 }} />
            </div>
          ))}
        </div>
      </div>

      <p className="text-[#222222] text-lg text-center">
        You have already purchased a package on Kickstarer, please select the books you want first.
      </p>

      <div className="flex items-center justify-center">
        <button onClick={onChooseNow} className="border-[#222222] border text-[#000000] rounded-md text-lg w-[200px] h-[40px] flex items-center justify-center">
          Choose now
        </button>
      </div>
    </div>
  );
}


