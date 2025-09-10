import DreamzeImage from '@/app/components/DreamzeImage';
import { TESTIMONIAL_BANNER } from '@/constants/cdn';
import React, { useState } from 'react';
import EmailForm from '../../components/EmailForm';

const TestimonialSlider: React.FC = () => {

  const [hideForm, setHideForm] = useState(false);

  return (
    <div className="relative w-full max-w-4xl py-18 mx-auto bg-white">
      {/* Header */}
      <div className="text-center mb-12 px-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Loved By Parents & Kids
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Real stories from family who already received their DreamazeBook
        </p>
        
        <div className="w-full relative aspect-[802/855] mt-8">
          <DreamzeImage src={TESTIMONIAL_BANNER} alt="Testimonial Banner" unoptimized={true} />
        </div>
      </div>

      <div className='p-4 max-w-[528px] bg-white/75 text-center absolute bottom-1 left-1 right-1 mx-auto md:static'>
        {!hideForm && <h3 className="mb-4 font-bold text-[24px]">Only 300 Early Bird spots – <span className="text-[#012DCE]">40% OFF</span></h3>}

        <div className="max-w-lg">
          <EmailForm btnId="email_submit_header" btnText="Unlock 40% Off Early" redirectUrl={'/en/welcome/success'} handleCallBack={()=>setHideForm(true)} />
        </div>
      </div>

    </div>
  );
};

export default TestimonialSlider;