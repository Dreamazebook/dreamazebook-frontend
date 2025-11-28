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
          transform: translateX(-25%);
        }
      }

      .scroll-loop-container {
        animation: scrollLoop 40s linear infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="h-[157px] bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="w-full overflow-hidden">
          <div
            className="scroll-loop-container flex items-center"
            style={{
              width: '400%',
            }}
          >
            <div className="">
              <img
                src="/home-page/logo.png"
                alt="Animated graphic 1"
                className="max-w-full h-auto block"
                draggable={false}
              />
            </div>
            <div className="">
              <img
                src="/home-page/logo.png"
                alt="Animated graphic 2"
                className="max-w-full h-auto block"
                draggable={false}
              />
            </div>
            <div className="">
              <img
                src="/home-page/logo.png"
                alt="Animated graphic 3"
                className="max-w-full h-auto block"
                draggable={false}
              />
            </div>
            <div className="">
              <img
                src="/home-page/logo.png"
                alt="Animated graphic 4"
                className="max-w-full h-auto block"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
