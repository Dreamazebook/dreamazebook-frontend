'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PreviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // 从 sessionStorage 获取表单数据
    const storedData = sessionStorage.getItem('personalizeFormData');
    if (storedData) {
      setFormData(JSON.parse(storedData));
    } else {
      router.push('/'); // 如果数据不存在，跳转回首页
    }
  }, [router]);

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Preview Your Book</h1>
        <p><strong>Full Name:</strong> {formData.fullName}</p>
        <p><strong>Gender:</strong> {formData.gender}</p>
        <p><strong>Skin Color:</strong> {formData.skinColor}</p>
        {formData.imageUrl && (
          <img
            src={formData.imageUrl}
            alt="Uploaded Preview"
            className="mt-4 rounded shadow"
          />
        )}
      </div>
    </div>
  );
}
