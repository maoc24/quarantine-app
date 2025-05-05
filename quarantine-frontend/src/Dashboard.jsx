// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { subMonths } from 'date-fns';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from './authConfig.mjs';

import FilterBar from './components/FilterBar.jsx';
import QuarantineTable from './components/QuarantineTable.jsx';

export default function Dashboard() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  // Derivar dominio del correo (sin input manual)
  const [domain, setDomain] = useState('');
  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      const email = accounts[0].username; // e.g. "user@empresa.online"
      const dom = email.split('@')[1].split('.')[0];
      setDomain(dom);
    }
  }, [isAuthenticated, accounts]);

  // Filtros de fechas y tipo
  const [from, setFrom] = useState(subMonths(new Date(), 1));
  const [to, setTo]     = useState(new Date());
  const [type, setType] = useState('all');

  // Datos y estados
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // Login explícito
  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (e) {
      setError(e.message);
    }
  };

  // Obtiene mensajes de cuarentena
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) Token silent
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account: accounts[0]
      });
      const token = tokenResponse.accessToken;

      // 2) Parámetros
      const params = new URLSearchParams({
        domain,
        from: from.toISOString(),
        to:   to.toISOString(),
        type
      });

      // 3) Llamada al backend
      const res = await fetch(`http://localhost:5148/api/quarantine?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Al autenticarse, cargar automáticamente
  useEffect(() => {
    if (isAuthenticated && domain) {
      fetchMessages();
    }
  }, [isAuthenticated, domain]);

  // --- Pantalla de login ---
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center w-full max-w-sm">
          <h1 className="text-3xl font-bold text-white mb-6">Quarantine Dashboard</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            onClick={handleLogin}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  // --- Dashboard principal ---
  return (
    <div className="min-h-screen p-6 bg-gray-900">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
        <h1 className="text-3xl font-extrabold text-white">Quarantine Dashboard</h1>

        <FilterBar
          from={from} setFrom={setFrom}
          to={to}     setTo={setTo}
          type={type} setType={setType}
          onFilter={fetchMessages}
        />

        {error && <p className="text-red-500">{error}</p>}

        {loading ? (
          <p className="text-gray-300">Cargando…</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-300">No se encontraron mensajes.</p>
        ) : (
          <QuarantineTable messages={messages} />
        )}
      </div>
    </div>
  );
}
