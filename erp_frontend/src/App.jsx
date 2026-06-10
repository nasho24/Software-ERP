import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Login from './pages/Login'; // Asegúrate de que la L de Login coincida con tu archivo
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import SpotlightSearch from './components/SpotlightSearch';
import Reports from './pages/Reports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    window.showToast = (message, type = 'success') => {
      setToast({ show: true, message, type });
      // Se esconde automáticamente después de 4 segundos
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 4000);
    };
  }, []);

  // Función reutilizable para leer el token y setear los estados correspondientes
  const verificarAutenticacion = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAuthenticated(true);
        setIsAdmin(decoded.is_staff); // Captura si es superusuario o staff en tiempo real
      } catch (error) {
        console.error("Token inválido:", error);
        handleLogout();
      }
    }
  };

  // Al cargar la página por primera vez, verificamos si ya estaba logueado
  useEffect(() => {
    verificarAutenticacion();
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // SI NO ESTÁ LOGUEADO, LE MOSTRAMOS EL LOGIN Y LE PASAMOS LA FUNCIÓN ACTUALIZADA
  if (!isAuthenticated) {
    return <Login onLoginSuccess={verificarAutenticacion} />;
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
              { to: "/reportes", label: "Reportes Avanzados", icon: "📈" },
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
                <li key="/usuarios" style={{ marginTop: '25px', marginBottom: '5px' }}>
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
    
            {/* BARRA DE HERRAMIENTAS PREMIUM SUPERIOR */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '30px',
              paddingBottom: '15px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                Sistema Operativo Activo
              </div>
      
              {/* Botón indicador de búsqueda global */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  backgroundColor: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1',
                  color: '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'k', 'ctrlKey': true}))}
              >
                <span>🔍 Buscar módulo...</span>
                <kbd style={{ 
                  backgroundColor: '#f1f5f9', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '4px', 
                  padding: '2px 6px', 
                  fontSize: '11px', 
                  fontWeight: 'bold',
                  color: '#64748b' 
                }}>Ctrl + K</kbd>
              </div>
            </div>

            {/* COMPONENTE FLOTANTE DEL BUSCADOR */}
            <SpotlightSearch />

            {/* TUS RUTAS NORMALES */}
            <Routes>
              <Route path="/" element={<Dashboard />} /> 
              <Route path="/inventario" element={<Inventory />} />
              <Route path="/ventas" element={<Sales />} />
              <Route path="/compras" element={<Purchases />} />
              <Route path="/clientes" element={<Customers />} />
              <Route path="/proveedores" element={<Suppliers />} />
              <Route path="/usuarios" element={<Users />} />
              <Route path="/reportes" element={<Reports />} />
            </Routes>
          </div>
        </main>

        {/* --- INTERFAZ PREMIUM DE NOTIFICACIÓN TOAST FLOTANTE --- */}
        {toast.show && (
          <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: toast.type === 'success' ? '#065f46' : '#991b1b',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10000,
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: '600',
            borderLeft: `6px solid ${toast.type === 'success' ? '#34d399' : '#f87171'}`,
            transition: 'all 0.3s ease'
          }}>
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '16px', marginLeft: '10px', padding: 0 }}
            >
              ✕
            </button>
          </div>
        )}

      </div>
    </Router>
  );
}

export default App;