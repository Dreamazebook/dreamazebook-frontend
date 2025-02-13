import Image from 'next/image';

interface IconProps {
  cssClass:string
  icon:string
}

function Icon({cssClass, icon}:IconProps) {
  return (
    <Image src={`/welcome/growth/${icon}.png`} alt={'icon'} className={cssClass} width={56} height={56} />

  )
}

export default function Growth() {
  return (
    <div className="container bg-white mx-auto px-4 py-16">
      <h2 className="text-5xl font-bold text-center mb-8">Dreamaze Book&apos;s <span className="text-blue-500">growth</span></h2>
      <div className="max-w-3xl mx-auto">
        {[
          {icon:'done' ,tl: 'Initial Idea Sparked', date:'May 2023'},
          {icon:'done' ,tl: 'Product Research', date:'June 2023'},
          {icon:'done' ,tl: 'AI Workflow Development', date:'July 2023'},
          {icon:'done' ,tl: 'Illustration&Content Development', date:'October 2023'},
          {icon:'done' ,tl: 'Prototype Creation', date:'January 2024'},
          {icon:'done' ,tl: 'Factory Visits', date:'May 2024'},
          {icon:'done' ,tl: 'Early Tester Feedback', date:'September 2024'},
          {icon:'ongoing',isCur:true,tl: 'Kickstarter Prelaunch', date:'February-March 2025'},
          {icon:'pending',isCur:true,tl: 'Finalize Website', date:'March 2024'},
          {icon:'kickstarter',isCur:true,tl: 'Kickstart launching', date:'April 2024'},
          {icon:'pending',isCur:true,tl: 'Ship to customers', date:'June 2024'}
        ].map(({tl, date, isCur, icon}, idx)=> {
          const isEven = idx%2 === 0;
          return (
            <div key={idx} className={`mb-3 ${isEven?'':'flex-row-reverse'}  border-dotted pl-4 flex`}>
              <div className={`flex w-1/2 gap-3 ${isEven?'border-r flex-row-reverse':'border-l'}`}>
                {<Icon icon={icon} cssClass={isEven?'-mr-7':'-ml-7'} />}

                <div className={isEven?'text-right':'text-left'}>
                  <h3 className={`font-bold md:text-nowrap text-xl ${isCur?'text-blue-700':''}`}>{tl}</h3>
                  <p className={`${isCur?'text-black':'text-gray-400'} mt-1`}>{date}</p>
                </div>

              </div>
              <div className="w-1/2"></div>
            </div>
          )
        }
          
        )}
      </div>
    </div>
  )
}