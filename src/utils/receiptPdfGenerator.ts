import { SaleDb } from '../services/salesService';

export const printReceiptPdf = (sale: SaleDb) => {
  const receipt = sale.electronic_receipts?.[0];
  const isFactura = receipt?.receipt_type === 'FACTURA';
  const docTitle = isFactura ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
  const receiptNumber = receipt?.full_number || `BOL-${sale.sale_number}`;
  const clientName = sale.clients?.full_name || 'CLIENTES VARIOS';
  const clientDocType = sale.clients?.doc_type || 'DNI';
  const clientDocNumber = sale.clients?.doc_number || '00000000';
  const formattedDate = new Date(sale.created_at || Date.now()).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHtml = (sale.sale_items || []).map(it => `
    <tr>
      <td style="padding: 6px 0; border-bottom: 1px dashed #e2e8f0;">
        <div style="font-weight: 600; color: #0f172a;">${it.products?.name || 'Artículo'}</div>
        <div style="font-size: 10px; color: #64748b;">SKU: ${it.products?.sku || 'N/A'}</div>
      </td>
      <td style="padding: 6px 4px; text-align: center; border-bottom: 1px dashed #e2e8f0;">${it.quantity}</td>
      <td style="padding: 6px 4px; text-align: right; border-bottom: 1px dashed #e2e8f0;">S/ ${Number(it.unit_price).toFixed(2)}</td>
      <td style="padding: 6px 0; text-align: right; font-weight: 600; border-bottom: 1px dashed #e2e8f0;">S/ ${Number(it.total).toFixed(2)}</td>
    </tr>
  `).join('');

  const printWindow = window.open('', '_blank', 'width=450,height=700');
  if (!printWindow) {
    alert('Por favor permite las ventanas emergentes (popups) para generar el comprobante.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Comprobante ${receiptNumber}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #0f172a;
          margin: 0;
          padding: 18px 14px;
          background: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 14px;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 10px;
        }
        .company-name {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin: 0;
          color: #1e3a8a;
        }
        .company-info {
          font-size: 10px;
          color: #475569;
          margin-top: 2px;
        }
        .doc-box {
          border: 1.5px solid #1e3a8a;
          border-radius: 8px;
          padding: 6px;
          margin: 10px 0;
          text-align: center;
          background-color: #f8fafc;
        }
        .doc-box h2 {
          margin: 0;
          font-size: 12px;
          font-weight: 800;
          color: #1e3a8a;
        }
        .doc-box p {
          margin: 2px 0 0 0;
          font-size: 13px;
          font-weight: 800;
          font-family: monospace;
          color: #0f172a;
        }
        .meta-table {
          width: 100%;
          font-size: 10px;
          margin-bottom: 10px;
        }
        .meta-table td {
          padding: 2px 0;
          vertical-align: top;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          margin-top: 8px;
        }
        .items-table th {
          border-bottom: 1.5px solid #0f172a;
          border-top: 1.5px solid #0f172a;
          padding: 4px 0;
          font-size: 9px;
          text-transform: uppercase;
          color: #334155;
        }
        .totals-table {
          width: 100%;
          margin-top: 10px;
          font-size: 11px;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
        }
        .totals-table td {
          padding: 2px 0;
        }
        .total-row {
          font-size: 14px;
          font-weight: 800;
          color: #1e3a8a;
          border-top: 1.5px solid #0f172a;
          border-bottom: 1.5px solid #0f172a;
        }
        .footer {
          margin-top: 18px;
          text-align: center;
          font-size: 9px;
          color: #64748b;
          border-top: 1px dashed #cbd5e1;
          padding-top: 10px;
        }
        .barcode {
          font-family: monospace;
          letter-spacing: 3px;
          font-size: 14px;
          font-weight: 700;
          margin-top: 6px;
        }
        .no-print-bar {
          background: #2563eb;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }
        .print-btn {
          background: #ffffff;
          color: #2563eb;
          border: none;
          padding: 6px 14px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
        }
        @media print {
          .no-print-bar { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <span>Comprobante listo para imprimir / PDF</span>
        <button class="print-btn" onclick="window.print()">Imprimir / Guardar PDF</button>
      </div>

      <div class="header">
        <h1 class="company-name">GESTIA RETAIL S.A.C.</h1>
        <div class="company-info">RUC: 20601928391</div>
        <div class="company-info">Av. Javier Prado Este 2450, San Borja, Lima</div>
        <div class="company-info">Tel: +51 984 123 456 | soporte@gestia.pe</div>
      </div>

      <div class="doc-box">
        <h2>${docTitle}</h2>
        <p>${receiptNumber}</p>
      </div>

      <table class="meta-table">
        <tr>
          <td style="color: #64748b; width: 35%;">Fecha Emisión:</td>
          <td style="font-weight: 600;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Cliente:</td>
          <td style="font-weight: 600;">${clientName}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">${clientDocType}:</td>
          <td style="font-mono; font-weight: 600;">${clientDocNumber}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Método de Pago:</td>
          <td style="font-weight: 600;">${sale.payment_method || 'Efectivo'}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">N° Pedido Ref:</td>
          <td style="font-mono;">${sale.sale_number}</td>
        </tr>
      </table>

      <table class="items-table">
        <thead>
          <tr>
            <th style="text-align: left;">Descripción</th>
            <th style="text-align: center;">Cant</th>
            <th style="text-align: right;">P.Unit</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || '<tr><td colspan="4" style="text-align:center; padding:10px;">Sin ítems registrados</td></tr>'}
        </tbody>
      </table>

      <table class="totals-table">
        <tr>
          <td style="color: #64748b;">Op. Gravada (Base):</td>
          <td style="text-align: right; font-weight: 600;">S/ ${Number(sale.subtotal || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">I.G.V. (18%):</td>
          <td style="text-align: right; font-weight: 600;">S/ ${Number(sale.tax || 0).toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td style="padding: 6px 0;">IMPORTE TOTAL:</td>
          <td style="padding: 6px 0; text-align: right;">S/ ${Number(sale.total || 0).toFixed(2)}</td>
        </tr>
      </table>

      <div class="footer">
        <div>Representación impresa de la ${docTitle}.</div>
        <div>Autorizado mediante Resolución de Intendencia SUNAT.</div>
        <div class="barcode">||| | ||||| || |||||| |||| | |||</div>
        <div style="margin-top: 4px; font-weight: 700;">¡Gracias por su compra!</div>
      </div>

      <script>
        // Disparar diálogo de impresión automáticamente tras renderizar
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
