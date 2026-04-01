import { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('http://127.0.0.1:8000/api/users/', config)
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>Control de Usuarios (Admin)</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
            <th style={{ padding: '15px' }}>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha Registro</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '15px', fontWeight: 'bold' }}>{u.username}</td>
              <td>{u.email}</td>
              <td>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '12px',
                  backgroundColor: u.is_staff ? '#e0e7ff' : '#f1f5f9',
                  color: u.is_staff ? '#4338ca' : '#64748b'
                }}>
                  {u.is_staff ? 'ADMIN' : 'CLIENTE'}
                </span>
              </td>
              <td>{new Date(u.date_joined).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;