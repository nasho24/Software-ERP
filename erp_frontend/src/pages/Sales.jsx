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

  // Cargar datos iniciales
  const fetchData = () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios.get('http://127.0.0.1:8000/api/sales/sales/', config).then(res => setSales(res.data));
    axios.get('http://127.0.0.1:8000/api/sales/customers/', config).then(res => setCustomers(res.data));
    axios.get('http://127.0.0.1:8000/api/inventory/products/', config).then(res => setProducts(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para meter productos al carrito temporal
  const addToCart = () => {
    if (!selectedProduct || quantity < 1) return;
    
    // Buscamos los datos completos del producto seleccionado
    const productData = products.find(p => p.id === parseInt(selectedProduct));
    
    if (quantity > productData.stock) {
        alert(`¡No hay stock suficiente! Solo quedan ${productData.stock} unidades de ${productData.name}.`);
        return;
    }

    const newItem = {
      product_id: productData.id,
      name: productData.name,
      price: productData.price,
      quantity: parseInt(quantity),
      subtotal: productData.price * quantity
    };

    setCart([...cart, newItem]);
  };

// Función maestra: Enviar la venta a Django
  const handleCheckout = async () => {
    if (!selectedCustomer) return alert("Selecciona un cliente");
    if (cart.length === 0) return alert("El carrito está vacío");

    // NUEVO: Calculamos el total de todo el carrito antes de enviar
    const totalVenta = cart.reduce((sum, item) => sum + item.subtotal, 0);

    try {
      // 1. Creamos el "Ticket" y AHORA SÍ le enviamos el total calculado
      const saleResponse = await axios.post('http://127.0.0.1:8000/api/sales/sales/', {
        customer: selectedCustomer,
        total: totalVenta // <-- El total entra aquí
      });
      
      const newSaleId = saleResponse.data.id;

      // 2. Metemos cada producto del carrito en ese ticket
      for (const item of cart) {
        await axios.post('http://127.0.0.1:8000/api/sales/details/', {
          sale: newSaleId,
          product: item.product_id,
          quantity: item.quantity,
          price: item.price
        });
      }

      alert("¡Venta registrada con éxito!");
      
      // Limpiamos todo y recargamos las tablas
      setCart([]);
      setSelectedCustomer('');
      fetchData(); 

    } catch (error) {
      console.error("Error en la venta:", error);
      alert("Hubo un error al procesar la venta.");
    }
  };

// Función para generar y descargar el PDF de la venta
  const handleView = (sale) => {
    // 1. Documento PDF
    const doc = new jsPDF();

    // 2. SOFTWARE ERP
    doc.setFontSize(22);
    doc.text("MI ERP - SOFTWARE CONTABLE", 20, 20);
    
    // 3. Datos del comprobante
    doc.setFontSize(12);
    doc.text(`Comprobante de Venta #${sale.id}`, 20, 30);
    doc.text(`Fecha: ${new Date(sale.date).toLocaleDateString('es-CL')}`, 20, 40);
    doc.text(`Cliente: ${sale.customer_name}`, 20, 50);

    // 4. Tabla con el total de la venta
    autoTable(doc, {
      startY: 60,
      head: [['Descripción', 'Monto']],
      body: [
        ['Total de la compra', `$${Number(sale.total).toLocaleString('es-CL')}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // 5. Mensaje de despedida abajo de la tabla
    const finalY = doc.lastAutoTable.finalY || 60;
    doc.setFontSize(10);
    doc.text("Gracias por su preferencia. Documento generado automáticamente.", 20, finalY + 20);

    // 6. Descarga del PDF
    doc.save(`Boleta_Venta_${sale.id}.pdf`);
  };

  // La función de eliminar se mantiene igual
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta venta?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/sales/sales/${id}/`);
        alert("Venta eliminada correctamente.");
        fetchData();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al intentar eliminar la venta.");
      }
    }
  };

  // Buscamos el objeto completo del producto que el usuario seleccionó en el <select>
  const selectedProductData = products.find(p => p.id === parseInt(selectedProduct));

  // Verificamos si la cantidad ingresada es mayor al stock disponible
  const isStockInsufficient = selectedProductData && quantity > selectedProductData.stock;


  return (
    <div>
      <h1 style={{ color: '#333' }}>Punto de Venta</h1>

      <div style={{ display: 'flex', gap: '30px' }}>
        
        {/* PANEL IZQUIERDO: NUEVA VENTA */}
        <div style={{ flex: '1', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>Registrar Nueva Venta</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Cliente:</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="">-- Seleccionar Cliente --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.rut})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: '2' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Producto:</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="">-- Seleccionar Producto --</option>
                  {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${Number(p.price).toLocaleString('es-CL')} (Stock: {p.stock})
                </option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Cant:</label>
                    <input 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        style={{ 
                        width: '100%', 
                        padding: '8px', 
                        border: isStockInsufficient ? '2px solid #ef4444' : '1px solid #ccc' // Borde rojo si falla
                        }} 
                    />
            </div>
                <button 
                    onClick={addToCart} 
                    disabled={isStockInsufficient || !selectedProduct} // BLOQUEA EL BOTÓN si no hay stock
                    style={{ 
                        padding: '9px 15px', 
                        backgroundColor: isStockInsufficient ? '#94a3b8' : '#eab308', // Gris si está bloqueado
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: isStockInsufficient ? 'not-allowed' : 'pointer' 
                        }}
                    >
                    Añadir
                </button>

        {/* --- TEXTO DE ADVERTENCIA  --- */}
            {isStockInsufficient && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>
                ¡Stock Insuficiente! (Disponible: {selectedProductData.stock})
                </p>
            )}
          </div>

          {/* Carrito de Compras */}
          {cart.length > 0 && (
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Carrito</h4>
              <ul style={{ paddingLeft: '20px', margin: '0 0 15px 0' }}>
                {cart.map((item, index) => (
                  <li key={index}>
                    {item.quantity}x {item.name} - ${Number(item.subtotal).toLocaleString('es-CL')}
                  </li>
                ))}
              </ul>
              <button onClick={handleCheckout} style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                Confirmar Venta y Pagar
              </button>
            </div>
          )}
        </div>

{/* PANEL DERECHO: HISTORIAL */}
        <div style={{ flex: '2' }}>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <thead style={{ backgroundColor: '#10b981', color: 'white' }}>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
                {sales.map((sale) => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td>#{sale.id}</td>
                        <td>{sale.customer_name}</td>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 'bold' }}> ${Number(sale.total).toLocaleString('es-CL')}</td>
                        <td>
            {/* BOTÓN VER (PASO 2) */}
                <button 
                    onClick={() => handleView(sale)} 
                    style={{ 
                    padding: '5px 10px', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontSize: '12px',
                    marginRight: '5px' // Espacio entre botones
                    }}
                    >
                    Ver
                </button>

        {/* BOTÓN ELIMINAR */}
        <button 
          onClick={() => handleDelete(sale.id)} 
          style={{ 
            padding: '5px 10px', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontSize: '12px' 
          }}
        >
          Eliminar
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      
      </div>
    </div>
  );
};

export default Sales;