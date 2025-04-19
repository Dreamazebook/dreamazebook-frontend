import DreamzeImage from "@/app/components/DreamzeImage";
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";
import { ContainerDesc } from "./ContainerDesc";
import { useEffect, useState } from "react";
import ContainerVideo from "./ContainerVideo";
import { EXPERTLY_CRAFTED_DONE, EXPERTLY_CRAFTED_DRAFT, EXPERTLY_CRAFTED_VIDEO } from "@/constants/cdn";

export default function ExpertlyCrafted() {

  const [isHovered, setIsHovered] = useState(false); // 是否悬停
  const [opacity, setOpacity] = useState(100); // 图1的不透明度

  // 动画逻辑
  useEffect(() => {
    if (isHovered) return; // 如果悬停，暂停动画

    const interval = setInterval(() => {
      // 图1不透明度从 100% -> 0%
      setOpacity(0);
      setTimeout(() => {
        // 停顿 1.5s
        setTimeout(() => {
          // 图1不透明度从 0% -> 100%
          setOpacity(100);
        }, 2500); // 2.5s 动画时间
      }, 1500); // 1.5s 停顿时间
    }, 8000); // 总循环时间：2.5s + 1.5s + 2.5s + 1.5s = 8s

    return () => clearInterval(interval); // 清除定时器
  }, [isHovered]);

  // 悬停时显示图2，离开时显示图1并暂停动画
  const handleMouseEnter = () => {
    setIsHovered(true);
    setOpacity(0); // 显示图1
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTimeout(() => {
      setOpacity(100); // 开始动画
    }, 5000); // 5s 后继续动画
  };

  return (
    <Container cssClass="bg-[#F5E3E3]">
      <div className="container mx-auto px-4">
        <ContainerTitle cssClass="mb-6">
          Expertly Crafted<br/>And <span className="text-[#022CCE]">Beautifully</span> Illustrated
        </ContainerTitle>
        <ContainerDesc>
          Crafted by educators with hand-drawn art, a unique keepsake
        </ContainerDesc>
        
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="max-w-4xl relative aspect-[4/1] mx-auto my-8 md:my-16">
          <DreamzeImage src={EXPERTLY_CRAFTED_DRAFT} alt="Dreamazebook" cssClass="transition-opacity duration-[2500ms] z-10" style={{ opacity: `${opacity}%` }} />
          <DreamzeImage src={EXPERTLY_CRAFTED_DONE} alt="Dreamazebook" />
        </div>

        <ContainerVideo src={EXPERTLY_CRAFTED_VIDEO} />

      </div>
    </Container>
  )
}