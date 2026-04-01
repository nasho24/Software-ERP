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

  // Función para cargar los productos (la separamos para poder llamarla de nuevo al guardar)
  const fetchProducts = () => {
    axios.get('http://127.0.0.1:8000/api/inventory/products/')
      .then((response) => setProducts(response.data))
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
      price: price,
      stock: stock
    };

    // Hacemos el POST a la API
    axios.post('http://127.0.0.1:8000/api/inventory/products/', newProduct)
      .then((response) => {
        // Si sale bien, recargamos la tabla y limpiamos el formulario
        fetchProducts(); 
        setName('');
        setSku('');
        setPrice('');
        setStock('');
        alert("¡Producto creado con éxito!");
      })
      .catch((error) => {
        console.error("Error al guardar:", error);
        alert("Hubo un error al crear el producto. Revisa la consola.");
      });
  };

  return (
    <div>
      <h1 style={{ color: '#333' }}>Módulo de Inventario</h1>

      {/* --- FORMULARIO DE CREACIÓN --- */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>Agregar Nuevo Producto</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>SKU</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} required style={{ padding: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Precio</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ padding: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Stock Inicial</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required style={{ padding: '8px' }} />
          </div>

          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Guardar Producto
          </button>

        </form>
      </div>

      {/* --- TABLA DE PRODUCTOS --- */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <thead style={{ backgroundColor: '#2563eb', color: 'white' }}>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{product.sku}</td>
              <td>{product.name}</td>
              <td>${Number(product.price).toLocaleString('es-CL')}</td>
              <td>{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;