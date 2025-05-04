import React, { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from './authConfig';

export default function Dashboard() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [domain, setDomain] = useState('');       // arrancamos vacío
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    let account = accounts[0];
    let dom = domain;  // este será el dominio que usemos para el fetch

    // Si no está autenticado, saltar al popup y extraer el dominio automáticamente
    if (!isAuthenticated) {
      const loginResp = await instance.loginPopup(loginRequest);
      account = loginResp.account;
      // extraemos el UPN y obtenemos "colombiacloud" de "miguel@colombiacloud.online"
      const upn = account.username;
      dom = upn.split('@')[1].split('.')[0];
      setDomain(dom);  // actualizamos el input para que el usuario lo vea
    }

    try {
      const tokenResp = await instance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account
      });
      const token = tokenResp.accessToken;

      // ¡llamamos al endpoint con la variable local `dom`, no con state antiguo!
      const res = await fetch(
        `http://localhost:5148/api/quarantine?domain=${dom}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  // al montar el componente, ya intentamos fetch (y disparar login si hace falta)
  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <p><strong>Para:</strong> {(Array.isArray(msg.RecipientAddress) ? msg.RecipientAddress.join(', ') : msg.RecipientAddress)}</p>
            <p><strong>Asunto:</strong> {msg.Subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}