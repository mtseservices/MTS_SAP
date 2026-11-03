import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClientCompany } from '../types/erp';

export const exportTenantsToPdf = (
  companies: ClientCompany[],
  tabType: 'ACTIVE' | 'ARCHIVED',
  searchQuery: string = ''
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const titleText = 'MTS-ERP Central Portal — Master Tenant Summary Report';
  const reportType = tabType === 'ACTIVE' ? 'Active Tenants Directory' : 'Archived Companies Vault';
  const generatedTime = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(titleText, 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(`View: ${reportType}  |  Generated: ${generatedTime}`, 14, 18);

  // Filter Summary Box
  let startY = 28;
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(14, startY, 269, 12, 'F');

  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total Listed Companies: ${companies.length}`, 18, startY + 8);

  if (searchQuery.trim()) {
    doc.setFont('helvetica', 'normal');
    doc.text(`(Search Query Filter: "${searchQuery}")`, 110, startY + 8);
  }

  // Table Data Mapping
  const tableData = companies.map((comp, index) => [
    (index + 1).toString(),
    comp.code || 'N/A',
    comp.name || 'Unnamed Company',
    comp.tenantId || 'N/A',
    comp.adminEmail || comp.email || 'N/A',
    comp.createdAt || '2026-11-03',
    comp.subscriptionPlan || 'Professional',
    `${comp.userLimit || 10} Seats`,
    comp.isArchived ? 'ARCHIVED' : (comp.status || 'ACTIVE')
  ]);

  autoTable(doc, {
    startY: startY + 16,
    head: [[
      '#',
      'Code',
      'Business Name',
      'Tenant ID',
      'Admin Email',
      'Reg Date',
      'Plan',
      'Seats',
      'Status'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate-50
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 55, fontStyle: 'bold' },
      3: { cellWidth: 40 },
      4: { cellWidth: 50 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20, halign: 'center' },
      8: { cellWidth: 24, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Custom status cell colors
      if (data.section === 'body' && data.column.index === 8) {
        const statusVal = String(data.cell.raw);
        if (statusVal === 'ACTIVE') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        } else if (statusVal === 'ARCHIVED') {
          data.cell.styles.textColor = [147, 51, 234]; // Purple
        } else if (statusVal === 'SUSPENDED') {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        }
      }
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const totalPages = doc.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);

      doc.text(
        `Confidential Internal Report — MTS-ERP Central Tenant Management`,
        14,
        pageHeight - 8
      );

      const pageStr = `Page ${data.pageNumber} of ${totalPages}`;
      doc.text(pageStr, 280, pageHeight - 8, { align: 'right' });
    }
  });

  const fileName = `MTS_Tenant_Report_${tabType}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
