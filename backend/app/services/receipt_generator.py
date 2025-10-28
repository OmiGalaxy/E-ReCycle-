from io import BytesIO
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

def generate_receipt_pdf(purchase_data, item_data, user_data):
    if not REPORTLAB_AVAILABLE:
        # Fallback: Generate simple text receipt
        return generate_text_receipt(purchase_data, item_data, user_data)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Header
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], 
                                fontSize=24, spaceAfter=30, textColor=colors.blue)
    story.append(Paragraph("E-CYCLE MARKETPLACE", title_style))
    story.append(Paragraph("Purchase Receipt", styles['Heading2']))
    story.append(Spacer(1, 20))
    
    # Order Info
    order_data = [
        ['Order ID:', f"ECY{purchase_data.id:06d}"],
        ['Date:', purchase_data.created_at.strftime('%B %d, %Y at %I:%M %p')],
        ['Customer:', user_data.full_name or user_data.username],
        ['Email:', user_data.email],
        ['Phone:', purchase_data.phone_number]
    ]
    
    order_table = Table(order_data, colWidths=[2*inch, 4*inch])
    order_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(order_table)
    story.append(Spacer(1, 20))
    
    # Item Details
    story.append(Paragraph("Item Details", styles['Heading3']))
    item_data_table = [
        ['Product:', item_data['title']],
        ['Brand:', item_data['brand']],
        ['Model:', item_data['model']],
        ['Seller:', item_data['seller_name']],
        ['Warranty:', item_data['warranty_info']]
    ]
    
    item_table = Table(item_data_table, colWidths=[2*inch, 4*inch])
    item_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(item_table)
    story.append(Spacer(1, 20))
    
    # Pricing
    story.append(Paragraph("Payment Summary", styles['Heading3']))
    subtotal = purchase_data.purchase_price
    tax = subtotal * 0.08
    total = subtotal + tax
    
    price_data = [
        ['Item Price:', f"${subtotal:.2f}"],
        ['Tax (8%):', f"${tax:.2f}"],
        ['Shipping:', 'FREE'],
        ['', ''],
        ['Total Paid:', f"${total:.2f}"]
    ]
    
    price_table = Table(price_data, colWidths=[4*inch, 2*inch])
    price_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('LINEBELOW', (0, -2), (-1, -2), 1, colors.black),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
    ]))
    story.append(price_table)
    story.append(Spacer(1, 20))
    
    # Shipping Address
    story.append(Paragraph("Shipping Address", styles['Heading3']))
    story.append(Paragraph(purchase_data.shipping_address, styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Footer
    story.append(Paragraph("Thank you for your purchase!", styles['Normal']))
    story.append(Paragraph("For support, contact us at support@ecycle.com", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

def generate_text_receipt(purchase_data, item_data, user_data):
    """Fallback text receipt if reportlab is not available"""
    subtotal = purchase_data.purchase_price
    tax = subtotal * 0.08
    total = subtotal + tax
    
    receipt_text = f"""
===============================================
            E-CYCLE MARKETPLACE
               Purchase Receipt
===============================================

Order ID: ECY{purchase_data.id:06d}
Date: {purchase_data.created_at.strftime('%B %d, %Y at %I:%M %p')}
Customer: {user_data.full_name or user_data.username}
Email: {user_data.email}
Phone: {purchase_data.phone_number}

-----------------------------------------------
                ITEM DETAILS
-----------------------------------------------
Product: {item_data['title']}
Brand: {item_data['brand']}
Model: {item_data['model']}
Seller: {item_data['seller_name']}
Warranty: {item_data['warranty_info']}

-----------------------------------------------
              PAYMENT SUMMARY
-----------------------------------------------
Item Price:        ${subtotal:.2f}
Tax (8%):          ${tax:.2f}
Shipping:          FREE
                   --------
Total Paid:        ${total:.2f}

-----------------------------------------------
             SHIPPING ADDRESS
-----------------------------------------------
{purchase_data.shipping_address}

===============================================
        Thank you for your purchase!
    For support, contact: support@ecycle.com
===============================================
"""
    return receipt_text.encode('utf-8')