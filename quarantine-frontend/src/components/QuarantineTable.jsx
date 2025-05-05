// src/components/QuarantineTable.jsx
import React, { useState } from 'react';
import PreviewModal from './PreviewModal.jsx';

export default function QuarantineTable({ messages }) {
  const [selectedMsg, setSelectedMsg] = useState(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-800">
              {['Recibido', 'De', 'Para', 'Asunto', 'Acciones'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-300"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}
              >
                <td className="px-4 py-2 text-gray-100 text-sm">
                  {new Date(msg.ReceivedTime).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-gray-100 text-sm">
                  {msg.SenderAddress}
                </td>
                <td className="px-4 py-2 text-gray-100 text-sm">
                  {Array.isArray(msg.RecipientAddress)
                    ? msg.RecipientAddress.join(', ')
                    : msg.RecipientAddress}
                </td>
                <td className="px-4 py-2 text-gray-100 text-sm">{msg.Subject}</td>
                <td className="px-4 py-2 text-gray-100 text-sm">
                  <button
                    onClick={() => setSelectedMsg(msg)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition"
                  >
                    Vista
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMsg && (
        <PreviewModal
          message={selectedMsg}
          onClose={() => setSelectedMsg(null)}
        />
      )}
    </>
  );
}
