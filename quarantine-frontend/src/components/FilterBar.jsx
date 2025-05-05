// src/components/FilterBar.jsx
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function FilterBar({
  from,     setFrom,
  to,       setTo,
  type,     setType,
  search,   setSearch,
  onFilter,
  onReset
}) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-lg grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
      
      {/* Rango Desde */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1">Desde</label>
        <DatePicker
          selected={from}
          onChange={date => setFrom(date)}
          className="w-full bg-gray-800 text-white border-gray-700 rounded-md py-2 px-3"
        />
      </div>

      {/* Rango Hasta */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1">Hasta</label>
        <DatePicker
          selected={to}
          onChange={date => setTo(date)}
          className="w-full bg-gray-800 text-white border-gray-700 rounded-md py-2 px-3"
        />
      </div>

      {/* Tipo de mensaje */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1">Tipo</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full bg-gray-800 text-white border-gray-700 rounded-md py-2 px-3"
        >
          <option value="all">Todos</option>
          <option value="new">Nuevos</option>
          <option value="spam">Spam</option>
          <option value="phish">Phishing</option>
          <option value="bulk">Masivos</option>
        </select>
      </div>

      {/* Búsqueda libre */}
      <div className="lg:col-span-2">
        <label className="block text-sm font-semibold text-gray-300 mb-1">Buscar (asunto o remitente)</label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ej: invoice, noreply@..."
          className="w-full bg-gray-800 text-white border-gray-700 rounded-md py-2 px-3"
        />
      </div>

      {/* Botones */}
      <div className="flex space-x-2 lg:col-span-5 lg:justify-end">
        <button
          onClick={onReset}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md transition"
        >
          Reset
        </button>
        <button
          onClick={onFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
}