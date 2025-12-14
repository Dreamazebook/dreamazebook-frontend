import { useEffect } from 'react';

export default function InfiniteScrollLogo() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scrollLoop {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }

      .scroll-loop-container {
        animation: scrollLoop 20s linear infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="h-[64px] md:my-[48px] bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="w-full overflow-hidden">
          <div
            className="scroll-loop-container flex items-center gap-0"
            style={{
              width: '200%',
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
            <div className="flex-shrink-0" key={index} style={{ width: '25%' }}>
              <img
                src="/home-page/logo.png"
                alt={`Logo ${index + 1}`}
                className="max-w-full h-auto block w-full"
                draggable={false}
              />
            </div>
            ))}
            {Array.from({ length: 4 }).map((_, index) => (
            <div className="flex-shrink-0" key={`dup-${index}`} style={{ width: '25%' }}>
              <img
                src="/home-page/logo.png"
                alt={`Logo ${index + 1}`}
                className="max-w-full h-auto block w-full"
                draggable={false}
              />
            </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
