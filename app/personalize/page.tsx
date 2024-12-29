'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const PersonalizePage = ({ params }: { params: { bookid: string } }) => {
  const router = useRouter();
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [skinColorError, setSkinColorError] = useState(false);
  const [genderError, setGenderError] = useState(false);
  const [nameError, setNameError] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const gender = formData.get('gender');
    const isSkinColorSelected = formData.get('skin_color') !== null;
    const file = formData.get('photo') as File | null;

    // Validation
    let hasError = false;

    if (!name?.trim()) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    if (!gender) {
      setGenderError(true);
      hasError = true;
    } else {
      setGenderError(false);
    }

    if (!isSkinColorSelected) {
      setSkinColorError(true);
      hasError = true;
    } else {
      setSkinColorError(false);
    }

    if (hasError) return;

    // Photo validation
    if (!file) {
      alert('Please upload a photo.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or GIF).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB. Please upload a smaller file.');
      return;
    }

    // Submit the form
    alert('Form submitted successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <a href="#" className="text-gray-600 hover:text-gray-800">
          ← Back to Product Page
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block mb-2">
            Full Name <span className="text-gray-500">(or nickname)</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className={`w-full p-2 border rounded ${nameError ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Please enter..."
            required
          />
          {nameError && <p className="text-red-500 text-sm mt-1">Please enter a name</p>}
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block mb-2">Gender</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input type="radio" name="gender" value="boy" className="mr-2" />
              Boy
            </label>
            <label className="flex items-center">
              <input type="radio" name="gender" value="girl" className="mr-2" />
              Girl
            </label>
          </div>
          {genderError && <p className="text-red-500 text-sm mt-1">Please select a gender</p>}
        </div>

        {/* Skin Color Selection */}
        <div>
          <label className="block mb-2">Skin Color</label>
          <div className="flex gap-4">
            {['#F8D5C8', '#F3C6B8', '#D3A27F', '#8E614E'].map((color) => (
              <label key={color} className="cursor-pointer">
                <input
                  type="radio"
                  name="skin_color"
                  value={color}
                  className="sr-only"
                />
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
          {skinColorError && <p className="text-red-500 text-sm mt-1">Please select a skin color</p>}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block mb-2">
            Photo <span className="text-gray-500">(?)</span>
          </label>
          <div className="bg-gray-50 p-4 rounded text-center">
            {previewSrc ? (
              <img src={previewSrc} alt="Preview" className="max-w-xs mx-auto" />
            ) : (
              <>
                <p className="mb-2">Drag & drop your photo here</p>
                <p className="text-gray-500">or</p>
                <input
                  type="file"
                  name="photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-block px-4 py-2 mt-2 border rounded cursor-pointer"
                >
                  Browse Files
                </label>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default PersonalizePage;
