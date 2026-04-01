import { useState, useEffect } from 'react';
import axios from 'axios';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');

  const fetchCustomers = () => {
    axios.get('http://127.0.0.1:8000/api/sales/customers/')
      .then(res => setCustomers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/sales/customers/', { name, rut, email })
      .then(() => {
        fetchCustomers();
        setName(''); setRut(''); setEmail('');
        alert("Cliente registrado!");
      })
      .catch(err => alert("Error: El RUT ya existe o los datos son inválidos."));
  };

  return (
    <div>
      <h1>Gestión de Clientes</h1>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div><label>RUT</label><br/><input value={rut} onChange={e => setRut(e.target.value)} required style={{padding:'8px'}}/></div>
          <div><label>Nombre</label><br/><input value={name} onChange={e => setName(e.target.value)} required style={{padding:'8px'}}/></div>
          <div><label>Email</label><br/><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{padding:'8px'}}/></div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Registrar</button>
        </form>
      </div>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
        <thead style={{ backgroundColor: '#6366f1', color: 'white' }}>
          <tr><th>RUT</th><th>Nombre</th><th>Email</th></tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}><td>{c.rut}</td><td>{c.name}</td><td>{c.email}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Customers;