import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Lista de acciones y rutas rápidas del ERP
  const actions = [
    { id: 'dash', label: 'Ir al Dashboard Principal', icon: '📊', category: 'Navegación', action: () => navigate('/') },
    { id: 'inv', label: 'Ver Inventario de Productos', icon: '📦', category: 'Navegación', action: () => navigate('/inventario') },
    { id: 'com', label: 'Ver Historial de Compras', icon: '🚚', category: 'Navegación', action: () => navigate('/compras') },
    { id: 'ven', label: 'Ver Panel de Ventas', icon: '🛒', category: 'Navegación', action: () => navigate('/ventas') },
    { id: 'cli', label: 'Ver Listado de Clientes', icon: '👥', category: 'Navegación', action: () => navigate('/clientes') },
    { id: 'pro', label: 'Ver Registro de Proveedores', icon: '🏭', category: 'Navegación', action: () => navigate('/proveedores') },
    { id: 'rep', label: 'Abrir Centro de Reportes y Auditoría', icon: '📈', category: 'Auditoría', action: () => navigate('/reportes') },
  ];

  // Escuchar el atajo de teclado Ctrl + K o Cmd + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-foco en el input al abrir el buscador
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrar las acciones según lo que escriba el usuario
  const filteredActions = actions.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      onClick={() => setIsOpen(false)} 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', paddingTop: '15vh', zIndex: 9999
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          backgroundColor: 'white', width: '100%', maxWidth: '550px', height: 'fit-content',
          borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
          overflow: 'hidden', border: '1px solid #e2e8f0'
        }}
      >
        {/* Input del Buscador */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '18px', marginRight: '12px', color: '#94a3b8' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Escribe para buscar un módulo o comando rápido..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', border: 'none', outline: 'none', fontSize: '16px',
              color: '#1e293b', fontFamily: 'inherit'
            }}
          />
          <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
            ESC
          </span>
        </div>

        {/* Lista de Resultados */}
        <div style={{ padding: '10px 0', maxInventoryHeight: '300px', overflowY: 'auto' }}>
          {filteredActions.length > 0 ? (
            filteredActions.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                  setQuery('');
                }}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 20px', cursor: 'pointer',
                  transition: 'background 0.2s', justifyContent: 'space-between'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#334155' }}>{item.label}</p>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.category}</span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>Ir ➔</span>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', margin: '20px 0' }}>
              ❌ No se encontraron comandos o módulos para tu búsqueda.
            </p>
          )}
        </div>
        
        {/* Footer Informativo */}
        <div style={{ backgroundColor: '#f8fafc', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf2f7' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Usa <span style={{ fontWeight: 'bold' }}>↑↓</span> para navegar e <span style={{ fontWeight: 'bold' }}>Enter</span> para seleccionar
          </span>
          <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 'bold' }}>NUBIS Global Search</span>
        </div>
      </div>
    </div>
  );
}

export default SpotlightSearch;