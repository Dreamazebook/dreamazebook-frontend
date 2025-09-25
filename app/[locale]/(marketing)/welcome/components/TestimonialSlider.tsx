import DreamzeImage from '@/app/components/DreamzeImage';
import { TESTIMONIAL_BANNER } from '@/constants/cdn';
import React from 'react';
import Button from '@/app/components/Button';
import { KICKSTARTER_URL } from '@/constants/links';

const TestimonialSlider: React.FC = () => {
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

      <div className="mt-10 max-w-[334px] mx-auto">
        <Button url={KICKSTARTER_URL} tl={'Unlock 40% Off Early'} />
      </div>

    </div>
  );
};

export default TestimonialSlider;