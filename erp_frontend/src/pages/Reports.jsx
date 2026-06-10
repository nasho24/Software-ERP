import { useState, useEffect } from 'react';
import axios from 'axios';

function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Estados para almacenar la data de la API
  const [salesData, setSalesData] = useState([]);
  const [purchasesData, setPurchasesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);

  // Carga de datos segura con tus endpoints reales de Django
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 1. Endpoints corregidos según tu estructura real de Django
    axios.get('http://127.0.0.1:8000/api/sales/sales/', config)
      .then(res => setSalesData(res.data))
      .catch(err => console.error("Error cargando ventas en reportes:", err));

    axios.get('http://127.0.0.1:8000/api/purchases/purchases/', config)
      .then(res => setPurchasesData(res.data))
      .catch(err => console.error("Error cargando compras en reportes:", err));

    // Intentamos cargar productos. Si tu ruta es /api/inventory/products/ o /api/inventory/ la manejamos sin caer
    axios.get('http://127.0.0.1:8000/api/inventory/products/', config)
      .then(res => setInventoryData(res.data))
      .catch(() => {
        axios.get('http://127.0.0.1:8000/api/inventory/', config)
          .then(res => setInventoryData(res.data))
          .catch(err => console.error("Error cargando inventario en reportes:", err));
      });
  }, []);

  const handlePrint = (reportTitle) => {
    const printContent = document.getElementById('printable-report-area').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: 'Inter', sans-serif; color: #1e293b;">
        <h1 style="text-align: center; margin-bottom: 5px;">NUBIS ERP - REPORTE CORPORATIVO</h1>
        <p style="text-align: center; color: #64748b; margin-bottom: 30px;">Tipo: ${reportTitle} | Generado el: ${new Date().toLocaleDateString()}</p>
        ${printContent}
      </div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  // --- VALIDACIONES DE SEGURIDAD CONTRA CRASHES (Evitan la pantalla en blanco) ---
  const safeSales = Array.isArray(salesData) ? salesData : [];
  const safePurchases = Array.isArray(purchasesData) ? purchasesData : [];
  const safeInventory = Array.isArray(inventoryData) ? inventoryData : [];

  // Cálculos matemáticos seguros basados en las listas validadas
  const totalSales = safeSales.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const totalPurchases = safePurchases.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const totalInventoryValue = safeInventory.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.stock) || 0)), 0);
  const criticalStockItems = safeInventory.filter(item => (Number(item.stock) || 0) <= 5);

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>📊 Centro de Reportes y Auditoría</h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Analiza la rentabilidad, flujos de caja e inventario crítico de tu PYME.</p>
        </div>
        <button 
          onClick={() => handlePrint(activeTab.toUpperCase())}
          style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🖨️ Exportar PDF / Imprimir
        </button>
      </div>

      {/* FILTROS DE FECHAS */}
      <div style={{ display: 'flex', gap: '15px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '25px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Rango de Fechas:</span>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
        <span style={{ color: '#94a3b8' }}>hasta</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
      </div>

      {/* SELECTOR DE TABS */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '25px', gap: '10px' }}>
        {[
          { id: 'sales', label: '🛒 Reporte de Ventas', color: '#3b82f6' },
          { id: 'purchases', label: '🚚 Reporte de Compras', color: '#10b981' },
          { id: 'inventory', label: '📦 Estado de Inventario', color: '#6366f1' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px', border: 'none', background: 'none', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
              color: activeTab === tab.id ? tab.color : '#64748b',
              borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ÁREA IMPRIMIBLE */}
      <div id="printable-report-area">
        
        {/* --- REPORTE: VENTAS --- */}
        {activeTab === 'sales' && (
          <div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: '#eff6ff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase' }}>Ingresos Totales por Ventas</span>
                <h3 style={{ margin: '5px 0 0 0', fontSize: '24px', color: '#1e3a8a' }}>${totalSales.toLocaleString('es-CL')}</h3>
              </div>
              <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Transacciones Realizadas</span>
                <h3 style={{ margin: '5px 0 0 0', fontSize: '24px', color: '#334155' }}>{safeSales.length} ventas</h3>
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>ID Venta</th>
                  <th style={{ padding: '12px' }}>Fecha</th>
                  <th style={{ padding: '12px' }}>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {safeSales.length > 0 ? safeSales.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>#V-{item.id || idx + 1}</td>
                    <td style={{ padding: '12px' }}>{item.date ? new Date(item.date).toLocaleDateString() : 'Reciente'}</td>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#16a34a' }}>${(Number(item.total) || 0).toLocaleString('es-CL')}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No se registran transacciones de venta en este período.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- REPORTE: COMPRAS --- */}
        {activeTab === 'purchases' && (
          <div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 'bold', textTransform: 'uppercase' }}>Inversión en Abastecimiento</span>
                <h3 style={{ margin: '5px 0 0 0', fontSize: '24px', color: '#064e3b' }}>${totalPurchases.toLocaleString('es-CL')}</h3>
              </div>
              <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Órdenes de Compra</span>
                <h3 style={{ margin: '5px 0 0 0', fontSize: '24px', color: '#334155' }}>{safePurchases.length} órdenes</h3>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>Cód. Compra</th>
                  <th style={{ padding: '12px' }}>Fecha Solicitud</th>
                  <th style={{ padding: '12px' }}>Costo Total</th>
                </tr>
              </thead>
              <tbody>
                {safePurchases.length > 0 ? safePurchases.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>#C-{item.id || idx + 1}</td>
                    <td style={{ padding: '12px' }}>{item.date ? new Date(item.date).toLocaleDateString() : 'Reciente'}</td>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#dc2626' }}>${(Number(item.total) || 0).toLocaleString('es-CL')}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No se registran órdenes de compra en el historial.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- REPORTE: INVENTARIO --- */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: '#f5f3ff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                <span style={{ fontSize: '12px', color: '#3730a3', fontWeight: 'bold', textTransform: 'uppercase' }}>Capital en Almacén (Valor de Stock)</span>
                <h3 style={{ margin: '5px 0 0 0', fontSize: '24px', color: '#312e81' }}>${totalInventoryValue.toLocaleString('es-CL')}</h3>
              </div>
              <div style={{ flex: 1, backgroundColor: criticalStockItems.length > 0 ? '#fff5f5' : '#f8fafc', padding: '20px', borderRadius: '8px', borderLeft: criticalStockItems.length > 0 ? '4px solid #ef4444' : 'none' }}>
                <span style={{ fontSize: '12px', color: criticalStockItems.length > 0 ? '#991b1b' : '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Productos con Quiebre / Stock Crítico</span>
                <h3 style={{ margin: '5px 0 0 0', fontSize: '24px', color: criticalStockItems.length > 0 ? '#7f1d1d' : '#334155' }}>
                  {criticalStockItems.length} alertas
                </h3>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>Producto</th>
                  <th style={{ padding: '12px' }}>Precio Unitario</th>
                  <th style={{ padding: '12px' }}>Stock Disponible</th>
                  <th style={{ padding: '12px' }}>Estado Almacén</th>
                </tr>
              </thead>
              <tbody>
                {safeInventory.length > 0 ? safeInventory.map((item, idx) => {
                  const isCritical = (Number(item.stock) || 0) <= 5;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{item.name}</td>
                      <td style={{ padding: '12px' }}>${(Number(item.price) || 0).toLocaleString('es-CL')}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: isCritical ? '#ef4444' : '#334155' }}>{item.stock} unidades</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: isCritical ? '#fee2e2' : '#dcfce7',
                          color: isCritical ? '#991b1b' : '#15803d',
                          padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                        }}>
                          {isCritical ? '⚠️ Reabastecer Urgente' : '✓ Stock Óptimo'}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No hay artículos registrados en el catálogo de inventario.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;