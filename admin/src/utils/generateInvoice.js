import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function generateInvoice(order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const orderNumber = order._id.slice(-8).toUpperCase()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(220, 38, 38)
  doc.text('ROWDY MENS WEAR', 40, 50)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.setFont('helvetica', 'normal')
  doc.text('TAX INVOICE', pageWidth - 40, 45, { align: 'right' })
  doc.text(`Invoice #: ${orderNumber}`, pageWidth - 40, 60, { align: 'right' })
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - 40, 75, { align: 'right' })

  doc.setDrawColor(230)
  doc.line(40, 90, pageWidth - 40, 90)

  doc.setFontSize(11)
  doc.setTextColor(30)
  doc.setFont('helvetica', 'bold')
  doc.text('Billed / Shipped To', 40, 112)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const addr = order.shippingAddress || {}
  const addrLines = [
    addr.fullName || order.user?.name,
    addr.addressLine1,
    addr.addressLine2,
    `${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`,
    addr.phone,
  ].filter(Boolean)
  doc.text(addrLines, 40, 128)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Payment Details', pageWidth - 200, 112)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text([
    `Method: ${order.paymentMethod}`,
    `Status: ${order.paymentStatus}`,
    `Order Status: ${order.orderStatus}`,
  ], pageWidth - 200, 128)

  const rows = order.items.map(item => [
    item.name,
    item.size,
    String(item.quantity),
    `Rs ${item.price.toLocaleString('en-IN')}`,
    `Rs ${(item.price * item.quantity).toLocaleString('en-IN')}`,
  ])

  autoTable(doc, {
    startY: 200,
    head: [['Item', 'Size', 'Qty', 'Price', 'Amount']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [17, 17, 17], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    margin: { left: 40, right: 40 },
  })

  const finalY = doc.lastAutoTable.finalY + 20
  const summaryX = pageWidth - 220
  doc.setFontSize(10)
  doc.setTextColor(60)

  const summaryRows = [
    ['Subtotal', `Rs ${order.subtotal.toLocaleString('en-IN')}`],
    ...(order.discount > 0 ? [['Discount', `- Rs ${order.discount.toLocaleString('en-IN')}`]] : []),
    ['Shipping', order.shippingCost === 0 ? 'FREE' : `Rs ${order.shippingCost.toLocaleString('en-IN')}`],
  ]
  let y = finalY
  summaryRows.forEach(([label, val]) => {
    doc.text(label, summaryX, y)
    doc.text(val, pageWidth - 40, y, { align: 'right' })
    y += 16
  })

  doc.setDrawColor(230)
  doc.line(summaryX, y, pageWidth - 40, y)
  y += 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(17)
  doc.text('Total', summaryX, y)
  doc.text(`Rs ${order.total.toLocaleString('en-IN')}`, pageWidth - 40, y, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text('Thank you for shopping with Rowdy Mens Wear.', 40, doc.internal.pageSize.getHeight() - 40)

  doc.save(`invoice-${orderNumber}.pdf`)
}
