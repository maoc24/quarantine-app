// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import QuarantineAdmin from './QuarantineAdmin.jsx';
import Dashboard from './Dashboard.jsx';

//export default function App() {
//  return <Dashboard />;
//}
 export default function App() {
   return (
     <BrowserRouter>
       <nav className="p-4 bg-gray-200 space-x-4">
         <Link to="/" className="text-blue-600">Dashboard</Link>
         <Link to="/admin" className="text-blue-600">Admin Cuarentena</Link>
       </nav>
       <Routes>
         <Route path="/" element={<Dashboard />} />
         <Route path="/admin" element={<QuarantineAdmin />} />
       </Routes>
     </BrowserRouter>
   );
 }

