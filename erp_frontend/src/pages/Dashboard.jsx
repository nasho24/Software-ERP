import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    // 1. Recuperamos el token de la memoria
    const token = localStorage.getItem('access_token');
    
    // 2. Creamos la configuración para que Django nos deje pasar
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    // 3. Pasamos esa configuración (config) en cada petición
    axios.get('http://127.0.0.1:8000/api/inventory/products/', config)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error productos:", err));

    axios.get('http://127.0.0.1:8000/api/sales/sales/', config)
      .then(res => setSales(res.data))
      .catch(err => console.error("Error ventas:", err));

    axios.get('http://127.0.0.1:8000/api/purchases/purchases/', config)
      .then(res => setPurchases(res.data))
      .catch(err => console.error("Error compras:", err));
  }, []);

  // --- CÁLCULOS ---
  
  // Ingresos Totales (Ventas)
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  
  // Egresos Totales (Compras)
  const totalExpenses = purchases.reduce((sum, purchase) => sum + Number(purchase.total), 0);
  
  // Utilidad Neta (Ingresos - Egresos)
  const netProfit = totalRevenue - totalExpenses;

  // Productos con stock bajo
  const lowStockProducts = products.filter(product => product.stock < 10);

  const downloadMonthlyReport = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('es-CL');
    const monthName = new Date().toLocaleString('es-CL', { month: 'long' }).toUpperCase();

    // --- DISEÑO DEL ENCABEZADO ---
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("NUBIS ERP - INFORME DE GESTIÓN", 20, 25);
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text(`PERIODO: ${monthName} 2026 | GENERADO EL: ${dateStr}`, 20, 33);

    // --- SECCIÓN 1: RESUMEN FINANCIERO ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("1. Resumen de Desempeño Financiero", 20, 55);

    const margen = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    autoTable(doc, {
      startY: 60,
      head: [['Métrica de Negocio', 'Monto Actual']],
      body: [
        ['Ingresos Totales (Ventas)', `$${totalRevenue.toLocaleString('es-CL')}`],
        ['Costos Totales (Compras)', `$${totalExpenses.toLocaleString('es-CL')}`],
        ['Utilidad Neta', `$${netProfit.toLocaleString('es-CL')}`],
        ['Margen de Ganancia %', `${margen}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] }, // Indigo
      styles: { fontSize: 11 }
    });

    // --- SECCIÓN 2: ALERTAS DE INVENTARIO ---
    let finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text("2. Estado de Inventario Crítico", 20, finalY + 20);

    if (lowStockProducts.length > 0) {
      autoTable(doc, {
        startY: finalY + 25,
        head: [['Producto', 'SKU', 'Stock Actual']],
        body: lowStockProducts.map(p => [p.name, p.sku, p.stock]),
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] }, // Rojo Alerta
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text("No se detectan productos con stock crítico en este periodo.", 20, finalY + 30);
    }

    // --- PIE DE PÁGINA ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Este documento es un reporte interno generado por NUBIS ERP.", 105, pageHeight - 10, { align: 'center' });

    // Descarga
    doc.save(`Reporte_Gestion_${monthName}.pdf`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>Panel de Control Financiero</h1>
          <button 
            onClick={downloadMonthlyReport}
            style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px', 
            backgroundColor: '#6366f1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
      >
        Descargar Reporte Mensual
        </button>
      </div>
      {/* --- TARJETAS DE RESUMEN (KPIs) --- */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
        
        {/* Tarjeta 1: Ingresos (Ventas) */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #10b981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Ingresos Totales</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
            ${totalRevenue.toLocaleString('es-CL')}
          </p>
        </div>

        {/* Tarjeta 2: Egresos (Compras) */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #ef4444', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Gastos (Compras)</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            ${totalExpenses.toLocaleString('es-CL')}
          </p>
        </div>

        {/* Tarjeta 3: Utilidad Neta */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', borderLeft: `5px solid ${netProfit >= 0 ? '#3b82f6' : '#dc2626'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Utilidad Real</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: netProfit >= 0 ? '#2563eb' : '#dc2626' }}>
            ${netProfit.toLocaleString('es-CL')}
          </p>
        </div>

        {/* Tarjeta 4: Resumen Operativo */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #8b5cf6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Items en Catálogo</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
            {products.length} productos
          </p>
        </div>

      </div>

      {/* --- ALERTA DE STOCK CRÍTICO --- */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ Alertas de Stock Crítico (Menos de 10 unidades)
        </h3>
        
        {lowStockProducts.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Todo en orden. No hay productos con stock bajo.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
              <tr>
                <th style={{ padding: '10px', borderBottom: '1px solid #fee2e2' }}>SKU</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #fee2e2' }}>Producto</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #fee2e2' }}>Stock Restante</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map(product => (
                <tr key={product.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #f3f4f6' }}>{product.sku}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #f3f4f6' }}>{product.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #f3f4f6', fontWeight: 'bold', color: '#ef4444' }}>
                    {product.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default Dashboard;