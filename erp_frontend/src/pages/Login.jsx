import { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado para el feedback visual al hacer clic

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Tocamos la puerta de Django con nuestro usuario y clave
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: username,
        password: password
      });

      // 2. ¡Nos abrieron! Guardamos las credenciales de acceso en el LocalStorage
      localStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      
      window.showToast("🔓 Acceso autorizado. Iniciando sesión...", "success");

      // 3. Le avisamos a tu App.jsx que levante el menú lateral tras un leve retraso visual
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
      
    } catch (err) {
      console.error(err);
      setError('Usuario o contraseña incorrectos. Intenta de nuevo.');
      window.showToast("❌ Error al ingresar al ERP.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', // Gradiente oscuro corporativo
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* TARJETA CONTENEDORA DEL LOGIN */}
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.98)', 
        padding: '40px 35px', 
        borderRadius: '16px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 10px 20px -6px rgba(0, 0, 0, 0.4)', 
        width: '100%', 
        maxWidth: '420px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxSizing: 'border-box'
      }}>
        
        {/* ENCABEZADO DE NUBIS ERP */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
            NUBIS <span style={{ color: '#6366f1' }}>ERP</span>
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
            Gestión Multiusuario Centralizada
          </p>
        </div>

        {/* ALERTA DE ERROR ESTILIZADA */}
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fee2e2', 
            padding: '12px', 
            borderRadius: '8px', 
            color: '#dc2626', 
            fontSize: '13px', 
            fontWeight: '600', 
            textAlign: 'center', 
            marginBottom: '20px' 
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* FORMULARIO DE ACCESO */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* INPUT: USUARIO */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              Usuario:
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>👤</span>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="ej: PCFactory"
                style={{ 
                  width: '100%', 
                  padding: '12px 12px 12px 38px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '14px',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }} 
                onFocus={(e) => {
                  e.target.style.border = '1px solid #6366f1';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid #cbd5e1';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* INPUT: CONTRASEÑA */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              Contraseña:
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🔒</span>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••••••"
                style={{ 
                  width: '100%', 
                  padding: '12px 12px 12px 38px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '14px',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }} 
                onFocus={(e) => {
                  e.target.style.border = '1px solid #6366f1';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid #cbd5e1';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* BOTÓN DE ENVÍO */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: loading ? '#cbd5e1' : '#6366f1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '15px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              marginTop: '10px',
              boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { if(!loading) e.target.style.backgroundColor = '#4f46e5'; }}
            onMouseOut={(e) => { if(!loading) e.target.style.backgroundColor = '#6366f1'; }}
          >
            {loading ? 'Validando Credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* PIE DE PÁGINA */}
        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
          🛡️ Sistema de Auditoría Protegido | NUBIS Cloud Services
        </div>

      </div>
    </div>
  );
}

export default Login;