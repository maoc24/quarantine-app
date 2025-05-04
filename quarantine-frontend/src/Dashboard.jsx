// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from './authConfig.mjs';

export default function Dashboard() {
  const { instance }      = useMsal();
  const isAuthenticated   = useIsAuthenticated();
  const [domain, setDomain]   = useState('colombiacloud');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      let account = instance.getActiveAccount();

      // 1) Si no hay usuario activo, abrimos popup y le decimos a MSAL que use esa cuenta
      if (!isAuthenticated || !account) {
        const loginResponse = await instance.loginPopup(loginRequest);
        account = loginResponse.account;
        instance.setActiveAccount(account);
      }

      // 2) Silent token using the active account
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account
      });
      const token = tokenResponse.accessToken;

      // 3) Llamada a tu API con Bearer token
      const res = await fetch(
        `http://localhost:5148/api/quarantine?domain=${domain}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessages(await res.json());
    } catch (e) {
      setError(e.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Quarantine Dashboard</h1>

      <div className="flex mb-6 space-x-2">
        <input
          type="text"
          className="border rounded p-2 flex-1"
          placeholder="dominio (p.ej. colombiacloud)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
          onClick={fetchMessages}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Fetch'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {!loading && messages.length === 0 && <p>No se encontraron mensajes.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <p><strong>Recibido:</strong> {new Date(msg.ReceivedTime).toLocaleString()}</p>
            <p><strong>De:</strong> {msg.SenderAddress}</p>
            <p><strong>Para:</strong> {msg.RecipientAddress.join(', ')}</p>
            <p><strong>Asunto:</strong> {msg.Subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}