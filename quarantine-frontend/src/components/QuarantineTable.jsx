// src/components/QuarantineTable.jsx
import { format } from 'date-fns'

export default function QuarantineTable({ messages }) {
  if (messages.length === 0) {
    return <p className="p-4">No se encontraron mensajes.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Recibido','De','Para','Asunto'].map(col => (
              <th
                key={col}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {messages.map((m, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2">{format(new Date(m.ReceivedTime), 'Pp')}</td>
              <td className="px-4 py-2">{m.SenderAddress}</td>
              <td className="px-4 py-2">{m.RecipientAddress.join(', ')}</td>
              <td className="px-4 py-2">{m.Subject}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
