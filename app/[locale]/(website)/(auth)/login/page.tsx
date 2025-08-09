'use client';

import { useState } from 'react';
import LoginModal from '../../components/LoginModal';

export default function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginModal />
    </div>
  );
}