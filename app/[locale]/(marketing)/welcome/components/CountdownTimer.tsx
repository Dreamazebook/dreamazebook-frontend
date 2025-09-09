import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  subtitle?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  title = "Launching on Kickstarter - Sept 16, 8:00 AM EST",
  subtitle = "Only 300 Early Bird spots - 40% OFF",
  className = ""
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const TimeUnit: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    const digits = formatNumber(value).split('');
    
    return (
      <div className="flex flex-col items-center">
        <div className="text-gray-300 text-sm font-medium mb-3 tracking-wider uppercase">
          {label}
        </div>
        <div className="flex space-x-1">
          {digits.map((digit, index) => (
            <div
              key={index}
              className="bg-slate-800 bg-opacity-80 backdrop-blur-sm rounded-lg w-10 h-12 flex items-center justify-center border border-slate-700 shadow-lg"
            >
              <span className="text-white text-3xl font-bold font-mono tracking-tight">
                {digit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 rounded-2xl shadow-2xl ${className}`}>
      {/* Countdown Display */}
      <div className="flex justify-center gap-2 mb-8">
        <TimeUnit label="Days" value={timeLeft.days} />
        <TimeUnit label="Hours" value={timeLeft.hours} />
        <TimeUnit label="Minutes" value={timeLeft.minutes} />
        <TimeUnit label="Seconds" value={timeLeft.seconds} />
      </div>
      
      {/* Description Text */}
      <div className="text-center space-y-2">
        <p className="text-gray-200 text-lg font-medium">
          {title}
        </p>
        <p className="text-blue-300 text-base font-medium">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;