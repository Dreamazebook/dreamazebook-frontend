'use client';
import { useState, useEffect } from "react";
import {useRouter} from 'next/navigation'
import Button from "@/app/components/Button";

export default function EmailForm() {
  const router = useRouter();

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
    if (countdown === -1) {
      router.push('/en/welcome/reserve');
      return null;
    }
    return (
      <div className="text-center text-[20px] font-bold text-[#222222]">
        <p>Thanks</p>
        <p>Off we go—grab your spot and lock in your deal!</p>
        <p className="text-[14px]">{countdown}S</p>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setResponseMessage('');
    const form = event.currentTarget;
    const emailInput = (form.elements.namedItem('email') as HTMLInputElement).value;

    try {
      const response = await fetch(
        "/api/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({email: emailInput})
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        setIsError(true);
        setResponseMessage(data.msg);
        return;
      }

      setResponseMessage(data.msg);
      
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
          className='w-full text-black bg-white p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
          aria-label="Email address"
        />
        <Button tl={'Reserve Save 40%'} isLoading={isLoading} />
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