// IDARAH Document Export & Print Service
// UNIA Kop Surat, Clean Print View, and CSV/Excel Export

export interface PrintDocumentConfig {
  title: string;
  documentNumber?: string;
  mahadName: string;
  period?: string;
  date?: string;
  contentHtml: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          let val = row[header];
          if (val === null || val === undefined) val = '';
          if (Array.isArray(val)) val = val.join('; ');
          if (typeof val === 'object') val = JSON.stringify(val);
          const escaped = ('' + val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printDocument = (config: PrintDocumentConfig) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Izinkan pop-up browser untuk mencetak dokumen.');
    return;
  }

  const printHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${config.title} - ${config.mahadName}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      color: #111;
      line-height: 1.5;
      font-size: 12pt;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .kop-surat {
      text-align: center;
      border-bottom: 3px double #0d5c3a;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }
    .kop-logo {
      width: 75px;
      height: 75px;
      object-fit: contain;
    }
    .kop-text h4 {
      margin: 0;
      font-size: 13pt;
      font-weight: normal;
      letter-spacing: 1px;
      color: #333;
    }
    .kop-text h2 {
      margin: 2px 0;
      font-size: 16pt;
      font-weight: bold;
      color: #0d5c3a;
      letter-spacing: 0.5px;
    }
    .kop-text h3 {
      margin: 2px 0;
      font-size: 14pt;
      font-weight: bold;
      color: #111;
    }
    .kop-text p {
      margin: 2px 0;
      font-size: 9.5pt;
      color: #555;
    }
    .doc-title {
      text-align: center;
      margin-bottom: 20px;
    }
    .doc-title h3 {
      margin: 0;
      font-size: 14pt;
      text-transform: uppercase;
      text-decoration: underline;
      font-weight: bold;
    }
    .doc-title p {
      margin: 4px 0 0 0;
      font-size: 11pt;
    }
    .content-body {
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
    }
    table, th, td {
      border: 1px solid #333;
    }
    th, td {
      padding: 6px 10px;
      font-size: 11pt;
      text-align: left;
    }
    th {
      background-color: #f0f4f1;
    }
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sig-box {
      width: 250px;
      text-align: center;
      font-size: 11pt;
    }
    .sig-space {
      height: 75px;
    }
    .sig-name {
      font-weight: bold;
      text-decoration: underline;
    }
    .footer-note {
      position: fixed;
      bottom: 0;
      width: 100%;
      font-size: 8.5pt;
      color: #888;
      border-top: 1px solid #ddd;
      padding-top: 4px;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="kop-surat">
    <div style="width: 70px; height: 70px; border-radius: 50%; background: #0d5c3a; color: white; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: bold; border: 2px solid #b48c36;">
      U
    </div>
    <div class="kop-text">
      <h4>DIREKTORAT KEPESANTRENAN</h4>
      <h2>UNIVERSITAS AL-AMIEN PRENDUAN</h2>
      <h3>${config.mahadName.toUpperCase()}</h3>
      <p>Jl. Raya Prenduan No. 01, Pragaan, Sumenep, Madura, Jawa Timur 69465</p>
      <p>Website: www.unia.ac.id | Email: sekretariat@unia.ac.id | Sistem Administrasi IDARAH</p>
    </div>
  </div>

  <div class="doc-title">
    <h3>${config.title}</h3>
    ${config.documentNumber ? `<p>Nomor: ${config.documentNumber}</p>` : ''}
    ${config.period ? `<p>Periode: ${config.period}</p>` : ''}
  </div>

  <div class="content-body">
    ${config.contentHtml}
  </div>

  <div class="signature-section">
    <div class="sig-box">
      <p>Mengetahui,</p>
      <p>Mudir Ma'had</p>
      <div class="sig-space"></div>
      <p class="sig-name">${config.mahadName.includes('Putri') ? 'Nyai Hj. Nurul Hidayah, M.A' : 'K.H. Moh. Khoirul Umam, M.Pd.I'}</p>
      <p>Pimpinan Ma'had</p>
    </div>

    <div class="sig-box">
      <p>Prenduan, ${config.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p>${config.signatoryTitle || "Sekretaris Ma'had"}</p>
      <div class="sig-space"></div>
      <p class="sig-name">${config.signatoryName || (config.mahadName.includes('Putri') ? 'Ustzh. Siti Maryam, S.Pd.I' : 'Ust. Ahmad Zarkasyi, S.Pd')}</p>
      <p>NIP / NIY: UNIA.2026.04</p>
    </div>
  </div>

  <div class="footer-note">
    <span>Dokumen Resmi Dicetak melalui Sistem Informasi & Administrasi Ma'had (IDARAH UNIA)</span>
    <span>Halaman 1 / 1</span>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
};
