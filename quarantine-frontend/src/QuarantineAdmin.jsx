import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig.mjs';
import PreviewModal from './components/PreviewModal.jsx';

export default function QuarantineAdmin() {
  const { instance, accounts } = useMsal();

  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewMsg, setPreviewMsg] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Acquire token
  useEffect(() => {
    async function acquireToken() {
      if (!accounts || !accounts.length) return;
      try {
        const resp = await instance.acquireTokenSilent({ scopes: loginRequest.scopes, account: accounts[0] });
        setToken(resp.accessToken);
      } catch {
        try {
          const resp = await instance.loginPopup(loginRequest);
          setToken(resp.accessToken);
        } catch (e) {
          setError(e.message);
        }
      }
    }
    acquireToken();
  }, [instance, accounts]);

  // Load messages when token available
  useEffect(() => {
    if (token) loadMessages();
  }, [token]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = accounts[0].username;
      const domain = email.split('@')[1].split('.')[0];
      const res = await fetch(`http://localhost:5148/api/quarantine?domain=${domain}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }
      const data = await res.json();
      setMessages(data);
      setSelectedIds([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Single row select handler
  const handleSelect = (id, checked) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(x => x !== id)
    );
  };

  // Header select-all handler
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(messages.map(m => m.Identity));
    else setSelectedIds([]);
  };

  // Generic action caller
  const callAction = async (action, ids) => {
    if (!token) { setError('Token no disponible'); return; }
    if (!ids.length) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5148/api/quarantine/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(ids)
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }
      const result = await res.json();
      alert(`Acción '${action}' completada:\n${JSON.stringify(result)}`);
      await loadMessages();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Preview a message
  const handlePreview = async (id) => {
    if (!token) { setError('Token no disponible'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5148/api/quarantine/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }
      const msg = await res.json();
      setPreviewMsg(msg);
      setShowPreview(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Administración de Cuarentena</h1>
      {error && <p className="text-red-500 mb-2">Error: {error}</p>}
      {!token ? (
        <p>Obteniendo token...</p>
      ) : loading ? (
        <p>Cargando mensajes...</p>
      ) : (
        <>
          <div className="mb-4 flex space-x-2">
            <button
              disabled={!selectedIds.length}
              onClick={() => callAction('release', selectedIds)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >Liberar seleccionados</button>
            <button
              disabled={!selectedIds.length}
              onClick={() => callAction('delete', selectedIds)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >Eliminar seleccionados</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-4 py-2 text-center">
                    <input
                      id="select-all"
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={messages.length > 0 && selectedIds.length === messages.length}
                    />
                  </th>
                  <th className="px-4 py-2 text-left">Recibido</th>
                  <th className="px-4 py-2 text-left">De</th>
                  <th className="px-4 py-2 text-left">Para</th>
                  <th className="px-4 py-2 text-left">Asunto</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, index) => {
                  const identity = msg.Identity || `msg-${index}`;
                  
                  const isSel = selectedIds.includes(identity);
                  return (
                    <tr key={identity} className={`${isSel ? 'bg-blue-50' : ''} border-t`}>
                      <td className="px-4 py-2 text-center">
                        <input
                          id={`select-${index}`}
                          type="checkbox"
                          checked={isSel}
                          onChange={e => handleSelect(identity, e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-2">{new Date(msg.ReceivedTime).toLocaleString()}</td>
                      <td className="px-4 py-2">{msg.SenderAddress}</td>
                      <td className="px-4 py-2">{Array.isArray(msg.RecipientAddress) ? msg.RecipientAddress.join(', ') : msg.RecipientAddress}</td>
                      <td className="px-4 py-2">{msg.Subject}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() => handlePreview(identity)}
                          disabled={!msg.PermissionToPreview}
                          className="text-blue-600 hover:underline disabled:opacity-50"
                        >Ver</button>
                        <button
                          onClick={() => callAction('release', [identity])}
                          disabled={!msg.PermissionToRelease}
                          className="text-green-600 hover:underline disabled:opacity-50"
                        >Liberar</button>
                        <button
                          onClick={() => callAction('delete', [identity])}
                          disabled={!msg.PermissionToDelete}
                          className="text-red-600 hover:underline disabled:opacity-50"
                        >Eliminar</button>
                        <button
                          onClick={() => callAction('download', [identity])}
                          disabled={!msg.PermissionToDownload}
                          className="text-gray-600 hover:underline disabled:opacity-50"
                        >Descargar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      {showPreview && <PreviewModal message={previewMsg} onClose={() => setShowPreview(false)} />}  
    </div>
  );
}
