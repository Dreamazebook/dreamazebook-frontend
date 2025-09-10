import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownProps> = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = (): TimeLeft => {
    const difference = +targetDate - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        onComplete?.();
      }
    }, 1000);

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center group">
      <div className="relative">
        <span className="text-6xl lg:text-7xl font-light text-[#222] tabular-nums transition-all duration-300 group-hover:scale-105">
          {formatNumber(value)}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      </div>
      <span className="text-xs sm:text-sm md:text-base font-medium text-[#666] uppercase tracking-wider mt-2">
        {label}
      </span>
    </div>
  );

  const Separator: React.FC = () => (
    <div className="flex items-center justify-center h-full pb-8">
      <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-400">
        :
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="p-8 sm:p-12 md:p-16 max-w-4xl w-full">
        <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-8">
          <TimeUnit value={timeLeft.days} label="DAYS" />
          <Separator />
          <TimeUnit value={timeLeft.hours} label="HOURS" />
          <Separator />
          <TimeUnit value={timeLeft.minutes} label="MIN" />
          <Separator />
          <TimeUnit value={timeLeft.seconds} label="SEC" />
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;