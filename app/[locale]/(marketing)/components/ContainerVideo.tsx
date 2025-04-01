import React, { useRef, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  src: string; // 视频链接
}

const ContainerVideo: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null); // 引用视频元素
  const currentVideoRef = videoRef.current;

  // Intersection Observer 回调函数
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      currentVideoRef?.play(); // 视频进入视口时播放
    } else {
      currentVideoRef?.pause(); // 视频离开视口时暂停
    }
  },[currentVideoRef]);

  // 初始化 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // 相对于视口
      threshold: 0.5, // 当 50% 的视频进入视口时触发
    });

    if (currentVideoRef) {
      observer.observe(currentVideoRef); // 开始观察视频元素
    }

    // 清理函数
    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef); // 停止观察
      }
    };
  }, [currentVideoRef,handleIntersection]);

  return (
    <video
      className='w-full'
      ref={videoRef}
      src={src}
      loop
      //controls // 显示视频控件
      //muted // 静音（某些浏览器要求静音才能自动播放）
    />
  );
};

export default ContainerVideo;