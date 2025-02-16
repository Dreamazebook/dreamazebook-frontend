'use client';
import { useState } from "react";
import {useRouter} from 'next/navigation'

export default function EmailForm() {
  const router = useRouter();

  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      router.push('/en/welcome/reserve');
      
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
          placeholder='example@gmail.com' 
          className='w-full text-black bg-white p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
          aria-label="Email address"
        />
        <button 
          disabled={isLoading}
          className='bg-landing-page-btn text-white px-4 py-2 rounded uppercase w-full disabled:opacity-50 hover:opacity-90 transition-opacity flex justify-center items-center'
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Reserve Save 40%'
          )}
        </button>
      </form>


      {responseMessage && (
        <div>
          <p className={`p-4 rounded-md ${
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