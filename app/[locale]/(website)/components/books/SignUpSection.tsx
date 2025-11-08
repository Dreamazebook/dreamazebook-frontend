'use client';

import React, { useState } from 'react';

interface SignUpSectionProps {
  title?: string;
  placeholder?: string;
  buttonText?: string;
  backgroundImage?: string;
}

const SignUpSection: React.FC<SignUpSectionProps> = ({
  title = 'Sign up for 10% off your first order!',
  placeholder = 'Enter your email address',
  buttonText = 'Sign up',
  backgroundImage = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/bg-sign-up.jpg',
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 实现提交逻辑
    console.log('Email submitted:', email);
  };

  return (
    <section
      className="relative w-full flex flex-col items-center justify-center py-[48px] px-[18px] md:h-[196px] md:pt-[48px] md:pr-[120px] md:pb-[48px] md:pl-[120px] gap-[24px] overflow-hidden"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center 80%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 半透明深色遮罩 */}
      <div className="absolute inset-0 bg-[#000000]/60 z-0" />

      {/* 内容容器 */}
      <div className="relative z-10 flex flex-col items-center gap-[24px] w-full max-w-[1200px]">
        {/* 主标题 */}
        <h2 className="text-center text-white font-semibold md:font-normal text-[24px] leading-[32px] tracking-[0px] md:text-[28px] md:leading-[36px]">
          {title}
        </h2>

        {/* 输入框和按钮容器 */}
        <form
          onSubmit={handleSubmit}
          className="w-full h-[40px] border border-[#FFFFFF]/40 rounded-[4px] px-[16px] py-[8px] flex flex-row items-center gap-4 w-full max-w-[500px]"
        >
          {/* 输入框 */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            className="w-full md:w-[384px] md:h-[40px] py-[8px] rounded-[4px] bg-transparent text-[#FFFFFF]/40 text-[14px] leading-[20px] tracking-[0.25px] placeholder:text-[#FFFFFF]/40 focus:outline-none focus:ring-2 focus:ring-white/50"
          />

          {/* 竖杠分隔符 */}
          <svg width="1" height="20" viewBox="0 0 1 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.5 0V20" stroke="white" strokeOpacity="0.2"/>
          </svg>


          {/* 按钮 */}
          <button
            type="submit"
            className="text-[16px] leading-[24px] tracking-[0.5px] md:w-auto h-[40px] bg-transparent rounded-[4px] text-[#FFFFFF] transition-colors whitespace-nowrap"
          >
            {buttonText}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SignUpSection;

