import { jsPDF } from 'jspdf';
import type { Quote, SiteSettings } from '@/src/types/creaprint';

export function calculateQuoteTotals(quote: Quote) {
  const subtotalHT = quote.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const discountAmount = subtotalHT * ((quote.discountPercent || 0) / 100);
  const netHT = Math.max(0, subtotalHT - discountAmount);
  const tvaAmount = netHT * ((quote.tvaPercent || 0) / 100);
  const totalTTC = netHT + tvaAmount;
  return { subtotalHT, discountAmount, netHT, tvaAmount, totalTTC };
}

function fmtMoney(n: number): string {
  return `${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DH`;
}

export function downloadQuotePdf(
  quote: Quote,
  settings: SiteSettings,
  documentType: 'DEVIS' | 'FACTURE' = 'DEVIS'
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const totals = calculateQuoteTotals(quote);

  // Header band in CreaPrint graphite #151515
  doc.setFillColor(21, 21, 21);
  doc.rect(0, 0, 210, 38, 'F');

  // 4-color prism mark
  doc.setFillColor(245, 216, 76); // Yellow
  doc.rect(14, 10, 5, 5, 'F');
  doc.setFillColor(241, 123, 155); // Rose
  doc.rect(19.6, 10, 5, 5, 'F');
  doc.setFillColor(86, 185, 232); // Cyan
  doc.rect(14, 15.6, 5, 5, 'F');
  doc.setFillColor(112, 132, 154); // Slate
  doc.rect(19.6, 15.6, 5, 5, 'F');

  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('CreaPrint', 28, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 190, 202);
  doc.text('DESIGN & IMPRESSION  |  MARRAKECH', 28, 22.5);
  doc.text(`Tél / WhatsApp : ${settings.whatsappNumber}  •  ${settings.email}`, 28, 28);

  // Document type & reference on right
  doc.setTextColor(86, 185, 232);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(documentType, 196, 16, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Réf : ${quote.reference}`, 196, 23, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(220, 220, 215);
  doc.text(
    `Date : ${new Date(quote.createdAt).toLocaleDateString('fr-MA')}`,
    196,
    29,
    { align: 'right' }
  );

  // Thin CMYK accent bar
  doc.setFillColor(86, 185, 232);
  doc.rect(0, 38, 52.5, 1.5, 'F');
  doc.setFillColor(245, 216, 76);
  doc.rect(52.5, 38, 52.5, 1.5, 'F');
  doc.setFillColor(241, 123, 155);
  doc.rect(105, 38, 52.5, 1.5, 'F');
  doc.setFillColor(112, 132, 154);
  doc.rect(157.5, 38, 52.5, 1.5, 'F');

  // Client & Company block
  doc.setFillColor(247, 247, 244);
  doc.roundedRect(14, 48, 88, 34, 2, 2, 'F');
  doc.roundedRect(108, 48, 88, 34, 2, 2, 'F');

  doc.setTextColor(112, 132, 154);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ÉMETTEUR', 18, 55);
  doc.text('CLIENT', 112, 55);

  doc.setTextColor(21, 21, 21);
  doc.setFontSize(10);
  doc.text(`${settings.companyName} — ${settings.signature}`, 18, 61);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(settings.city, 18, 66.5);
  doc.text(`ICE : ${settings.billingInfo.ice}`, 18, 72);
  doc.text(`RC : ${settings.billingInfo.rc}`, 18, 77);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(quote.clientName, 112, 61);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  let clientY = 66.5;
  if (quote.clientCompany) {
    doc.text(quote.clientCompany, 112, clientY);
    clientY += 5;
  }
  doc.text(`Tél : ${quote.clientPhone}`, 112, clientY);
  clientY += 5;
  doc.text(quote.clientCity || 'Marrakech', 112, clientY);

  // Table header
  let y = 94;
  doc.setFillColor(21, 21, 21);
  doc.rect(14, y, 182, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DÉSIGNATION', 18, y + 6);
  doc.text('QTÉ', 132, y + 6, { align: 'right' });
  doc.text('P.U. HT', 162, y + 6, { align: 'right' });
  doc.text('TOTAL HT', 192, y + 6, { align: 'right' });

  y += 14;
  doc.setTextColor(21, 21, 21);

  quote.items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(247, 247, 244);
      doc.rect(14, y - 5, 182, 13, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(item.label.slice(0, 58), 18, y);
    if (item.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(100, 110, 122);
      doc.text(item.description.slice(0, 72), 18, y + 4.5);
      doc.setTextColor(21, 21, 21);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(String(item.quantity), 132, y + 1, { align: 'right' });
    doc.text(fmtMoney(item.unitPrice), 162, y + 1, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(fmtMoney(item.quantity * item.unitPrice), 192, y + 1, { align: 'right' });

    y += 14;
  });

  // Totals box
  y += 6;
  doc.setDrawColor(233, 233, 230);
  doc.line(120, y, 196, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Sous-total HT', 122, y);
  doc.text(fmtMoney(totals.subtotalHT), 192, y, { align: 'right' });
  y += 6;

  if (quote.discountPercent > 0) {
    doc.text(`Remise (${quote.discountPercent}%)`, 122, y);
    doc.text(`- ${fmtMoney(totals.discountAmount)}`, 192, y, { align: 'right' });
    y += 6;
  }

  doc.text(`TVA (${quote.tvaPercent}%)`, 122, y);
  doc.text(fmtMoney(totals.tvaAmount), 192, y, { align: 'right' });
  y += 8;

  doc.setFillColor(21, 21, 21);
  doc.roundedRect(118, y - 5.5, 78, 11, 1.5, 1.5, 'F');
  doc.setTextColor(245, 216, 76);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('TOTAL TTC', 123, y + 1.5);
  doc.setTextColor(255, 255, 255);
  doc.text(fmtMoney(totals.totalTTC), 192, y + 1.5, { align: 'right' });

  // Notes & terms
  y += 18;
  doc.setTextColor(21, 21, 21);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Conditions & validité', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 98, 108);
  const termsText = `${settings.termsSummary}${quote.notes ? ` Remarque : ${quote.notes}` : ''} Valable jusqu'au ${new Date(quote.validUntil).toLocaleDateString('fr-MA')}.`;
  const lines = doc.splitTextToSize(termsText, 180);
  doc.text(lines, 14, y + 5.5);

  // Footer
  doc.setDrawColor(233, 233, 230);
  doc.line(14, 280, 196, 280);
  doc.setFontSize(7.5);
  doc.setTextColor(112, 132, 154);
  doc.text(
    `CreaPrint — Design & Impression • ${settings.hashtag} • WhatsApp : ${settings.whatsappNumber}`,
    105,
    286,
    { align: 'center' }
  );

  doc.save(`${documentType}_${quote.reference}_CreaPrint.pdf`);
}
