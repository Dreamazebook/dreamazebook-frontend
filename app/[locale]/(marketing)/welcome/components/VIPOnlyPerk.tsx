import { Container } from "../../components/Container";
import { ContainerTitle } from "../../components/ContainerTitle";
import Image from "next/image";
import { VIP_PERK_FIRST_PICK, VIP_PERK_ITEM_BG, VIP_PERK_ITEM_BG_APP, VIP_PERK_SAVE_40, VIP_PERK_UNLOCK_GIFT } from "@/constants/cdn";
import React from "react";

const VIPONLYPERKS = [
  {
    tl:'Save 40%',
    desc: 'our biggest discount ever! Limited time. Don’t miss out!',
    label: 'VIP Launch Coupon',
    icon:VIP_PERK_SAVE_40
  },
  {
    tl:'Unlock surprise gift',
    desc:'Reserved only for VIPs. Shh... it’s a secret!',
    label: 'Secret Gift Ticket',
    icon:VIP_PERK_UNLOCK_GIFT
  },
  {
    tl:'First pick, First ship',
    desc:'Your order will be among the very first out the door.',
    label: 'Priority Access Ticket',
    icon:VIP_PERK_FIRST_PICK
  },
];

export default function VIPOnlyPerk() {
  return (
    <Container cssClass="bg-white">
      <ContainerTitle cssClass="mb-16 md:mb-0">
      Your VIP-Only Perks
      </ContainerTitle>
      
      <div className="max-w-7xl mx-auto px-3 flex flex-col md:flex-row gap-3 md:gap-6">
        {VIPONLYPERKS.map(({tl,desc,label,icon},idx)=>
          <article 
            style={{'--item-bg-app':`url(${VIP_PERK_ITEM_BG_APP})`, '--item-bg':`url(${VIP_PERK_ITEM_BG})`} as React.CSSProperties} 
            key={idx} 
            className="text-[#222222] flex items-center md:flex-col gap-3 md:gap-6 bg-(image:--item-bg-app) md:bg-(image:--item-bg) bg-no-repeat bg-cover">
            <p className="text-[#ECA60D] text-[9px] md:text-[20px] rotate-[-90deg] -translate-x-2 md:rotate-0 md:translate-0 text-nowrap">{label}</p>
            <Image src={icon} width={32} height={32} alt="Icon" className="md:w-[64px] md:h-[64px]" />
            <div className="md:text-center">
              <h3 className="font-bold text-[21px] md:text-[42px] text-[#012DCE]">{tl}</h3>
              <p className="font-light text-[#666666] text-[14px] md:text-[28px]">{desc}</p>
            </div>
          </article>
        )}
      </div>
    </Container>
  )
}