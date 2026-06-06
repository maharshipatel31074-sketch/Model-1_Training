const Order = require('../models/Order');
const { sendEmail, sendSMS } = require('../config/notifications');

exports.createOrder = async (req, res, next) => {
  try {
    const { customer, items, paymentMode, notes } = req.body;
    if (!customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'customer and items are required' });
    }

    const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
    const shipping = subtotal > 2000 ? 0 : 99;
    const tax      = +(subtotal * 0.05).toFixed(2);  
    const total    = +(subtotal + shipping + tax).toFixed(2);

    // Save into MySQL via Sequelize
    const rawOrder = await Order.create({
      customerName:    customer.name,
      customerEmail:   customer.email,
      customerPhone:   customer.phone,
      customerAddress: `${customer.address}, ${customer.city} - ${customer.pincode}`,
      items:           JSON.stringify(items), // Transform nested objects to text row string
      subtotal, shipping, tax, total,
      paymentMode: paymentMode || 'COD',
      notes,
    });

    // Reconstruct into original structure format for notifications and responses
    const order = rawOrder.toJSON();
    order.items = JSON.parse(order.items);

    sendEmail({
  subject: `🏥 New Medical Order #${order.id}`,
  html: `
  <div style="font-family:Arial,sans-serif;max-width:800px;margin:auto;background:#f8f9fa;padding:20px;border-radius:10px;">

    <div style="background:#0d6efd;color:white;padding:20px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;">🏥 Maharshi Medical Platform</h1>
      <p style="margin:5px 0 0;">New Order Notification</p>
    </div>

    <div style="background:white;padding:20px;border:1px solid #ddd;">

      <h2 style="color:#198754;">New Order Received</h2>

      <h3>👤 Customer Details</h3>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td><b>Name</b></td>
          <td>${order.customerName}</td>
        </tr>
        <tr>
          <td><b>Email</b></td>
          <td>${order.customerEmail}</td>
        </tr>
        <tr>
          <td><b>Phone</b></td>
          <td>${order.customerPhone}</td>
        </tr>
        <tr>
          <td><b>Address</b></td>
          <td>${order.customerAddress}</td>
        </tr>
      </table>

      <br>

      <h3>📦 Order Items</h3>

      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
        <thead>
          <tr style="background:#0d6efd;color:white;">
            <th style="padding:10px;">Product</th>
            <th style="padding:10px;">SKU</th>
            <th style="padding:10px;">Qty</th>
            <th style="padding:10px;">Price</th>
            <th style="padding:10px;">Total</th>
          </tr>
        </thead>
        <tbody>

          ${order.items.map(item => `
            <tr>
              <td style="padding:10px;border:1px solid #ddd;">${item.name}</td>
              <td style="padding:10px;border:1px solid #ddd;">${item.sku}</td>
              <td style="padding:10px;border:1px solid #ddd;">${item.quantity}</td>
              <td style="padding:10px;border:1px solid #ddd;">₹${item.price}</td>
              <td style="padding:10px;border:1px solid #ddd;">
                ₹${item.price * item.quantity}
              </td>
            </tr>
          `).join('')}

        </tbody>
      </table>

      <br>

      <h3>💰 Payment Summary</h3>

      <table style="width:350px;">
        <tr>
          <td>Subtotal</td>
          <td>₹${order.subtotal}</td>
        </tr>
        <tr>
          <td>Shipping</td>
          <td>₹${order.shipping}</td>
        </tr>
        <tr>
          <td>Tax</td>
          <td>₹${order.tax}</td>
        </tr>
        <tr style="font-size:18px;font-weight:bold;color:#198754;">
          <td>Total</td>
          <td>₹${order.total}</td>
        </tr>
      </table>

      <br>

      <p>
        <b>Payment Method:</b> ${order.paymentMode}
      </p>

      <p>
        <b>Status:</b>
        <span style="background:#ffc107;padding:5px 10px;border-radius:5px;">
          ${order.status.toUpperCase()}
        </span>
      </p>

      ${
        notes
          ? `<p><b>Customer Notes:</b><br>${notes}</p>`
          : ''
      }

    </div>

    <div style="text-align:center;color:#777;padding:15px;">
      <small>
        Generated automatically by Maharshi Medical Platform<br>
        Order ID: #${order.id}
      </small>
    </div>

  </div>
  `

  
}).catch(e => console.error('[email]', e.message));

