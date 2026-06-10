import { useState, useEffect } from 'react';
import axios from 'axios';

function Inventory() {
  // Estado para la lista de productos
  const [products, setProducts] = useState([]);

  // Estados para los campos del formulario nuevo
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  // Helper interno para capturar y empaquetar el Token JWT de seguridad
  const obtenerConfiguracion = () => {
    const token = localStorage.getItem('access_token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // Función para cargar los productos autorizados desde el Backend
  const fetchProducts = () => {
    // Inyectamos la configuración con el token para corregir el error 401
    axios.get('http://127.0.0.1:8000/api/inventory/products/', obtenerConfiguracion())
      .then((response) => {
        setProducts(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => console.error("Error al cargar:", error));
  };

  // Se ejecuta al cargar la página
  useEffect(() => {
    fetchProducts();
  }, []);

  // Función que se ejecuta al presionar "Guardar Producto"
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Armamos el "paquete" de datos que Django espera recibir
    const newProduct = {
      name: name,
      sku: sku,
      price: Number(price),
      stock: parseInt(stock)
    };

    // Hacemos el POST a la API pasando el Token JWT como tercer parámetro
    axios.post('http://127.0.0.1:8000/api/inventory/products/', newProduct, obtenerConfiguracion())
      .then((response) => {
        // Si sale bien, recargamos la tabla y limpiamos el formulario
        fetchProducts(); 
        setName('');
        setSku('');
        setPrice('');
        setStock('');
        
        // Reemplazamos el alert antiguo por tu Toast Premium verde de éxito
        window.showToast("📦 Producto registrado en el inventario con éxito.", "success");
      })
      .catch((error) => {
        console.error("Error al guardar:", error);
        
        // Extraemos el mensaje de validación real enviado por Django
        const errorMensaje = error.response?.data 
          ? JSON.stringify(error.response.data) 
          : "Error de autorización o datos inválidos";
          
        // Reemplazamos el alert de error por tu Toast flotante rojo
        window.showToast(`❌ No se pudo guardar: ${errorMensaje}`, "error");
      });
  };

  return (
    <div>
      <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '800', marginBottom: '25px' }}>Módulo de Inventario</h1>

      {/* --- FORMULARIO DE CREACIÓN --- */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '16px', marginBottom: '15px' }}>Agregar Nuevo Producto</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
            <label style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>SKU</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: '2' }}>
            <label style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
            <label style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Precio</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
            <label style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Stock Inicial</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>

          <button type="submit" style={{ padding: '11px 24px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '42px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#4f46e5'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#6366f1'}>
            Guardar Producto
          </button>

        </form>
      </div>

      {/* --- TABLA DE PRODUCTOS --- */}
      <div style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead style={{ backgroundColor: '#0f172a', color: 'white' }}>
            <tr>
              <th style={{ padding: '14px' }}>SKU</th>
              <th style={{ padding: '14px' }}>Producto</th>
              <th style={{ padding: '14px' }}>Precio</th>
              <th style={{ padding: '14px' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '14px', fontWeight: 'bold', color: '#6366f1' }}>{product.sku}</td>
                <td style={{ padding: '14px' }}>{product.name}</td>
                <td style={{ padding: '14px' }}>${Number(product.price).toLocaleString('es-CL')}</td>
                <td style={{ padding: '14px', fontWeight: 'bold', color: product.stock <= 5 ? '#ef4444' : '#334155' }}>
                  {product.stock} unidades {product.stock <= 5 && '⚠️'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No hay artículos registrados en el catálogo de inventario para esta empresa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;