import { useState } from "react";

interface MessageModalProps {
  message: string;
  handleMessageSubmit: (message: string) => void;
  handleClose: () => void;
}

export default function MessageModal({handleClose, handleMessageSubmit, message}:MessageModalProps) {
  const [dedication, setDedication] = useState(message);
  
  const maxLines = 10;
  const maxChars = 400;
  const remainingChars = maxChars - dedication.length;
  
  const handleSubmit = () => {
    handleMessageSubmit(dedication);
  };
  
  const countLines = (text:string) => {
    return text.split('\n').length;
  };
  
  const handleTextChange = (e:any) => {
    const newText = e.target.value;
    const lineCount = countLines(newText);
    
    if (lineCount <= maxLines && newText.length <= maxChars) {
      setDedication(newText);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Dedication</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 text-xl font-light"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-600 mb-4">
            There's 10 line limit (including blank lines)
          </p>
          
          {/* Textarea */}
          <div className="relative">
            <textarea
              value={dedication}
              onChange={handleTextChange}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              placeholder="Enter your dedication..."
            />
            
            {/* Character Counter */}
            <div className="absolute bottom-4 right-4 text-sm text-gray-500 bg-white px-1">
              {remainingChars} left
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}