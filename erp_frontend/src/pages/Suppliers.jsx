import { useState, useEffect } from 'react';
import axios from 'axios';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
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

  const fetchSuppliers = () => {
    axios.get('http://127.0.0.1:8000/api/purchases/suppliers/', obtenerConfiguracion())
      .then(res => setSuppliers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    axios.post('http://127.0.0.1:8000/api/purchases/suppliers/', { name, rut, email }, obtenerConfiguracion())
      .then(() => {
        fetchSuppliers();
        setName(''); setRut(''); setEmail('');
        window.showToast("🏭 Proveedor registrado con éxito en el sistema.", "success");
      })
      .catch(err => {
        console.error("Error completo del backend:", err);
        
        // Extraemos la validación exacta enviada por Django Rest Framework
        const errorMensaje = err.response?.data 
          ? JSON.stringify(err.response.data) 
          : "Error de conexión con el servidor";
          
        window.showToast(`❌ Validación fallida: ${errorMensaje}`, "error");
      });
  };

  return (
    <div>
      <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '800', marginBottom: '20px' }}>Gestión de Proveedores</h1>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '16px' }}>Registrar Nuevo Proveedor</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div><label style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>RUT</label><br/><input value={rut} onChange={e => setRut(e.target.value)} required style={{padding:'8px', border: '1px solid #cbd5e1', borderRadius: '4px'}}/></div>
          <div><label style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>Nombre Empresa</label><br/><input value={name} onChange={e => setName(e.target.value)} required style={{padding:'8px', border: '1px solid #cbd5e1', borderRadius: '4px'}}/></div>
          <div><label style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>Email Contacto</label><br/><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{padding:'8px', border: '1px solid #cbd5e1', borderRadius: '4px'}}/></div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
        </form>
      </div>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
        <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
          <tr><th style={{ textAlign: 'left', padding: '12px' }}>RUT</th><th style={{ textAlign: 'left', padding: '12px' }}>Nombre</th><th style={{ textAlign: 'left', padding: '12px' }}>Email</th></tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>{s.rut}</td>
              <td style={{ padding: '12px' }}>{s.name}</td>
              <td style={{ padding: '12px' }}>{s.email || 'No registrado'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Suppliers;