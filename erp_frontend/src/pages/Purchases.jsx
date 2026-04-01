import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState(0);
  const [cart, setCart] = useState([]);

const fetchData = () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 1. Cargamos las compras para la tabla de la derecha
    axios.get('http://127.0.0.1:8000/api/purchases/purchases/', config)
      .then(res => setPurchases(res.data));

    // 2. Cargamos los proveedores para el SELECT de la izquierda (ESTO ES LO QUE FALTA)
    axios.get('http://127.0.0.1:8000/api/purchases/suppliers/', config)
      .then(res => {
        console.log("Proveedores cargados:", res.data); // Revisa la consola (F12) para ver si llegan
        setSuppliers(res.data);
      })
      .catch(err => console.error("Error cargando proveedores:", err));

    // 3. Cargamos los productos para el selector de abajo
    axios.get('http://127.0.0.1:8000/api/inventory/products/', config)
      .then(res => setProducts(res.data));
  };

  useEffect(() => { fetchData(); }, []);

  const addToCart = () => {
    if (!selectedProduct || quantity < 1) return;
    const productData = products.find(p => p.id === parseInt(selectedProduct));
    
    const newItem = {
      product_id: productData.id,
      name: productData.name,
      cost_price: parseFloat(costPrice),
      quantity: parseInt(quantity),
      subtotal: costPrice * quantity
    };
    setCart([...cart, newItem]);
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    if (!selectedSupplier || cart.length === 0) return alert("Datos incompletos");
    const totalPurchase = cart.reduce((sum, item) => sum + item.subtotal, 0);

    try {
        const res = await axios.post('http://127.0.0.1:8000/api/purchases/purchases/', {
        supplier: selectedSupplier,
        total: totalPurchase
      }, config);
      
      for (const item of cart) {
        await axios.post('http://127.0.0.1:8000/api/purchases/details/', {
          purchase: res.data.id,
          product: item.product_id,
          quantity: item.quantity,
          cost_price: item.cost_price
        });
      }

      alert("¡Compra registrada! El stock ha subido.");
      setCart([]); setSelectedSupplier(''); fetchData();
    } catch (error) {
      alert("Error al registrar la compra");
    }
  };

  return (
    <div>
      <h1 style={{ color: '#333' }}> Compras </h1>
      <div style={{ display: 'flex', gap: '30px' }}>
        
        {/* FORMULARIO DE COMPRA */}
        <div style={{ flex: '1', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3>Nueva Orden de Compra</h3>
          <label>Proveedor:</label>
          <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '15px' }}>
            <option value="">-- Seleccionar Proveedor --</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rut})</option>)}
          </select>

          <div style={{ display: 'grid', gap: '10px' }}>
            <label>Producto:</label>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{ padding: '8px' }}>
              <option value="">-- Seleccionar Producto --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock actual: {p.stock})</option>)}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
               <input type="number" placeholder="Cant" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ flex: 1, padding: '8px' }} />
               <input type="number" placeholder="Precio Costo" value={costPrice} onChange={e => setCostPrice(e.target.value)} style={{ flex: 2, padding: '8px' }} />
            </div>
            <button onClick={addToCart} style={{ padding: '10px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Añadir a la lista</button>
          </div>

          {cart.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4>Resumen de Compra</h4>
              <ul>{cart.map((item, i) => <li key={i}>{item.quantity}x {item.name} - ${item.subtotal.toLocaleString('es-CL')}</li>)}</ul>
              <button onClick={handleCheckout} style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Finalizar Compra</button>
            </div>
          )}
        </div>

        {/* HISTORIAL DE COMPRAS */}
        <div style={{ flex: '1.5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
            <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
              <tr><th>ID</th><th>Proveedor</th><th>Total</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>#{p.id}</td>
                  <td>{p.supplier_name}</td>
                  <td style={{ fontWeight: 'bold' }}>${Number(p.total).toLocaleString('es-CL')}</td>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Purchases;