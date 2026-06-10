import { useState, useEffect } from 'react';
import axiosDefault from 'axios';

function Purchases() {
  // Estados para datos del backend
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Estados para el formulario de la nueva compra
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState(0);
  const [cart, setCart] = useState([]);

  // Helper centralizado para empaquetar el Token JWT de seguridad
  const obtenerConfiguracion = () => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = () => {
    const config = obtenerConfiguracion();

    // 1. Cargamos las compras para la tabla de la derecha
    axiosDefault.get('http://127.0.0.1:8000/api/purchases/purchases/', config)
      .then(res => setPurchases(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error cargando compras:", err));

    // 2. Cargamos los proveedores para el SELECT de la izquierda
    axiosDefault.get('http://127.0.0.1:8000/api/purchases/suppliers/', config)
      .then(res => setSuppliers(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error cargando proveedores:", err));

    // 3. Cargamos los productos para el selector de abajo
    axiosDefault.get('http://127.0.0.1:8000/api/inventory/products/', config)
      .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error cargando productos:", err));
  };

  useEffect(() => { fetchData(); }, []);

  // Función para meter productos al carrito temporal
  const addToCart = () => {
    if (!selectedProduct || quantity < 1) return;
    const productData = products.find(p => p.id === parseInt(selectedProduct));
    if (!productData) return;
    
    const newItem = {
      product_id: productData.id,
      name: productData.name,
      cost_price: parseFloat(costPrice),
      quantity: parseInt(quantity),
      subtotal: parseFloat(costPrice) * parseInt(quantity)
    };
    
    setCart([...cart, newItem]);
    setSelectedProduct('');
    setCostPrice(0);
    setQuantity(1);
    window.showToast("➕ Artículo añadido al resumen de orden.", "success");
  };

  // Función maestra: Enviar la venta a Django con Token incorporado
  const handleCheckout = async () => {
    if (!selectedSupplier) {
      window.showToast("⚠️ Por favor, selecciona un proveedor para la orden.", "error");
      return;
    }
    if (cart.length === 0) {
      window.showToast("⚠️ El resumen de la orden de compra está vacío.", "error");
      return;
    }

    const config = obtenerConfiguracion();
    const totalPurchase = cart.reduce((sum, item) => sum + item.subtotal, 0);

    try {
      // 1. Creamos la cabecera de la compra pasándole el token
      const res = await axiosDefault.post('http://127.0.0.1:8000/api/purchases/purchases/', {
        supplier: parseInt(selectedSupplier),
        total: totalPurchase
      }, config);
      
      // 2. Metemos cada producto del carrito inyectando el token
      for (const item of cart) {
        await axiosDefault.post('http://127.0.0.1:8000/api/purchases/details/', {
          purchase: res.data.id,
          product: item.product_id,
          quantity: item.quantity,
          cost_price: item.cost_price
        }, config);
      }

      window.showToast("🚚 ¡Compra registrada con éxito! El stock ha sido reabastecido.", "success");
      setCart([]); 
      setSelectedSupplier(''); 
      fetchData();
    } catch (error) {
      console.error("Error al procesar compra:", error);
      window.showToast("❌ Hubo un error crítico al intentar registrar la orden de compra.", "error");
    }
  };

  // --- NUEVA FUNCIÓN DE ELIMINACIÓN ASÍNCRONA PROTEGIDA ---
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro de compra de las cartolas fiscales?")) {
      const config = obtenerConfiguracion();
      try {
        await axiosDefault.delete(`http://127.0.0.1:8000/api/purchases/purchases/${id}/`, config);
        window.showToast("🗑️ Registro de compra eliminado correctamente.", "success");
        fetchData(); // Recargamos la tabla al instante
      } catch (error) {
        console.error("Error al borrar compra:", error);
        window.showToast("❌ No se pudo eliminar el registro de la base de datos.", "error");
      }
    }
  };

  return (
    <div>
      <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '800', marginBottom: '25px' }}>Módulo de Compras</h1>
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* PANEL IZQUIERDO: FORMULARIO DE COMPRA */}
        <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Nueva Orden de Compra</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Proveedor:</label>
            <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
              <option value="">-- Seleccionar Proveedor --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rut})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Producto:</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                <option value="">-- Seleccionar Producto --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock actual: {p.stock})</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Cant:</label>
                <input type="number" min="1" placeholder="Cant" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Precio Costo:</label>
                <input type="number" placeholder="Precio Costo" value={costPrice} onChange={e => setCostPrice(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
            
            <button onClick={addToCart} style={{ width: '100%', padding: '11px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
              Añadir a la lista
            </button>
          </div>

          {/* RESUMEN DE LA ORDEN DE COMPRA */}
          {cart.length > 0 && (
            <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '14px', fontWeight: '600' }}>Resumen de Compra</h4>
              <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0', color: '#475569', fontSize: '13px' }}>
                {cart.map((item, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold' }}>{item.quantity}x</span> {item.name} - <span style={{ fontWeight: '600', color: '#10b981' }}>${item.subtotal.toLocaleString('es-CL')}</span>
                  </li>
                ))}
              </ul>
              <button onClick={handleCheckout} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
                Finalizar Compra
              </button>
            </div>
          )}
        </div>

        {/* PANEL DERECHO: HISTORIAL DE COMPRAS CON BOTÓN ELIMINAR */}
        <div style={{ flex: '1.5 1 500px' }}>
          <div style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <tr>
                  <th style={{ padding: '14px' }}>ID Folio</th>
                  <th style={{ padding: '14px' }}>Proveedor</th>
                  <th style={{ padding: '14px' }}>Total Invertido</th>
                  <th style={{ padding: '14px' }}>Fecha Operación</th>
                  <th style={{ padding: '14px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length > 0 ? purchases.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '14px', fontWeight: 'bold', color: '#3b82f6' }}>#C-{p.id}</td>
                    <td style={{ padding: '14px' }}>{p.supplier_name || 'Proveedor General'}</td>
                    <td style={{ padding: '14px', fontWeight: '700' }}>${Number(p.total).toLocaleString('es-CL')}</td>
                    <td style={{ padding: '14px', color: '#64748b' }}>{new Date(p.date).toLocaleDateString('es-CL')}</td>
                    <td style={{ padding: '14px', display: 'flex', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No se registran órdenes de abastecimiento en las cartolas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Purchases;