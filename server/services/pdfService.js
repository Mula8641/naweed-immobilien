import PDFDocument from 'pdfkit'

export function generateInvoicePdf(invoice, tenant) {
  const doc = new PDFDocument({ margin: 50 })

  doc.fontSize(22).font('Helvetica-Bold').text('RECHNUNG', { align: 'right' })
  doc.moveDown(0.5)
  doc.fontSize(10).font('Helvetica').fillColor('#666')
    .text(`Rechnungsnummer: INV-${String(invoice.id).padStart(5, '0')}`, { align: 'right' })
    .text(`Datum: ${new Date(invoice.generated_at).toLocaleDateString('de-DE')}`, { align: 'right' })

  doc.moveDown(2)
  doc.fillColor('#000').fontSize(12).font('Helvetica-Bold').text('Naweed Immobilien')
  doc.fontSize(10).font('Helvetica').fillColor('#444')
    .text('Vermieter')
    .text('kontakt@naweed.com')

  doc.moveDown(1.5)
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000').text('Mieter:')
  doc.font('Helvetica').fillColor('#444').text(tenant.name).text(tenant.email)

  doc.moveDown(1.5)
  const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000')
    .text(`Mietzeitraum: ${monthNames[invoice.month - 1]} ${invoice.year}`)

  doc.moveDown(1)
  const tableTop = doc.y
  doc.fontSize(10).font('Helvetica-Bold')
  doc.text('Position', 50, tableTop)
  doc.text('Betrag', 400, tableTop, { width: 100, align: 'right' })

  doc.moveTo(50, tableTop + 16).lineTo(550, tableTop + 16).strokeColor('#ddd').stroke()

  let y = tableTop + 24
  doc.font('Helvetica').fillColor('#333')
  doc.text('Kaltmiete', 50, y)
  doc.text(`€ ${Number(invoice.rent_amount).toFixed(2)}`, 400, y, { width: 100, align: 'right' })

  const extras = invoice.extras || []
  extras.forEach(extra => {
    y += 20
    doc.text(extra.label, 50, y)
    doc.text(`€ ${Number(extra.amount).toFixed(2)}`, 400, y, { width: 100, align: 'right' })
  })

  y += 28
  doc.moveTo(50, y).lineTo(550, y).strokeColor('#333').stroke()
  y += 8
  doc.font('Helvetica-Bold').fillColor('#000').fontSize(12)
  doc.text('Gesamt', 50, y)
  doc.text(`€ ${Number(invoice.total).toFixed(2)}`, 400, y, { width: 100, align: 'right' })

  doc.moveDown(4)
  doc.fontSize(9).font('Helvetica').fillColor('#888')
    .text('Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.', { align: 'center' })

  return doc
}
