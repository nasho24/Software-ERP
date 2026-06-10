import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Estados para el carrito de compras
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  // Helper centralizado para empaquetar el Token JWT de seguridad
  const obtenerConfiguracion = () => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Cargar datos iniciales autorizados desde Django
  const fetchData = () => {
    const config = obtenerConfiguracion();

    axios.get('http://127.0.0.1:8000/api/sales/sales/', config)
      .then(res => setSales(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error al cargar ventas:", err));

    axios.get('http://127.0.0.1:8000/api/sales/customers/', config)
      .then(res => setCustomers(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error al cargar clientes:", err));

    axios.get('http://127.0.0.1:8000/api/inventory/products/', config)
      .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error al cargar productos:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para meter productos al carrito temporal con Toast Premium
  const addToCart = () => {
    if (!selectedProduct || quantity < 1) return;
    
    const productData = products.find(p => p.id === parseInt(selectedProduct));
    if (!productData) return;
    
    if (quantity > productData.stock) {
      window.showToast(`⚠️ Stock insuficiente. Solo quedan ${productData.stock} unidades de ${productData.name}.`, "error");
      return;
    }

    const newItem = {
      product_id: productData.id,
      name: productData.name,
      price: Number(productData.price),
      quantity: parseInt(quantity),
      subtotal: Number(productData.price) * parseInt(quantity)
    };

    setCart([...cart, newItem]);
    setSelectedProduct('');
    setQuantity(1);
    window.showToast("📦 Artículo añadido al carro local.", "success");
  };

  // Eliminar un producto del carro local
  const eliminarDelCarrito = (index) => {
    setCart(cart.filter((_, i) => i !== index));
    window.showToast("Carro actualizado.", "success");
  };

  // Función maestra: Enviar la venta a Django con Token incorporado
  const handleCheckout = async () => {
    if (!selectedCustomer) {
      window.showToast("⚠️ Por favor, selecciona un cliente corporativo.", "error");
      return;
    }
    if (cart.length === 0) {
      window.showToast("⚠️ El carrito de ventas se encuentra vacío.", "error");
      return;
    }

    const totalVenta = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const config = obtenerConfiguracion(); // <--- OBLIGATORIO para evitar errores 401

    try {
      // 1. Creamos la cabecera de la venta pasándole el token
      const saleResponse = await axios.post('http://127.0.0.1:8000/api/sales/sales/', {
        customer: parseInt(selectedCustomer),
        total: totalVenta
      }, config);
      
      const newSaleId = saleResponse.data.id;

      // 2. Insertamos cada producto del carro en tu endpoint de detalles (con token)
      for (const item of cart) {
        await axios.post('http://127.0.0.1:8000/api/sales/details/', {
          sale: newSaleId,
          product: item.product_id,
          quantity: item.quantity,
          price: item.price
        }, config);
      }

      window.showToast("🛒 ¡Venta registrada con éxito y stock rebajado!", "success");
      
      // Limpieza de estados y recarga de tablas
      setCart([]);
      setSelectedCustomer('');
      fetchData(); 

    } catch (error) {
      console.error("Error en el flujo de caja:", error);
      window.showToast("❌ Error de validación o privilegios al procesar venta.", "error");
    }
  };

  // Generar y descargar el PDF de la boleta de venta
  const handleView = (sale) => {
    const doc = new jsPDF();

    // Encabezado corporativo
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("NUBIS ERP - BALANCE DE CAJA", 20, 20);
    
    // Datos informativos del comprobante
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Comprobante de Venta Electrónico: #V-${sale.id}`, 20, 32);
    doc.text(`Fecha Emisión: ${new Date(sale.date).toLocaleDateString('es-CL')}`, 20, 40);
    doc.text(`Razón Social Cliente: ${sale.customer_name || 'Consumidor Final'}`, 20, 48);

    // Tabla de auditoría interna
    autoTable(doc, {
      startY: 56,
      head: [['Descripción del Movimiento de Caja', 'Monto Liquidado']],
      body: [
        ['Total recaudado por transacciones de productos', `$${Number(sale.total).toLocaleString('es-CL')} CLP`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6 }
    });

    const finalY = doc.lastAutoTable.finalY || 60;
    doc.setFontSize(9);
    doc.textColor = [148, 163, 184];
    doc.text("Documento electrónico de auditoría interna generado de forma automática por NUBIS Cloud Services.", 20, finalY + 15);

    doc.save(`Comprobante_Venta_Nubis_${sale.id}.pdf`);
    window.showToast("📄 Comprobante PDF descargado.", "success");
  };

  // Función de eliminación segura con Token JWT incorporado
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este comprobante de venta de los registros?")) {
      const config = obtenerConfiguracion(); // <--- OBLIGATORIO para evitar 401
      try {
        await axios.delete(`http://127.0.0.1:8000/api/sales/sales/${id}/`, config);
        window.showToast("🗑️ Registro de venta eliminado del sistema.", "success");
        fetchData();
      } catch (error) {
        console.error("Error al eliminar la venta:", error);
        window.showToast("❌ No tienes permisos para eliminar auditorías de caja.", "error");
      }
    }
  };

  const selectedProductData = products.find(p => p.id === parseInt(selectedProduct));
  const isStockInsufficient = selectedProductData && quantity > selectedProductData.stock;

  return (
    <div>
      <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '800', marginBottom: '25px' }}>Terminal de Punto de Venta (POS)</h1>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* PANEL IZQUIERDO: FORMULARIO Y CARRITO */}
        <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '18px', fontWeight: '700' }}>Registrar Nueva Venta</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Cliente Cuenta:</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
              <option value="">-- Buscar Razón Social o RUT --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.rut})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '2' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Producto Catálogo:</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                <option value="">-- Seleccionar SKU --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.name} - ${Number(p.price).toLocaleString('es-CL')} (Stock: {p.stock} un)
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: '80px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Cant:</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '9px', 
                  borderRadius: '6px',
                  border: isStockInsufficient ? '2px solid #ef4444' : '1px solid #cbd5e1',
                  backgroundColor: isStockInsufficient ? '#fef2f2' : 'white'
                }} 
              />
            </div>
            <button 
              onClick={addToCart} 
              disabled={isStockInsufficient || !selectedProduct}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: isStockInsufficient ? '#cbd5e1' : '#0f172a', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                fontWeight: 'bold',
                cursor: isStockInsufficient ? 'not-allowed' : 'pointer',
                height: '40px'
              }}
            >
              ＋ Añadir
            </button>
          </div>

          {isStockInsufficient && (
            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '-10px', marginBottom: '15px', fontWeight: 'bold' }}>
              ⚠️ Quiebre de Stock (Solo quedan {selectedProductData.stock} unidades).
            </p>
          )}

          {/* Estado del Carrito */}
          {cart.length > 0 && (
            <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '14px', fontWeight: '600' }}>Artículos en Cola de Transacción</h4>
              <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0', color: '#475569', fontSize: '13px' }}>
                {cart.map((item, index) => (
                  <li key={index} style={{ marginBottom: '6px' }}>
                    {item.quantity}x {item.name} - <span style={{ fontWeight: '600', color: '#0f172a' }}>${Number(item.subtotal).toLocaleString('es-CL')}</span>
                    <button type="button" onClick={() => eliminarDelCarrito(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '10px', fontWeight: 'bold' }}>✕</button>
                  </li>
                ))}
              </ul>
              <button onClick={handleCheckout} style={{ width: '100%', padding: '12px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)' }}>
                🚀 Confirmar Venta y Pagar
              </button>
            </div>
          )}
        </div>

        {/* PANEL DERECHO: HISTORIAL DE CAJA */}
        <div style={{ flex: '2 1 500px' }}>
          <div style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ backgroundColor: '#0f172a', color: 'white' }}>
                <tr>
                  <th style={{ padding: '14px' }}>ID Folio</th>
                  <th style={{ padding: '14px' }}>Razón Social Cliente</th>
                  <th style={{ padding: '14px' }}>Fecha Operación</th>
                  <th style={{ padding: '14px' }}>Monto Total</th>
                  <th style={{ padding: '14px', textAlign: 'center' }}>Acciones Ejecutivas</th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? sales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '14px', fontWeight: 'bold', color: '#6366f1' }}>#V-{sale.id}</td>
                    <td style={{ padding: '14px' }}>{sale.customer_name || 'Consumidor Final'}</td>
                    <td style={{ padding: '14px' }}>{new Date(sale.date).toLocaleDateString('es-CL')}</td>
                    <td style={{ padding: '14px', fontWeight: '700', color: '#16a34a' }}>${Number(sale.total).toLocaleString('es-CL')}</td>
                    <td style={{ padding: '14px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleView(sale)} 
                        style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
                        📄 Boleta PDF
                      </button>
                      <button 
                        onClick={() => handleDelete(sale.id)} 
                        style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No se registran transacciones emitidas en el libro de caja diario.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default Sales;