"use client";

import { useEffect, useState } from "react";
import useUserStore from "@/stores/userStore";
import { useTranslations } from 'next-intl';

interface GreetingHeaderProps {
  className?: string;
}

export default function GreetingHeader({ className = "" }: GreetingHeaderProps) {
  const { user } = useUserStore();
  const tProfileSidebar = useTranslations('profileSidebar');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(tProfileSidebar('goodMorning'));
    } else if (hour < 18) {
      setGreeting(tProfileSidebar('goodAfternoon'));
    } else {
      setGreeting(tProfileSidebar('goodEvening'));
    }
  }, [tProfileSidebar]);

  // Display user name or email
  const displayName = user?.name || user?.email?.split('@')[0];

  return (
    <div className={`flex items-center text-[22px] text-[#222] md:text-[28px] justify-between ${className}`}>
      <span className="">{greeting} {displayName}!</span>
    </div>
  );
}
