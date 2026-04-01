import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Login from './pages/login';
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';

function App() {
  // Estado para saber si el usuario está logueado o no
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Al cargar la página, revisamos si el usuario ya tenía su "pulsera" guardada
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      const decoded = jwtDecode(token); // Decodificamos la "pulsera"
      setIsAdmin(decoded.is_staff);
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // SI NO ESTÁ LOGUEADO, SOLO LE MOSTRAMOS EL LOGIN
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // SI ESTÁ LOGUEADO, LE MOSTRAMOS EL SISTEMA COMPLETO
return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#f1f5f9' }}>
        
        {/* BARRA LATERAL (SIDEBAR) */}
        <nav style={{ 
          width: '260px', 
          backgroundColor: '#0f172a',
          color: 'white', 
          padding: '30px 20px', 
          display: 'flex', 
          flexDirection: 'column', 
          boxShadow: '4px 0 15px rgba(0,0,0,0.2)',
          zIndex: 10
        }}> 
          
          {/* Logo / Título del ERP */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: '800', 
              letterSpacing: '1px', 
              margin: 0,
              paddingBottom: '10px',
              borderBottom: '1px solid #334155'
            }}>
              NUBIS <span style={{ color: '#6366f1' }}>ERP</span>
            </h2>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', textTransform: 'uppercase' }}>
              Gestión Multiusuario
            </p>
          </div>

          {/* Menú de Navegación */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
            {[
              { to: "/", label: "Dashboard", icon: "📊" },
              { to: "/inventario", label: "Inventario", icon: "📦" },
              { to: "/compras", label: "Compras", icon: "🚚" },
              { to: "/ventas", label: "Ventas", icon: "🛒" },
              { to: "/clientes", label: "Clientes", icon: "👥" },
              { to: "/proveedores", label: "Proveedores", icon: "🏭" },
            ].map((item) => (
              <li key={item.to} style={{ marginBottom: '5px' }}>
                <Link 
                  to={item.to} 
                  style={{ 
                    color: '#cbd5e1', 
                    textDecoration: 'none', 
                    fontSize: '15px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#1e293b';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '20px';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                    e.currentTarget.style.paddingLeft = '15px';
                  }}
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              </li>
            ))}

            {/* --- SECCIÓN EXCLUSIVA PARA ADMINISTRADORES --- */}
            {isAdmin && (
              <>
                <li style={{ marginTop: '25px', marginBottom: '5px' }}>
                  <Link 
                    to="/usuarios" 
                    style={{ 
                      color: '#a5b4fc',
                      textDecoration: 'none', 
                      fontSize: '15px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 15px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'}
                  >
                    <span>⚙️</span> Usuarios
                  </Link>
                </li>
                <li style={{ 
                  padding: '10px 15px', 
                  color: '#818cf8', 
                  fontSize: '11px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}>
                  MODO ADMINISTRADOR
                </li>
              </>
            )}
          </ul>
          
          {/* BOTÓN CERRAR SESIÓN */}
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button 
              onClick={handleLogout} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: '#ef4444', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>

        {/* ÁREA CENTRAL DE CONTENIDO */}
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} /> 
              <Route path="/inventario" element={<Inventory />} />
              <Route path="/ventas" element={<Sales />} />
              <Route path="/compras" element={<Purchases />} />
              <Route path="/clientes" element={<Customers />} />
              <Route path="/proveedores" element={<Suppliers />} />
              <Route path="/usuarios" element={<Users />} />
            </Routes>
          </div>
        </main>

      </div>
    </Router>
  );
}

export default App;