sendEmail({
  to: order.customerEmail,

  subject: `✅ Order Confirmed - Maharshi Medical (#${order.id})`,

  html: `
  <div style="font-family:Arial,sans-serif;max-width:800px;margin:auto;background:#f4f7fb;padding:20px;">

    <div style="background:#198754;color:white;padding:25px;text-align:center;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;">🏥 Maharshi Medical</h1>
      <p style="margin-top:8px;">
        Order Confirmation
      </p>
    </div>

    <div style="background:white;padding:30px;border:1px solid #ddd;">

      <h2 style="color:#198754;">
        ✅ Thank You For Your Order!
      </h2>

      <p>
        Dear <strong>${order.customerName}</strong>,
      </p>

      <p>
        We have successfully received your order and it is currently being processed.
      </p>

      <div style="background:#f8f9fa;padding:15px;border-left:4px solid #198754;margin:20px 0;">

        <h3 style="margin-top:0;">Order Details</h3>

        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMode}</p>

      </div>

      <h3>📦 Ordered Products</h3>

      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
        <thead>
          <tr style="background:#198754;color:white;">
            <th style="padding:10px;">Product</th>
            <th style="padding:10px;">Qty</th>
            <th style="padding:10px;">Price</th>
          </tr>
        </thead>
        <tbody>

          ${order.items.map(item => `
            <tr>
              <td style="padding:10px;border:1px solid #ddd;">
                ${item.name}
              </td>

              <td style="padding:10px;border:1px solid #ddd;">
                ${item.quantity}
              </td>

              <td style="padding:10px;border:1px solid #ddd;">
                ₹${item.price}
              </td>
            </tr>
          `).join('')}

        </tbody>
      </table>

      <br>

      <div style="background:#e8f5e9;padding:15px;border-radius:5px;">

        <h3>💰 Payment Summary</h3>

        <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
        <p><strong>Shipping:</strong> ₹${order.shipping}</p>
        <p><strong>Tax:</strong> ₹${order.tax}</p>

        <h2 style="color:#198754;">
          Total: ₹${order.total}
        </h2>

      </div>

      <br>

      <h3>🚚 Delivery Address</h3>

      <p>
        ${order.customerAddress}
      </p>

      <br>

      <div style="background:#fff3cd;padding:15px;border-radius:5px;">
        📞 For any queries, contact Maharshi Medical Support.
      </div>

    </div>

    <div style="background:#343a40;color:white;text-align:center;padding:20px;border-radius:0 0 10px 10px;">

      <h3 style="margin-top:0;">
        Thank You For Shopping With Us
      </h3>

      <p>
        Maharshi Medical Equipment Sales & Services
      </p>

      <p style="font-size:12px;color:#ccc;">
        This is an automated order confirmation email.
      </p>

      <p style="font-size:12px;color:#aaa;">
        © ${new Date().getFullYear()} Maharshi Medical. All Rights Reserved.
      </p>

    </div>

  </div>
  `
}).catch(e =>
  console.error('[customer email]', e.message)
);

    sendSMS({
      body: 'Maharshi Medical: new order ' + order.id + ' (Rs.' + total + ') from ' + customer.name,
    }).catch(e => console.error('[sms]', e.message));

    // Add _id alias so both j.order.id and j.order._id work on the frontend
    order._id = order.id;
    res.status(201).json({ ok: true, order });
  } catch (err) { next(err); }
};

exports.listOrders = async (req, res, next) => {
  try {
    const rawOrders = await Order.findAll({ order: [['createdAt', 'DESC']], limit: 200 });
    
    // Parse individual items arrays from database strings back to JSON sets
    const orders = rawOrders.map(o => {
      const formatted = o.toJSON();
      formatted.items = JSON.parse(formatted.items);
      return formatted;
    });

    res.json({ count: orders.length, orders });
  } catch (err) { next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const rawOrder = await Order.findByPk(req.params.id);
    if (!rawOrder) return res.status(404).json({ error: 'Order not found' });
    
    const order = rawOrder.toJSON();
    order.items = JSON.parse(order.items);

    res.json({ order });
  } catch (err) { next(err); }
};