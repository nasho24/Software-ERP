import { useState, useEffect } from 'react';
import axios from 'axios';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');

  // Configuración centralizada para empaquetar el Token JWT en las cabeceras
  const obtenerConfiguracion = () => {
    const token = localStorage.getItem('access_token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const fetchCustomers = () => {
    axios.get('http://127.0.0.1:8000/api/sales/customers/', obtenerConfiguracion())
      .then(res => setCustomers(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error al cargar clientes:", err));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    axios.post('http://127.0.0.1:8000/api/sales/customers/', { name, rut, email }, obtenerConfiguracion())
      .then(() => {
        fetchCustomers();
        setName(''); setRut(''); setEmail('');
        window.showToast("👥 Cliente registrado de forma exitosa.", "success");
      })
      .catch(err => {
        console.error("Error completo del backend:", err);
        const errorMensaje = err.response?.data 
          ? JSON.stringify(err.response.data) 
          : "Error de autorización o datos inválidos";
          
        window.showToast(`❌ Validación fallida: ${errorMensaje}`, "error");
      });
  };

  return (
    <div>
      <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '800', marginBottom: '25px' }}>Gestión de Clientes</h1>
      
      {/* --- FORMULARIO DE CREACIÓN CON ESTILO PREMIUM EN CHILE --- */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '16px', marginBottom: '15px' }}>Registrar Nuevo Cliente</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
            <label style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>RUT</label>
            <input value={rut} onChange={e => setRut(e.target.value)} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: '2' }}>
            <label style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Nombre / Razón Social</label>
            <input value={name} onChange={e => setName(e.target.value)} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: '2' }}>
            <label style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white' }} />
          </div>

          <button type="submit" style={{ padding: '11px 24px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '42px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#4f46e5'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#6366f1'}>
            Registrar
          </button>
        </form>
      </div>

      {/* --- TABLA DE CLIENTES CON ESTILO OSCURO UNIFICADO --- */}
      <div style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead style={{ backgroundColor: '#0f172a', color: 'white' }}>
            <tr>
              <th style={{ padding: '14px' }}>RUT</th>
              <th style={{ padding: '14px' }}>Nombre / Razón Social</th>
              <th style={{ padding: '14px' }}>Email de Contacto</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '14px', fontWeight: 'bold', color: '#6366f1' }}>{c.rut}</td>
                <td style={{ padding: '14px' }}>{c.name}</td>
                <td style={{ padding: '14px' }}>{c.email || 'No registrado'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No hay clientes registrados en la base de datos para esta empresa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;