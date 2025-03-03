/** @jsxImportSource react */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { BaseBook } from '@/types/book';
import { IoIosArrowBack } from "react-icons/io";

import SingleCharacterForm1, {
  SingleCharacterForm1Handle,
} from '../components/personalize/SingleCharacterForm1';
import SingleCharacterForm2, {
  SingleCharacterForm2Handle,
} from '../components/personalize/SingleCharacterForm2';

//import DoubleCharacterForm from '../components/personalize/DoubleCharacterForm';

export default function PersonalizePage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookid');
  const router = useRouter();

  const [book, setBook] = useState<BaseBook | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<'SINGLE1' | 'SINGLE2' | 'DOUBLE' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const singleForm1Ref = useRef<SingleCharacterForm1Handle>(null);
  const singleForm2Ref = useRef<SingleCharacterForm2Handle>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (bookId) {
        try {
          const response = await api.get<{ book: BaseBook }>(`/books/${bookId}`);
          setBook(response.book);

          // logic for deciding which form
          switch (response.book.formid) {
            case 1:
              setSelectedFormType('SINGLE2');
              break;
            case 2:
              setSelectedFormType('SINGLE1');
              break;
            case 3:
              setSelectedFormType('DOUBLE');
              break;
            case 4:
              // User chooses single or double from a modal
              setShowModal(true);
              break;
            default:
              console.error('Invalid form type');
              break;
          }
        } catch (error) {
          console.error('Failed to fetch book:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBook();
  }, [bookId]);

  const renderForm = () => {
    if (!selectedFormType) return null;

    switch (selectedFormType) {
      case 'SINGLE1':
        return <SingleCharacterForm1 ref={singleForm1Ref} />;
      case 'SINGLE2':
        return <SingleCharacterForm2 ref={singleForm2Ref} />;
      case 'DOUBLE':
        //return <DoubleCharacterForm />;
      default:
        return null;
    }
  };

  const handleContinue = () => {
    // if SINGLE1, validate that form
    if (selectedFormType === 'SINGLE1' && singleForm1Ref.current) {
      const isValid = singleForm1Ref.current.validateForm();
      if (!isValid) return;
      router.push(`/preview?bookId=${bookId}`);
      return;
    }

    // If SINGLE2
    if (selectedFormType === 'SINGLE2' && singleForm2Ref.current) {
      const isValid = singleForm2Ref.current.validateForm();
      if (!isValid) return;
      router.push(`/select-book-content?bookId=${bookId}`);
      return;
    }

    // If DOUBLE, do something else

    //router.push(`/preview?bookId=${bookId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* 顶部导航栏 */}
      <div className="h-14 bg-white flex items-center px-4 sm:px-32">
        <div className="flex items-center justify-between w-full sm:hidden">
          <Link href={`/books/${bookId}`} className="flex items-center text-gray-700 hover:text-blue-500">
            <IoIosArrowBack size={24} />
          </Link>
          <Link href="/" className="flex items-center justify-center flex-grow p-2">
            <img src="/logo.png" alt="Home" className="w-[114.29px] h-[40px]" />
          </Link>
        </div>
        <Link href={`/books/${bookId}`} className="hidden sm:flex items-center text-sm">
          <span className="mr-2">←</span> Back to the product page
        </Link>
      </div>

      {showModal && book?.formid === 3 && (
        <div>Modal to choose SINGLE or DOUBLE</div>
      )}

      <div className="mx-auto">
        <h1 className="text-2xl text-center my-6">Please fill in the basic information</h1>
        {renderForm()}
        <div className="flex justify-center">
          <button 
            type="button" 
            onClick={handleContinue} 
            style={{ width: '180px' }}
            className="bg-black text-white py-3 rounded hover:bg-gray-800 mb-16"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
