export const documentStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Sarabun', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #2f2f2f;
  }
  .document {
    padding: 0;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    border-bottom: 2px solid #2f2f2f;
    padding-bottom: 16px;
  }
  .header-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .company-logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
  .company-info h1 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .company-info p {
    font-size: 12px;
    color: #64748B;
    margin: 0;
    line-height: 1.4;
  }
  .document-title {
    text-align: right;
  }
  .document-title h2 {
    font-size: 22px;
    font-weight: 700;
    color: #2f2f2f;
  }
  .document-title .doc-number {
    font-size: 13px;
    color: #64748B;
    margin-top: 2px;
  }
  .document-title .doc-date {
    font-size: 13px;
    color: #64748B;
  }
  .section {
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 4px;
  }
  .customer-info {
    background: #F8F9FA;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 12px 16px;
  }
  .customer-info p {
    margin: 2px 0;
    font-size: 13px;
  }
  .customer-info .name {
    font-weight: 700;
    font-size: 15px;
  }
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }
  .items-table th {
    background: #2f2f2f;
    color: #FFFFFF;
    padding: 8px 12px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
  }
  .items-table th:last-child,
  .items-table td:last-child {
    text-align: right;
  }
  .items-table th:nth-child(2),
  .items-table td:nth-child(2),
  .items-table th:nth-child(3),
  .items-table td:nth-child(3),
  .items-table th:nth-child(4),
  .items-table td:nth-child(4) {
    text-align: center;
  }
  .items-table td {
    padding: 8px 12px;
    border-bottom: 1px solid #E2E8F0;
    font-size: 13px;
  }
  .items-table tr:nth-child(even) td {
    background: #F8F9FA;
  }
  .totals {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  .totals-box {
    width: 280px;
  }
  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 14px;
  }
  .totals-row.grand-total {
    border-top: 2px solid #2f2f2f;
    font-weight: 700;
    font-size: 16px;
    padding-top: 8px;
    margin-top: 4px;
  }
  .note-section {
    background: #F8F9FA;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 20px;
  }
  .note-section p {
    font-size: 13px;
    color: #64748B;
  }
  .footer {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
  }
  .signature-block {
    text-align: center;
    width: 200px;
  }
  .signature-line {
    border-top: 1px solid #2f2f2f;
    margin-top: 50px;
    padding-top: 8px;
    font-size: 13px;
    color: #64748B;
  }
  .meta-row {
    display: flex;
    gap: 24px;
    margin-bottom: 4px;
  }
  .meta-label {
    font-size: 13px;
    color: #64748B;
    min-width: 80px;
  }
  .meta-value {
    font-size: 13px;
    font-weight: 600;
  }

  /* NEW INVOICE STYLES */
  @page {
    margin: 0;
  }
  .new-invoice-container {
    width: 100%;
    background: #fff;
    color: #555;
    font-size: 11px;
    padding-bottom: 40px;
    position: relative;
    min-height: 100vh;
  }
  .new-header-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
    position: relative;
  }
  .new-header-left {
    background-color: #00b4a4;
    color: #fff;
    padding: 30px 40px 30px 50px;
    width: 55%;
    min-height: 100px;
    border-bottom-right-radius: 40px;
  }
  .new-header-left h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  .new-header-left p {
    font-size: 11px;
    margin-bottom: 2px;
    color: #fff;
  }
  .new-header-right {
    width: 45%;
    padding: 30px 100px 0 20px;
    text-align: right;
  }
  .new-logo {
    max-height: 100px;
    max-width: 250px;
    object-fit: contain;
  }
  .new-company-name {
    font-size: 18px;
    color: #00b4a4;
    font-weight: 700;
  }
  .new-tagline {
    font-size: 10px;
    color: #777;
    margin-top: 4px;
  }
  
  .new-info-section {
    display: flex;
    justify-content: space-between;
    padding: 0 50px;
    margin-bottom: 30px;
  }
  .new-info-section h3 {
    font-size: 13px;
    color: #00b4a4;
    margin-bottom: 12px;
    font-weight: 700;
  }
  .new-bill-to {
    width: 50%;
  }
  .new-payment-method {
    width: 40%;
    text-align: right;
  }
  .new-info-table {
    width: 100%;
    border-collapse: collapse;
  }
  .new-info-table td {
    padding: 2px 0;
    vertical-align: top;
  }
  .new-info-table .label {
    color: #999;
    width: 60px;
  }
  .new-info-table .value {
    color: #555;
  }
  
  .new-payment-details .method-title {
    color: #999;
    font-weight: 700;
  }
  .new-payment-details .method-desc {
    color: #555;
  }

  .new-table-section {
    padding: 0 50px;
    margin-bottom: 40px;
  }
  .new-items-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 4px;
  }
  .new-items-table th {
    background-color: #00b4a4;
    color: #fff;
    padding: 12px 10px;
    font-size: 11px;
    font-weight: 700;
  }
  .new-items-table th:first-child {
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
  }
  .new-items-table th:last-child {
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
  }
  .new-items-table td {
    padding: 12px 10px;
  }
  .new-items-table tr:nth-child(even) td {
    background-color: #e0f4f2;
  }
  .new-items-table tr:nth-child(even) td:first-child {
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
  }
  .new-items-table tr:nth-child(even) td:last-child {
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
  }
  
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  .item-desc-title { font-weight: 700; color: #333; }

  .new-totals-section {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
  .new-totals-box {
    width: 240px;
  }
  .new-subtotal-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    color: #555;
  }
  .new-grand-total {
    border-top: 1px solid #00b4a4;
    border-bottom: 1px solid #00b4a4;
    padding: 8px 0;
    width: 240px;
    display: flex;
    justify-content: space-between;
  }
  .new-grand-total .label {
    color: #00b4a4;
    font-weight: 700;
  }
  .new-grand-total .value {
    color: #00b4a4;
    font-weight: 700;
  }

  .new-footer-section {
    display: flex;
    justify-content: space-between;
    padding: 0 50px;
    margin-top: 60px;
  }
  .new-footer-left {
    width: 45%;
  }
  .best-regards {
    color: #999;
    margin-bottom: 4px;
  }
  .company-signer {
    color: #555;
    font-weight: 700;
    margin-bottom: 40px;
  }
  .footer-contact-line {
    border-top: 1px solid #ddd;
    margin-bottom: 12px;
  }
  .contact-title {
    color: #333;
    font-weight: 700;
    margin-bottom: 8px;
    font-size: 12px;
  }

  .new-footer-right {
    width: 45%;
  }
  .new-footer-right h2 {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 20px;
    letter-spacing: 1px;
  }
  .terms h4 {
    color: #333;
    font-size: 12px;
    margin-bottom: 4px;
  }
  .terms p {
    color: #999;
    line-height: 1.6;
  }
  
  .new-footer-bottom-bar {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 160px;
    height: 30px;
    background-color: #00b4a4;
  }
`
