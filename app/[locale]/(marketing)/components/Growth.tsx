function CheckMark() {
  return (
    <svg width="27" height="19" viewBox="0 0 27 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.33398 8.39583L10.5007 16.5625L24.5007 2.5625" stroke="#999999" strokeWidth="4.66667" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Growth() {
  return (
    <div className="container bg-white mx-auto px-4 py-16">
      <h2 className="text-5xl font-bold text-center mb-8">Dreamaze Book&apos;s <span className="text-blue-500">growth</span></h2>
      <div className="max-w-xl mx-auto">
        {[
          {tl: 'Initial Idea Sparked', date:'May 2023'},
          {tl: 'Product Research', date:'June 2023'},
          {tl: 'AI Workflow Development', date:'July 2023'},
          {tl: 'Illustration&Content Development', date:'October 2023'},
          {tl: 'Prototype Creation', date:'January 2024'},
          {tl: 'Factory Visits', date:'May 2024'},
          {tl: 'Early Tester Feedback', date:'September 2024'},
          {icon:'',isCur:true,tl: 'Kickstarter Prelaunch', date:'February-March 2025'},
          {icon:'',isCur:true,tl: 'Finalize Website', date:'March 2024'},
          {icon:'',isCur:true,tl: 'Kickstart launching', date:'April 2024'},
          {icon:'',isCur:true,tl: 'Ship to customers', date:'June 2024'}
        ].map(({tl, date, isCur, icon}, idx)=> {
          const isEven = idx%2 === 0;
          return (
            <div key={idx} className={`mb-3 ${isEven?'':'flex-row-reverse'}  border-dotted pl-4 flex`}>
              <div className={`flex w-1/2 gap-3 ${isEven?'border-r flex-row-reverse':'border-l'}`}>
                {
                icon?
                <div></div>:
                <CheckMark />}

                <div className={isEven?'text-right':'text-left'}>
                  <h3 className={`font-bold text-nowrap text-xl ${isCur?'text-blue-700':''}`}>{tl}</h3>
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