import React, { useState } from 'react';
import Image from 'next/image';
import { getBookConfig, BookSection } from './booksConfig';

interface BookSectionsProps {
  book: any;
  bookId: string | number;
}

// Behind the Story Section 组件
const BehindStorySection: React.FC<{ section: BookSection }> = ({ section }) => {
  const backgroundStyle = section.backgroundImage
    ? {
        backgroundImage: section.backgroundOverlay
          ? `${section.backgroundOverlay}, url(${section.backgroundImage})`
          : `url(${section.backgroundImage})`,
      }
    : {};

  return (
    <div
      className={`items-center justify-center mx-auto flex flex-col gap-12 bg-cover bg-center bg-no-repeat ${section.className || ''}`}
      style={backgroundStyle}
    >
      {section.title && (
        <h2
          className="text-center text-[24px] md:text-[40px] font-semibold md:font-medium leading-[32px] md:leading-[64px]"
          style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
        >
          {section.title}
        </h2>
      )}
      
      {section.content && (
        <p
          className="px-12 max-w-[1200px] h-auto mx-auto text-center text-base font-normal leading-6 tracking-[0.5px]"
          style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
        >
          {section.content}
        </p>
      )}
    </div>
  );
};

// Toddler Favorites Section 组件
const ToddlerFavoritesSection: React.FC<{ section: BookSection }> = ({ section }) => {
  // 如果提供了 bundle 背景图，使用背景图模式
  if (section.bundleImage || section.bundleImageMobile) {
    return (
      <div className={`w-full h-auto bg-[#FCF2F2] relative ${section.className || ''} overflow-hidden`}>
        {/* SVG Decorations - 位于背景和白色容器之间 */}
        {/* Right Side SVG */}
        {/* <div 
          className="absolute z-0"
          style={{
            width: '341.63px',
            height: '338.11px',
            transform: 'rotate(-20.92deg)',
            opacity: 1,
            top: 0,
            right: 0,
          }}
        >
          <svg width="364" height="327" viewBox="0 0 364 327" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M187.668 147.869C193.2 112.791 188.498 35.8206 125.428 8.5663C4.28071 -43.7844 -4.07018 156.444 1.12005 266.353C2.69746 299.757 28.0529 327.114 61.4927 326.85C157.241 326.093 290.896 285.51 357.855 136.223C388.355 68.223 280.476 68.6979 187.668 147.869Z" fill="#FFDFDF"/>
            <path d="M187.668 147.869C193.2 112.791 188.498 35.8206 125.428 8.5663C4.28071 -43.7844 -4.07018 156.444 1.12005 266.353C2.69746 299.757 28.0529 327.114 61.4927 326.85C157.241 326.093 290.896 285.51 357.855 136.223C388.355 68.223 280.476 68.6979 187.668 147.869Z" fill="#E0E8FF"/>
          </svg>
        </div> */}
        
        {/* Left Side SVG */}
        {/* <div 
          className="absolute z-0"
          style={{
            width: '287px',
            height: '280px',
            opacity: 1,
            bottom: '40%',
            left: 0,
          }}
        >
          <svg width="287" height="280" viewBox="0 0 287 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M193.41 79.1659C189.171 59.1789 170.804 18.7815 131.245 17.0885C74.9488 14.6793 122.381 77.756 154.237 109.34C109.024 116.394 50.5384 97.4155 38.3843 119.921C19.2999 155.26 105.496 162.246 140.817 166.479C119.622 178.471 22.9319 216.264 4.4747 251.129C-13.9825 285.995 25.6678 292.043 104.787 253.951C183.907 215.858 273.487 105.594 285.03 40.8466C299.869 -42.39 227.082 17.5593 193.41 79.1659Z" fill="#FFE9D6"/>
          </svg>
        </div> */}
        
        {/* Additional SVG Decoration */}
        {/* <div 
          className="absolute z-0"
          style={{
            width: '592px',
            height: '448px',
            opacity: 1,
            bottom: 0,
            right: 0
          }}
        >
          <svg width="592" height="448" viewBox="0 0 592 448" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M435.616 4.35204L422.731 155.067C422.542 157.283 424.196 159.228 426.413 159.396L549.49 168.756C553.434 169.055 554.596 174.288 551.15 176.229L442.809 237.259C440.13 238.768 440.085 242.611 442.729 244.182L635.812 358.967C639.503 361.162 637.614 366.838 633.344 366.383L441.212 345.897C438.849 345.645 436.788 347.497 436.788 349.874V418.006C436.788 421.647 432.318 423.395 429.848 420.718L356.423 341.128C354.547 339.095 351.223 339.534 349.939 341.985L229.183 572.603C227.034 576.706 220.795 574.487 221.72 569.949L274.677 310.191C275.246 307.399 272.797 304.924 269.999 305.464L121.49 334.123C117.471 334.899 115.019 329.851 118.114 327.172L216.914 241.624C219.213 239.634 218.538 235.907 215.687 234.85L2.61458 155.816C-1.66946 154.227 -0.369949 147.855 4.19422 148.071L233.951 158.914C236.049 159.013 237.867 157.472 238.112 155.385L249.564 57.8456C249.997 54.1567 254.787 52.9985 256.858 56.0819L314.706 142.216C316.235 144.492 319.548 144.59 321.209 142.409L428.448 1.58793C430.874 -1.59775 435.957 0.362357 435.616 4.35204Z" fill="#FFE3E3"/>
          </svg>
        </div> */}
        
        {/* Title and Description Container */}
        <div className="max-w-[815px] w-full mx-auto flex flex-col gap-[24px] relative z-10">
          {/* Title Container */}
          {section.title && (
            <div className="max-w-[627px] w-full mx-auto flex flex-col">
              <h2
                className="text-center md:text-[40px] text-[24px] md:font-medium font-semibold md:leading-[64px] leading-[32px]"
                style={{
                  fontFamily: 'var(--font-roboto), Roboto, sans-serif',
                  letterSpacing: '0.5px',
                }}
              >
                {section.title}
              </h2>
            </div>
          )}
          
          {/* Description Container */}
          {section.description && (
            <div className="max-w-[627px] w-full mx-auto flex flex-col px-4 lg:px-0">
              <p
                className="text-center lg:text-[16px] text-[14px] font-normal lg:leading-[24px] leading-[16px] tracking-[0.5px]"
                style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
              >
                {section.description}
              </p>
            </div>
          )}
        </div>
        
        {/* Bundle Image Display and Price/Button Container */}
        <div className="bg-[#FFFFFF] h-auto pb-12 rounded-[4px] mx-auto flex flex-col relative z-10">
          {/* Bundle Image - 移动端和桌面端使用不同的图片 */}
          <div className="flex items-center justify-center w-full">
            {/* 移动端图片 */}
            {section.bundleImageMobile && (
              <div className="md:hidden flex justify-center items-center w-full px-4">
                <Image
                  src={section.bundleImageMobile}
                  alt={section.title || 'Bundle'}
                  width={800}
                  height={400}
                  className="w-full h-auto object-contain"
                  style={{ maxWidth: '283.99847412109375px' }}
                />
              </div>
            )}
            {/* 桌面端图片 - 从中型屏幕开始显示 */}
            {(section.bundleImage || section.bundleImageMobile) && (
              <div className="hidden md:flex justify-center items-center w-full">
                <Image
                  src={section.bundleImage || section.bundleImageMobile || ''}
                  alt={section.title || 'Bundle'}
                  className="h-[350px] w-auto object-contain mx-auto"
                  width={600}
                  height={328}
                />
              </div>
            )}
          </div>
          
          {/* Price and Button */}
          <div className="flex flex-col items-center gap-4">
            {/* Price Display */}
            <div className="w-[144px] flex flex-row items-center justify-center gap-3 bg-[#FCF2F2] px-4 py-2 rounded-[24px]">
              {section.originalPrice && (
                <span className="text-[#012CCE] line-through text-[14px]">
                  {section.originalPrice}
                </span>
              )}
              {section.discountedPrice && (
                <span className="text-[24px] font-semibold leading-[24px] text-[#012CCE]">
                  {section.discountedPrice}
                </span>
              )}
            </div>
            
            {/* Button */}
            {section.buttonText && (
              <button className="bg-black text-[#F5E3E3] px-8 py-3 rounded-[4px] hover:bg-gray-800 transition-colors">
                {section.buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 原有的渲染逻辑（用于 Good Night 等书籍）
  return (
    <div className={`w-full h-auto bg-[#FCF2F2] relative ${section.className || ''} overflow-hidden`}>
      {/* SVG Decorations - 位于背景和白色容器之间 */}
      {/* Right Side SVG */}
      <div 
        className="absolute z-0"
        style={{
          width: '341.63px',
          height: '338.11px',
          transform: 'rotate(-20.92deg)',
          opacity: 1,
          top: 0,
          right: 0,
        }}
      >
        <svg width="364" height="327" viewBox="0 0 364 327" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M187.668 147.869C193.2 112.791 188.498 35.8206 125.428 8.5663C4.28071 -43.7844 -4.07018 156.444 1.12005 266.353C2.69746 299.757 28.0529 327.114 61.4927 326.85C157.241 326.093 290.896 285.51 357.855 136.223C388.355 68.223 280.476 68.6979 187.668 147.869Z" fill="#FFDFDF"/>
          <path d="M187.668 147.869C193.2 112.791 188.498 35.8206 125.428 8.5663C4.28071 -43.7844 -4.07018 156.444 1.12005 266.353C2.69746 299.757 28.0529 327.114 61.4927 326.85C157.241 326.093 290.896 285.51 357.855 136.223C388.355 68.223 280.476 68.6979 187.668 147.869Z" fill="#E0E8FF"/>
        </svg>
      </div>
      
      {/* Left Side SVG */}
      <div 
        className="absolute z-0"
        style={{
          width: '287px',
          height: '280px',
          opacity: 1,
          bottom: '40%',
          left: 0,
        }}
      >
        <svg width="287" height="280" viewBox="0 0 287 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M193.41 79.1659C189.171 59.1789 170.804 18.7815 131.245 17.0885C74.9488 14.6793 122.381 77.756 154.237 109.34C109.024 116.394 50.5384 97.4155 38.3843 119.921C19.2999 155.26 105.496 162.246 140.817 166.479C119.622 178.471 22.9319 216.264 4.4747 251.129C-13.9825 285.995 25.6678 292.043 104.787 253.951C183.907 215.858 273.487 105.594 285.03 40.8466C299.869 -42.39 227.082 17.5593 193.41 79.1659Z" fill="#FFE9D6"/>
        </svg>
      </div>
      
      {/* Additional SVG Decoration */}
      <div 
        className="absolute z-0"
        style={{
          width: '592px',
          height: '448px',
          opacity: 1,
          bottom: 0,
          right: 0
        }}
      >
        <svg width="592" height="448" viewBox="0 0 592 448" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M435.616 4.35204L422.731 155.067C422.542 157.283 424.196 159.228 426.413 159.396L549.49 168.756C553.434 169.055 554.596 174.288 551.15 176.229L442.809 237.259C440.13 238.768 440.085 242.611 442.729 244.182L635.812 358.967C639.503 361.162 637.614 366.838 633.344 366.383L441.212 345.897C438.849 345.645 436.788 347.497 436.788 349.874V418.006C436.788 421.647 432.318 423.395 429.848 420.718L356.423 341.128C354.547 339.095 351.223 339.534 349.939 341.985L229.183 572.603C227.034 576.706 220.795 574.487 221.72 569.949L274.677 310.191C275.246 307.399 272.797 304.924 269.999 305.464L121.49 334.123C117.471 334.899 115.019 329.851 118.114 327.172L216.914 241.624C219.213 239.634 218.538 235.907 215.687 234.85L2.61458 155.816C-1.66946 154.227 -0.369949 147.855 4.19422 148.071L233.951 158.914C236.049 159.013 237.867 157.472 238.112 155.385L249.564 57.8456C249.997 54.1567 254.787 52.9985 256.858 56.0819L314.706 142.216C316.235 144.492 319.548 144.59 321.209 142.409L428.448 1.58793C430.874 -1.59775 435.957 0.362357 435.616 4.35204Z" fill="#FFE3E3"/>
        </svg>
      </div>
      
      {/* Title and Description Container */}
      <div className="max-w-[815px] w-full mx-auto flex flex-col lg:gap-[48px] gap-[24px] relative z-10">
        {/* Title Container */}
        {section.title && (
          <div className="max-w-[627px] w-full mx-auto flex flex-col">
            <h2
              className="text-center md:text-[40px] text-[24px] md:font-medium font-semibold md:leading-[64px] leading-[32px]"
              style={{
                fontFamily: 'var(--font-roboto), Roboto, sans-serif',
                letterSpacing: '0.5px', // Headline Small/Tracking (需要确认具体值)
              }}
            >
              {section.title}
            </h2>
          </div>
        )}
        
        {/* Description Container */}
        {section.description && (
          <div className="max-w-[627px] w-full mx-auto flex flex-col px-4 lg:px-0">
            <p
              className="text-center lg:text-[16px] text-[14px] font-normal lg:leading-[24px] leading-[16px] tracking-[0.5px]"
              style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
            >
              {section.description}
            </p>
          </div>
        )}
      </div>
      
      {/* Books Display and Price/Button Container */}
      <div className="bg-[#FFFFFF] max-w-[1400px] w-full h-auto pt-12 lg:px-[88px] px-4 pb-12 rounded-[4px] mx-auto flex flex-col gap-[24px] relative z-10">
        {/* Books Display */}
          {section.books && section.books.length > 0 && (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-[150px]">
            {section.books.map((book, index) => {
              // 根据书的数量调整旋转角度
              const totalBooks = section.books?.length || 2;
              let rotation = '0deg';
              if (totalBooks === 2) {
                rotation = index === 0 ? '-9deg' : '5deg';
              } else if (totalBooks === 3) {
                rotation = index === 0 ? '-9deg' : index === 1 ? '0deg' : '5deg';
              }
              // 窄屏背景色（按索引）
              const narrowBackgroundColors = ['#266BE1', '#F4AA32', '#9D59E1'];
              // 窄屏旋转角度（按索引）
              const narrowRotations = ['-3.44deg', '4deg', '-4deg'];
              
              return (
              <React.Fragment key={index}>
              <div className="relative flex-shrink-0 w-[240px] lg:w-[280px] sm:w-[200px] max-w-full">
                {/* Book Card */}
                <div
                  className="relative w-full md:aspect-square rounded-[4px]"
                  style={{ 
                    opacity: 1,
                  }}
                >
                  {/* 宽屏：背景图整卡显示 */}
                  <div
                    className="hidden lg:block w-full h-full bg-no-repeat rounded-[4px]"
                    style={{
                      transform: `rotate(${rotation})`,
                      backgroundColor: book.backgroundImage ? 'transparent' : (book.backgroundColor || '#f0f0f0'),
                      backgroundImage: book.backgroundImage ? `url(${book.backgroundImage})` : undefined,
                      backgroundSize: book.backgroundImage ? '145%' : undefined,
                      backgroundPosition: book.backgroundImage ? 'bottom -125px right -60px' : undefined,
                    }}
                  >
                    {/* Price Tag (宽屏) */}
                    <div className="absolute top-4 right-4 bg-[#222222] text-white px-3 py-1 rounded-[24px] text-[24px] font-medium z-10">
                      {book.price}
                    </div>
                    {/* Book Info (宽屏) */}
                    <div 
                      className="absolute flex flex-col items-center justify-center"
                      style={{
                        width: '100%',
                        opacity: 1,
                        bottom: '15px',
                        gap: '4px',
                      }}
                    >
                      <h3 className="text-white text-[18px] font-medium tracking-wide">{book.title}</h3>
                      <p className="text-white text-[16px] font-normal opacity-90">{book.subtitle}</p>
                    </div>
                  </div>

                  {/* 窄屏：左侧背景图 + 右侧文案（长方形卡片） */}
                  <div
                    className="lg:hidden w-[278px] h-[110px] rounded-[4px] overflow-hidden flex flex-row"
                    style={{ 
                      backgroundColor: narrowBackgroundColors[index % narrowBackgroundColors.length],
                      transform: `rotate(${narrowRotations[index % narrowRotations.length]})`,
                      transformOrigin: 'center',
                    }}
                  >
                    {/* 左侧：背景图 */}
                    <div
                      className="w-[120px] h-full bg-no-repeat bg-cover"
                      style={{
                        backgroundImage: book.backgroundImage ? `url(${book.backgroundImage})` : undefined,
                        backgroundPosition: book.backgroundImage ? 'center' : undefined, // 可修改图片位置：向左偏移25px，垂直居中
                        transform: book.backgroundImage ? 'scale(1.75)' : undefined, // 可修改缩放比例
                      }}
                    />
                    {/* 右侧：文案 */}
                    <div className=" flex flex-col justify-end pb-2 z-10">
                      <h3 className="text-white md:text-[16px] text-[14px] font-medium mb-1">{book.title}</h3>
                      <p className="text-white text-[14px] font-normal opacity-90">{book.subtitle}</p>
                    </div>
                    {/* 价格（窄屏） */}
                    <div className="absolute top-2 left-20 bg-[#222222] text-white px-2 py-1 rounded-[24px] text-[14px] font-medium z-10">
                      {book.price}
                    </div>
                  </div>
                </div>
              
              {/* Plus Sign between books */}
              {section.books && index < section.books.length - 1 && (
                <>
                  {/* 中大屏：gap 150px → 位移 75px - 24px */}
                  <div 
                    className="absolute bg-[#FCF2F2] rounded-[48px] w-[48px] h-[48px] top-1/2 left-full hidden lg:flex items-center justify-center text-[#222222] font-bold"
                    style={{
                      opacity: 1,
                      transform: 'translate(calc(75px - 24px), -50%)',
                      gap: '10px',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.0854 10.3666H13.0709V1.35211C13.0709 0.605391 12.4655 0 11.7188 0C10.972 0 10.3666 0.605391 10.3666 1.35211V10.3666H1.35211C0.605391 10.3666 0 10.972 0 11.7188C0 12.4655 0.605391 13.0709 1.35211 13.0709H10.3666V22.0854C10.3666 22.8321 10.972 23.4375 11.7188 23.4375C12.4655 23.4375 13.0709 22.8321 13.0709 22.0854V13.0709H22.0854C22.8321 13.0709 23.4375 12.4655 23.4375 11.7188C23.4375 10.972 22.8321 10.3666 22.0854 10.3666Z" fill="#222222"/>
                    </svg>
                  </div>
                </>
              )}
              </div>
              {/* 小屏：作为流内元素（独立 flex item），与书本等距 */}
              {index < (section.books?.length || 0) - 1 && (
                <div className="lg:hidden bg-[#FCF2F2] rounded-full w-[20px] h-[20px] flex items-center justify-center text-[#222222] font-bold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.0854 10.3666H13.0709V1.35211C13.0709 0.605391 12.4655 0 11.7188 0C10.972 0 10.3666 0.605391 10.3666 1.35211V10.3666H1.35211C0.605391 10.3666 0 10.972 0 11.7188C0 12.4655 0.605391 13.0709 1.35211 13.0709H10.3666V22.0854C10.3666 22.8321 10.972 23.4375 11.7188 23.4375C12.4655 23.4375 13.0709 22.8321 13.0709 22.0854V13.0709H22.0854C22.8321 13.0709 23.4375 12.4655 23.4375 11.7188C23.4375 10.972 22.8321 10.3666 22.0854 10.3666Z" fill="#222222"/>
                  </svg>
                </div>
              )}
              </React.Fragment>
            );
          })}
        </div>
        )}
        
        {/* Price and Button */}
        <div className="flex flex-col items-center gap-4">
          {/* Price Display */}
          <div className="w-[144px] flex flex-row items-center justify-center gap-3 bg-[#FCF2F2] px-4 py-2 rounded-[24px]">
            {section.originalPrice && (
              <span className="text-[#012CCE] line-through text-[14px]">
                {section.originalPrice}
              </span>
            )}
            {section.discountedPrice && (
              <span className="text-[24px] font-semibold leading-[24px] text-[#012CCE]">
                {section.discountedPrice}
              </span>
            )}
          </div>
          
          {/* Button */}
          {section.buttonText && (
            <button className="bg-black text-[#F5E3E3] px-8 py-3 rounded-[4px] hover:bg-gray-800 transition-colors">
              {section.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Meet the Author Section 组件
const MeetAuthorSection: React.FC<{ section: BookSection }> = ({ section }) => {
  return (
    <div className={`w-full bg-white pt-12 gap-8 md:h-[616px] md:pt-[88px] md:pr-[120px] md:pb-[88px] md:pl-[120px] flex flex-col md:flex-row md:gap-[48px] ${section.className || ''}`}>
      {/* 右侧：文字内容 - 手机端在上，桌面端在右 */}
      <div className="flex flex-col px-4 md:px-0 gap-[24px] gap-6 order-1 md:order-2 md:justify-center md:w-1/2">
        {/* 标题 */}
        {section.title && (
          <h2 className="font-semibold md:font-medium text-center md:text-left text-[24px] md:text-[40px] leading-[32px] md:leading-[64px] text-[#222222]">
            {section.title}
          </h2>
        )}
        
        {/* 段落 */}
        {section.paragraphs && section.paragraphs.length > 0 && (
          <div className="flex flex-col gap-[6px]">
            {section.paragraphs.map((paragraph, index) => (
              <p 
                key={index}
                className="font-normal text-[14px] md:text-[16px] leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px] text-[#222222]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
      
      {/* 左侧：作者图片 - 手机端在下，桌面端在左 */}
      {section.authorImage && (
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <img 
            src={section.authorImage} 
            alt="Author" 
            className="w-full md:h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

// Personalization Power Section 组件（图片在右侧）
const PersonalizationPowerSection: React.FC<{ section: BookSection }> = ({ section }) => {
  return (
    <div className={`tw-full bg-[#F7F2EC] pt-12 gap-8 md:min-h-[616px] md:pt-[88px] md:pr-[120px] md:pb-[88px] md:pl-[120px] flex flex-col md:flex-row md:gap-[48px] ${section.className || ''}`}>
      {/* 左侧：文字内容 - 手机端在上，桌面端在左 */}
      <div className="justify-center flex flex-col px-4 md:px-0 gap-[24px] order-1 md:order-1 md:">
        {/* 标题 */}
        {section.title && (
          <h2 className="font-semibold md:font-medium text-center md:text-left text-[24px] md:text-[40px] leading-[32px] md:leading-[64px] text-[#222222]">
            {section.title}
          </h2>
        )}
        
        {/* 段落 */}
        {section.paragraphs && section.paragraphs.length > 0 && (
          <div className="flex flex-col gap-[6px]">
            {section.paragraphs.map((paragraph, index) => (
              <p 
                key={index}
                className="font-normal text-[14px] md:text-[16px] leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px] text-[#222222]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
      
      {/* 右侧：图片 - 手机端在下，桌面端在右 */}
      {section.authorImage && (
        <div className="w-full order-2 md:order-2 md:flex md:items-center md:justify-center">
          <img 
            src={section.authorImage} 
            alt="Personalization" 
            className="w-full md:max-w-[40vw] md:max-h-[440px] md:w-auto md:object-contain"
          />
        </div>
      )}
    </div>
  );
};

// Dreamaze Special Section 组件
const DreamazeSpecialSection: React.FC<{ section: BookSection }> = ({ section }) => {
  const features = section.features || [];
  const testimonials = section.specialTestimonials || [];
  // 为无缝循环弹幕效果：复制多次内容，形成足够长的轨道
  const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials];
  const row1Testimonials = extendedTestimonials.filter((_, index) => index % 2 === 0);
  const row2Testimonials = extendedTestimonials.filter((_, index) => index % 2 === 1);
  
  return (
    <div className={`w-full bg-white py-12 md:py-[88px] px-0 md:px-[120px] ${section.className || ''}`}>
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6 md:gap-[64px]">
        {/* 标题 */}
        {section.title && (
          <h2 className="text-center text-[24px] md:text-[40px] font-semibold md:font-medium leading-[32px] md:leading-[60px] text-[#222222] px-6 md:px-0">
            {section.title}
          </h2>
        )}
        
        {/* 第一部分：特性列表 */}
        {features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[600px] md:max-w-[1200px] mx-auto px-14 md:px-0">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                {/* 图标占位符 */}
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                  {feature.icon ? (
                    <img src={feature.icon} alt={feature.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded"></div>
                  )}
                </div>
                {/* 文本内容 */}
                <div className="flex flex-col md:gap-1 gap-0 ">
                  <h3 className="font-medium text-[16px] md:text-[18px] leading-[24px] md:leading-[24px] tracking-[0.15px] md:tracking-[0.5px] text-[#222222]">
                    {feature.title}
                  </h3>
                  <p className="font-normal text-[14px] md:text-[16px] leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px] text-[#222222]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 第二部分：评论卡片 */}
        {testimonials.length > 0 && (
          <>
            {/* 桌面端：两排水平弹幕条效果 - 无缝循环（通过负外边距移除左右留白） */}
            <div className="hidden md:block overflow-x-hidden overflow-y-visible mx-auto -mx-12 md:-mx-[120px] pb-[40px] relative">
              {/* 左右渐变遮罩 */}
              <div className="absolute inset-y-0 left-0 w-[107px] md:w-[214px] bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-[107px] md:w-[214px] bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              <div
                className="flex flex-col gap-6 md:gap-[50px]"
                style={{
                  animation: 'dreamazeMarquee 60s linear infinite',
                  width: 'fit-content',
                }}
              >
                {/* 第一排：每三张一组，第一张下移 40px、第二张保持原高度、第三张下移 20px，背景 #FFF9E8，其他 #FCF2F2 */}
                <div className="flex gap-6 md:gap-4">
                  {row1Testimonials.map((testimonial, index) => {
                    const isOddPosition = index % 2 === 0; // 第1、3、5...卡片
                    const bgColor = isOddPosition ? '#FFF9E8' : '#FCF2F2';
                    let translateY = 0;

                    // 每三张为一组：第一张下移 40px，第二张保持原高度，第三张下移 20px
                    const positionInGroup = index % 3;
                    if (positionInGroup === 0) {
                      translateY = 20; // 第一张下移 40px
                    } else if (positionInGroup === 2) {
                      translateY = 40; // 第三张下移 20px
                    } else if (positionInGroup === 1) {
                      translateY = 30; // 二张下移 40px
                    }
                    // positionInGroup === 1 时，translateY 保持为 0（第二张保持原高度）

                    const style: React.CSSProperties =
                      translateY !== 0 ? { transform: `translateY(${translateY}px)` } : {};

                    return (
                      <div
                        key={index}
                        className="rounded-[4px] p-6 flex flex-col gap-2 self-start h-auto md:min-h-[168px] md:max-w-[360px] flex-shrink-0"
                        style={{ ...style, backgroundColor: bgColor }}
                      >
                        <p className="text-[#222222] text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px] ">
                          "{testimonial.text}"
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-shrink-0">
                          {testimonial.avatar ? (
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.author}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
                          )}
                          <span className="text-[#222222] text-[14px] md:text-[16px]">
                            {testimonial.author}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 第二排：每三张一组，第一张下移 20px、第二张下移 40px、第三张保持原高度，所有单数背景 #FFF9E8，其余 #FCF2F2；整体向右偏移 */}
                <div className="flex gap-6 md:gap-4" style={{ marginLeft: '120px' }}>
                  {row2Testimonials.map((testimonial, index) => {
                    const isOddPosition = index % 2 === 0; // 第1、3、5...卡片
                    const bgColor = isOddPosition ? '#FCF2F2' : '#FFF9E8';
                    let translateY = 0;

                    // 每三张为一组：第一张下移 20px，第二张下移 40px，第三张保持原高度
                    const positionInGroup = index % 3;
                    if (positionInGroup === 0) {
                      translateY = 40; // 第一张下移 20px
                    } else if (positionInGroup === 1) {
                      translateY = 10; // 二张下移 40px
                    }
                    // positionInGroup === 2 时，translateY 保持为 0（第三张保持原高度）

                    const style: React.CSSProperties =
                      translateY !== 0 ? { transform: `translateY(${translateY}px)` } : {};

                    return (
                      <div
                        key={index}
                        className="rounded-[4px] p-6 flex flex-col gap-2 self-start h-auto md:min-h-[168px] md:max-w-[360px] flex-shrink-0"
                        style={{ ...style, backgroundColor: bgColor }}
                      >
                        <p className="text-[#222222] text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px] ">
                          "{testimonial.text}"
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-shrink-0">
                          {testimonial.avatar ? (
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.author}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
                          )}
                          <span className="text-[#222222] text-[14px] md:text-[16px] leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px]">
                            {testimonial.author}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 移动端：两排水平弹幕条效果 - 无缝循环 */}
            <div className="md:hidden overflow-x-hidden overflow-y-visible w-full pb-4 relative">
              {/* 左右渐变遮罩 */}
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              <div
                className="flex flex-col gap-4"
                style={{
                  animation: 'dreamazeMarqueeMobile 40s linear infinite',
                  width: 'fit-content',
                }}
              >
                {/* 第一排：单数索引卡片 */}
                <div className="flex gap-4">
                  {row1Testimonials.map((testimonial, index) => {
                    const isOddPosition = index % 2 === 0; // 第1、3、5...卡片
                    const bgColor = isOddPosition ? '#FFF9E8' : '#FCF2F2';
                    let translateY = 0;

                    // 每三张为一组：第一张下移 15px，第二张保持原高度，第三张下移 10px
                    const positionInGroup = index % 3;
                    if (positionInGroup === 0) {
                      translateY = 15; // 第一张下移 15px
                    } else if (positionInGroup === 2) {
                      translateY = 10; // 第三张下移 10px
                    }
                    // positionInGroup === 1 时，translateY 保持为 0（第二张保持原高度）

                    const style: React.CSSProperties =
                      translateY !== 0 ? { transform: `translateY(${translateY}px)` } : {};

                    return (
                      <div
                        key={`mobile-row1-${index}`}
                        className="rounded-[4px] p-4 flex flex-col gap-2 self-start h-auto max-w-[280px] flex-shrink-0"
                        style={{ ...style, backgroundColor: bgColor }}
                      >
                        <p className="text-[#222222] text-[14px] font-normal leading-[20px] tracking-[0.25px]">
                          "{testimonial.text}"
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-shrink-0">
                          {testimonial.avatar ? (
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.author}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                          )}
                          <span className="text-[#222222] text-[12px]">
                            {testimonial.author}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 第二排：双数索引卡片，整体右移 */}
                <div className="flex gap-4" style={{ marginLeft: '60px' }}>
                  {row2Testimonials.map((testimonial, index) => {
                    const bgColor = '#FFF9E8'; // 第二排所有卡片都是 #FFF9E8
                    let translateY = 0;

                    // 每三张为一组：第一张下移 10px，第二张保持原高度，第三张下移 15px
                    const positionInGroup = index % 3;
                    if (positionInGroup === 0) {
                      translateY = 10; // 第一张下移 10px
                    } else if (positionInGroup === 2) {
                      translateY = 15; // 第三张下移 15px
                    }
                    // positionInGroup === 1 时，translateY 保持为 0（第二张保持原高度）

                    const style: React.CSSProperties =
                      translateY !== 0 ? { transform: `translateY(${translateY}px)` } : {};

                    return (
                      <div
                        key={`mobile-row2-${index}`}
                        className="rounded-[4px] p-4 flex flex-col gap-2 self-start h-auto max-w-[280px] flex-shrink-0"
                        style={{ ...style, backgroundColor: bgColor }}
                      >
                        <p className="text-[#222222] text-[14px] font-normal leading-[20px] tracking-[0.25px]">
                          "{testimonial.text}"
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-shrink-0">
                          {testimonial.avatar ? (
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.author}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                          )}
                          <span className="text-[#222222] text-[12px]">
                            {testimonial.author}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 水平漂浮动画定义 - 无缝循环 */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @keyframes dreamazeMarquee {
                    0% {
                      transform: translateX(0%);
                    }
                    100% {
                      transform: translateX(-50%);
                    }
                  }
                  @keyframes dreamazeMarqueeMobile {
                    0% {
                      transform: translateX(0%);
                    }
                    100% {
                      transform: translateX(-50%);
                    }
                  }
                `,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Tips Section 组件
const TipsSection: React.FC<{ section: BookSection }> = ({ section }) => {
  const tips = section.tips || [];
  // 将提示列表分成两列
  const leftColumn = tips.slice(0, Math.ceil(tips.length / 2));
  const rightColumn = tips.slice(Math.ceil(tips.length / 2));

  return (
    <div className={`w-full bg-white md:h-[504px] h-auto md:py-[88px] py-12 px-[80px] md:px-0 flex flex-col md:gap-[48px] gap-6 ${section.className || ''}`}>
      {section.title && (
        <h2 className="md:font-medium text-[24px] font-semibold leading-[32px] md:text-[40px] md:leading-[40px] text-[#222222] text-center">
          {section.title}
        </h2>
      )}
      
      <div className="flex flex-col md:flex-row md:gap-[48px] gap-4 max-w-[1060px] md:h-[240px] h-auto mx-auto w-full md:px-4 px-0 md:items-center items-start justify-center">
        {/* 左列 */}
        <div className="flex flex-col md:gap-12 gap-4 ">
          {leftColumn.map((tip, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="md:w-12 w-9 md:h-12 h-9 bg-gray-300 shrink-0"></div>
              <span className="text-[#222222] md:font-medium font-normal md:text-[18px] text-[14px] md:leading-[24px] leading-[20px] md:tracking-[0.5px] tracking-[0.25px]">• {tip}</span>
            </div>
          ))}
        </div>
        
        {/* 右列 */}
        <div className="flex flex-col md:gap-12 gap-4 ">
          {rightColumn.map((tip, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="md:w-12 w-9 md:h-12 h-9 bg-gray-300 shrink-0"></div>
              <span className="text-[#222222] md:font-medium font-normal md:text-[18px] text-[14px] md:leading-[24px] leading-[20px] md:tracking-[0.5px] tracking-[0.25px]">• {tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Why you need a personalized book? Section 组件
const WhyPersonalizedSection: React.FC<{ section: BookSection }> = ({ section }) => {
  return (
    <div className={`${section.className || ''} flex flex-col gap-[24px] md:gap-[48px]`}>
      {section.title && (
        <h2
          className="text-center text-[24px] md:text-[40px] font-semibold md:font-medium leading-[32px] md:leading-[64px]"
          style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
        >
          {section.title}
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 gap-[6px] md:w-[732px] md:h-[532px] mx-auto justify-items-center md:justify-items-stretch w-full px-4 md:px-0">
        {(section.items || []).map((item, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-[4px] h-auto w-full max-w-[343px] md:h-[260px] md:w-[360px] md:pt-16 md:pr-9 md:pb-12 md:pl-9 pt-6 pr-9 pb-6 pl-9 bg-[#FBE5E5]">
            {/* 背景图层 */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                backgroundImage: item.backgroundImage ? `url(${item.backgroundImage})` : undefined,
                backgroundPosition: 'right bottom',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'auto 100%',
                minHeight: '100%'
              }}
            />
            {/* 文案 */}
            <div className="relative z-10 flex flex-col md:absolute md:left-9 md:top-16 md:right-9 md:bottom-12 md:gap-6 gap-3">
              <h3 className="text-[#222222] text-[18px] md:text-[16px] font-medium">{item.title}</h3>
              <p className="text-[#666666] text-[14px] md:text-[16px] font-normal leading-[22px]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Christmas Wonder Section 组件
const ChristmasWonderSection: React.FC<{ section: BookSection }> = ({ section }) => {
  return (
    <div className={`w-full bg-[#FFF5F5] py-12 md:pt-[88px] md:pb-[88px] px-4 md:px-[120px] ${section.className || ''}`}>
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-6 md:gap-[48px] md:items-start">
        {/* 左侧：标题、副标题和插图（桌面端） */}
        <div className="flex flex-col gap-6 md:gap-[80px] md:">
          {/* 标题和副标题 - 保持在顶部 */}
          <div className="flex flex-col gap-2 md:gap-3 flex-shrink-0 text-center md:text-left">
            {section.title && (
              <h2 className="text-[#222222] text-[24px] md:text-[40px] font-semibold md:font-medium leading-[32px] md:leading-[60px]">
                {section.title}
              </h2>
            )}
            
            {section.description && (
              <p className="text-[#222222] text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px]">
                {section.description}
              </p>
            )}
          </div>
          
          {/* 插图 - 桌面端：使用  和 items-center 来垂直居中 */}
          {section.illustrationImage && (
            <div className="hidden md:flex w-full items-center justify-start md: md:items-center md:justify-start">
              <img 
                src={section.illustrationImage} 
                alt="Christmas Wonder Illustration" 
                className="w-auto max-h-[250px] object-contain"
              />
            </div>
          )}
        </div>
        
        {/* 右侧：评价列表 - 从顶部开始，独立于左侧 */}
        {section.testimonials && section.testimonials.length > 0 && (
          <div className=" flex flex-col md:gap-12 gap-7 md:self-start">
            {section.testimonials.map((testimonial, index) => {
                // 根据索引定义每个卡片的样式
                const cardStyles = [
                  // 第1个：angle: 4deg, border-radius: 48px 120px 120px 4px
                  {
                    transform: 'rotate(-4deg)',
                    borderRadius: '120px 120px 120px 4px',
                  },
                  // 第2个：angle: -2deg, border-radius: 48px 48px 4px 48px
                  {
                    transform: 'rotate(2deg)',
                    borderRadius: '48px 48px 4px 48px',
                  },
                  // 第3个：angle: 0deg, border-radius: 48px 120px 120px 4px
                  {
                    transform: 'rotate(0deg)',
                    borderRadius: '120px 120px 120px 4px',
                  },
                  // 第4个：angle: -2deg, border-radius: 48px 48px 4px 48px
                  {
                    transform: 'rotate(2deg)',
                    borderRadius: '48px 48px 4px 48px',
                  },
                ];
                
                const style = cardStyles[index] || cardStyles[0];
                // 第1和第3个（索引0和2）：头像在左侧；第2和第4个（索引1和3）：头像在右侧
                const isAvatarRight = index === 1 || index === 3;
                
                return (
                  <div 
                    key={index}
                    className={`bg-white flex items-center hidden md:flex gap-3 ${isAvatarRight ? 'flex-row-reverse' : ''}`}
                    style={{
                      padding: '24px',
                      transform: style.transform,
                      borderRadius: style.borderRadius,
                      opacity: 1,
                    }}
                  >
                    {/* 头像 */}
                    {testimonial.avatar ? (
                      <img 
                        src={testimonial.avatar} 
                        alt="Avatar" 
                        className="w-10 h-10 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 flex-shrink-0"></div>
                    )}
                    
                    {/* 评价文本 */}
                    <p className="text-[#222222] text-[14px] md:text-[18px] font-normal md:font-medium leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px] ">
                      "{testimonial.text}"
                    </p>
                  </div>
                );
            })}
            {/* 移动端显示 */}
            {section.testimonials.map((testimonial, index) => {
              // 根据索引定义每个移动端卡片的样式
              const mobileCardStyles = [
                // 第1个：angle: 4deg, border-radius: 36px 120px 120px 4px
                {
                  transform: 'rotate(-4deg)',
                  borderRadius: '120px 120px 120px 4px',
                },
                // 第2个：angle: -2deg, border-radius: 48px 48px 4px 48px
                {
                  transform: 'rotate(2deg)',
                  borderRadius: '48px 48px 4px 48px',
                },
                // 第3个：angle: 4.01deg, border-radius: 36px 120px 120px 4px
                {
                  transform: 'rotate(-4.01deg)',
                  borderRadius: '120px 120px 120px 4px',
                },
                // 第4个：angle: -2deg, border-radius: 48px 48px 4px 48px
                {
                  transform: 'rotate(2deg)',
                  borderRadius: '48px 48px 4px 48px',
                },
              ];
              
              const mobileStyle = mobileCardStyles[index] || mobileCardStyles[0];
              // 第1和第3个（索引0和2）：头像在左侧；第2和第4个（索引1和3）：头像在右侧
              const isAvatarRight = index === 1 || index === 3;
              
              return (
                <div 
                  key={`mobile-${index}`}
                  className={`bg-white flex items-center md:hidden gap-[12px] ${isAvatarRight ? 'flex-row-reverse' : ''}`}
                  style={{
                    padding: '12px 24px',
                    transform: mobileStyle.transform,
                    borderRadius: mobileStyle.borderRadius,
                    opacity: 1,
                  }}
                >
                  {/* 头像 */}
                  {testimonial.avatar ? (
                    <img 
                      src={testimonial.avatar} 
                      alt="Avatar" 
                      className="w-10 h-10 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 flex-shrink-0"></div>
                  )}
                  
                  {/* 评价文本 */}
                  <p className="text-[#222222] text-[14px] md:text-[18px] font-normal md:font-medium leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px] ">
                    "{testimonial.text}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
        
        {/* 移动端：插图显示在评论下方，水平居中 */}
        {section.illustrationImage && (
          <div className="w-full flex items-center justify-center md:hidden">
            <img 
              src={section.illustrationImage} 
              alt="Christmas Wonder Illustration" 
              className="w-auto max-h-[120px] object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// FAQ Section 组件
const FAQSection: React.FC<{ section: BookSection }> = ({ section }) => {
  const faqs = section.faqs || [];
  const [openFaq, setOpenFaq] = useState<number>(1); // 默认展开第一个

  return (
    <div className={`w-full bg-[#F8F8F8] py-16 px-3 md:px-0 md:py-22 ${section.className || ''}`}>
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {section.title && (
          <h2 className="text-center text-[22px] md:text-[40px] font-medium text-[#222222] md:mb-12 mb-6">
            {section.title}
          </h2>
        )}
        <div className="divide-y divide-[#222222]">
          {faqs.map((faq, index) => {
            const num = index + 1;
            const isOpen = openFaq === num;
            return (
              <div key={index} className="py-4">
                <button
                  onClick={() => setOpenFaq(isOpen ? 0 : num)}
                  className="w-full flex items-start justify-between text-left"
                >
                  <div className="flex items-start gap-2 md:gap-4">
                    <span className="text-[#222222] font-medium text-[16px] md:text-[18px] leading-[24px]">
                      {String(num).padStart(2, '0')}
                    </span>
                    <span className="text-[#222222] text-[16px] md:text-[18px] leading-[24px] tracking-[0.15px] font-medium">
                      {faq.question}
                    </span>
                  </div>
                  <span className="text-[#222222] text-[24px] font-medium flex-shrink-0 leading-[24px]">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`md:pl-6 pl-[28px] pr-6 md:pr-0 text-[#222222] text-[14px] md:text-[16px] leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px] overflow-hidden transition-all ${
                    isOpen ? 'max-h-[500px] mt-2' : 'max-h-0'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Section 渲染器
const renderSection = (section: BookSection, index: number) => {
  switch (section.type) {
    case 'behind-story':
      return <BehindStorySection key={index} section={section} />;
    case 'toddler-favorites':
      return <ToddlerFavoritesSection key={index} section={section} />;
    case 'why-personalized':
      return <WhyPersonalizedSection key={index} section={section} />;
    case 'meet-author':
      return <MeetAuthorSection key={index} section={section} />;
    case 'personalization-power':
      return <PersonalizationPowerSection key={index} section={section} />;
    case 'tips':
      return <TipsSection key={index} section={section} />;
    case 'christmas-wonder':
      return <ChristmasWonderSection key={index} section={section} />;
    case 'dreamaze-special':
      return <DreamazeSpecialSection key={index} section={section} />;
    case 'faq':
      return <FAQSection key={index} section={section} />;
    case 'custom':
      // 如果有自定义渲染函数，使用它
      if (section.render) {
        return <React.Fragment key={index}>{section.render()}</React.Fragment>;
      }
      // 否则使用默认渲染
      return (
        <div key={index} className={section.className}>
          {section.title && <h2>{section.title}</h2>}
          {section.content && <p>{section.content}</p>}
        </div>
      );
    default:
      return null;
  }
};

const BookSections: React.FC<BookSectionsProps> = ({ book, bookId }) => {
  const config = getBookConfig(book, bookId);
  
  if (!config || !config.sections || config.sections.length === 0) {
    return null;
  }

  return (
    <>
      {config.sections.map((section, index) => renderSection(section, index))}
    </>
  );
};

export default BookSections;

