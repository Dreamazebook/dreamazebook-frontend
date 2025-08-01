'use client';
import { useState, useEffect } from "react";
import {useRouter, useSearchParams} from 'next/navigation'
import Button from "@/app/components/Button";
import { fbTrack } from "@/utils/track";

interface EmailFormProps {
  btnText?: string;
  btnId?: string;
  handleCallBack?: () => void;
  redirectUrl?: string;
}

export default function EmailForm({btnText, handleCallBack, btnId='', redirectUrl=''}: EmailFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountDown] = useState(3);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (responseMessage && !isError && countdown > 0) {
      intervalId = setInterval(() => {
        setCountDown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [responseMessage, isError, countdown]);

  if (responseMessage && !isError) {
    router.push(redirectUrl);
    return null;
    if (countdown === 0) {
      router.push(redirectUrl);
      return null;
    }
    return (
      <div className="text-center text-[20px] font-semibold p-4 bg-[#FFC023] text-white">
        <p className="text-[28px]">Thanks!</p>
        <p className="capitalize">Time to Lift Off,<br/>Grab Your Spot and Lock in Your Deal</p>
        <p className="text-[18px]">{countdown}s</p>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setResponseMessage('');
    fbTrack('Lead');
    const form = event.currentTarget;
    const emailInput = (form.elements.namedItem('email') as HTMLInputElement).value;
    let utmCampaign = searchParams.get('utm_campaign') || '';
    if (utmCampaign.includes('_')) {
      utmCampaign = utmCampaign.split('_')[0];
    }

    try {
      const response = await fetch(
        "/api/subscriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              email: emailInput,
              properties: {
                region: utmCampaign,
              }
            }
          )
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        setIsError(true);
        setResponseMessage(data.msg);
        return;
      } 
      // else {
      //   router.push(redirectUrl);
      //   return;
      // }

      setResponseMessage(data.msg);
      if (typeof handleCallBack === 'function') {
        //handleCallBack();
      }
      
    } catch (error) {
      console.error("Error subscribing email:", error);
      setIsError(true);
      setResponseMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input 
          required 
          type="email" 
          name="email" 
          placeholder='Enter your email' 
          className='w-full text-black caret-[#999999] bg-white p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
          aria-label="Email address"
        />
        <Button id={btnId} tl={btnText||'Reserve and Save 40%'} isLoading={isLoading} />
      </form>


      {responseMessage && (
        <div>
          <p className={`p-4 mt-4 rounded-md ${
            isError 
              ? 'text-red-600 bg-red-100' 
              : 'text-green-600 bg-green-100'
          }`}>
            {responseMessage}
          </p>
        </div>
      )}
    </>
  )
}