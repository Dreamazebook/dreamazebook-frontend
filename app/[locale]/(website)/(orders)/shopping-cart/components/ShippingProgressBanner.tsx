'use client';

import { Link } from "@/i18n/routing";

interface ShippingProgressBannerProps {
  itemsCount: number;
}

export default function ShippingProgressBanner({ itemsCount }: ShippingProgressBannerProps) {
  let message = 'Add 1 more book to get free shipping';

  if (itemsCount >= 2) {
    message = 'You’ve unlocked free shipping 🎉,Add 1 more book to save 20%'
  }

  return (
    <div className="bg-[#FCF2F2] text-[#222222] p-4 flex justify-center items-center gap-2">
      <p>{message}</p>
      <Link
        href="/books"
        className="text-[#012CCE] cursor-pointer"
      >
        View More
      </Link>
    </div>
  );
}
