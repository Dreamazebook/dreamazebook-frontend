import React from 'react';
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
          className="text-center text-[40px] font-medium leading-[64px]"
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
              className="text-center lg:text-[40px] text-[24px] font-medium lg:leading-[64px] leading-[40px]"
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
                    <div className="flex-1 flex flex-col justify-end pb-2 z-10">
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

// Section 渲染器
const renderSection = (section: BookSection, index: number) => {
  switch (section.type) {
    case 'behind-story':
      return <BehindStorySection key={index} section={section} />;
    case 'toddler-favorites':
      return <ToddlerFavoritesSection key={index} section={section} />;
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

