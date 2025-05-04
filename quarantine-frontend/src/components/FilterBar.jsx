// src/components/FilterBar.jsx
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Listbox } from '@headlessui/react'

export default function FilterBar({ filters, onChange }) {
  const [start, setStart] = useState(filters.startDate)
  const [end, setEnd]   = useState(filters.endDate)
  const [text, setText] = useState(filters.query)

  const apply = () => onChange({ startDate: start, endDate: end, query: text })

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white shadow rounded">
      <input
        type="text"
        placeholder="Buscar asunto o remitente..."
        className="border rounded px-3 py-2 flex-1"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div>
        <label className="block text-sm">Desde:</label>
        <DatePicker
          selected={start}
          onChange={date => setStart(date)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm">Hasta:</label>
        <DatePicker
          selected={end}
          onChange={date => setEnd(date)}
          className="border rounded px-2 py-1"
        />
      </div>
      <button
        onClick={apply}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Filtrar
      </button>
    </div>
  )
}
