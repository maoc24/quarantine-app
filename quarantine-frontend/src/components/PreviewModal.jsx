// src/components/PreviewModal.jsx
import React from 'react';

export default function PreviewModal({ html, text, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-gray-900 text-gray-100 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl"
        >
          ✖️
        </button>
        {html
          ? <div dangerouslySetInnerHTML={{ __html: html }} />
          : <pre className="whitespace-pre-wrap">{text}</pre>
        }
      </div>
    </div>
  );
}