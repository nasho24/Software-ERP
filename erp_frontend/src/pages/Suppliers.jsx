import { useState, useEffect } from 'react';
import axios from 'axios';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');

const fetchSuppliers = () => {
  const token = localStorage.getItem('access_token');
  
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  axios.get('http://127.0.0.1:8000/api/purchases/suppliers/', config)
    .then(res => setSuppliers(res.data))
    .catch(err => console.error(err));
};

  useEffect(() => { fetchSuppliers(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/purchases/suppliers/', { name, rut, email })
      .then(() => {
        fetchSuppliers();
        setName(''); setRut(''); setEmail('');
        alert("¡Proveedor registrado con éxito!");
      })
      .catch(err => alert("Error al registrar proveedor. Revisa el RUT."));
  };

  return (
    <div>
      <h1>Gestión de Proveedores</h1>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Registrar Nuevo Proveedor</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div><label>RUT</label><br/><input value={rut} onChange={e => setRut(e.target.value)} required style={{padding:'8px'}}/></div>
          <div><label>Nombre Empresa</label><br/><input value={name} onChange={e => setName(e.target.value)} required style={{padding:'8px'}}/></div>
          <div><label>Email Contacto</label><br/><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{padding:'8px'}}/></div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
        </form>
      </div>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
        <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
          <tr><th>RUT</th><th>Nombre</th><th>Email</th></tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <tr key={s.id}><td>{s.rut}</td><td>{s.name}</td><td>{s.email}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Suppliers;