const ReturnRequest = require('../models/ReturnRequest');
const { sendEmail } = require('../config/notifications');

exports.createReturnRequest = async (req, res, next) => {
  try {
    const { orderId, email, sku, reason, details } = req.body;
    
    if (!orderId || !email || !sku || !reason || !details) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save configuration directly to MySQL via Sequelize mapping
    const returnRequest = await ReturnRequest.create({
      orderId,
      email,
      sku,
      reason,
      details
    });

    // Notify the administration desk using existing SMTP bindings
    sendEmail({
      subject: `↩️ New Return Request Appended: Order #${orderId}`,
      html: `
        <div style="font-family:sans-serif; padding:20px; max-width:600px; border:1px solid #e2e8f0;">
          <h2 style="color:#ef4444;">Return Ticket Assigned (#${returnRequest.id})</h2>
          <p><strong>Order ID Reference:</strong> ${orderId}</p>
          <p><strong>Associated Customer:</strong> ${email}</p>
          <p><strong>Item Identifier SKU:</strong> ${sku}</p>
          <p><strong>Category Code:</strong> ${reason}</p>
          <blockquote style="background:#f8fafc; padding:10px; border-left:4px solid #ef4444;">
            ${details}
          </blockquote>
        </div>
      `
    }).catch(err => console.error('[admin return email notification error]', err.message));

    // Send dispatch notice confirmation back to user
    sendEmail({
      to: email,
      subject: `Return Confirmation Record Received - Order #${orderId}`,
      html: `
        <div style="font-family:sans-serif; padding:20px; max-width:600px;">
          <h2 style="color:#0284c7;">We Received Your Return Request</h2>
          <p>Your return request for item <strong>${sku}</strong> under Order Reference <strong>#${orderId}</strong> is under review.</p>
          <p><strong>Assigned Tracking ID:</strong> RET-${returnRequest.id}</p>
          <p>Our processing agents will reach out with item collection instructions shortly.</p>
        </div>
      `
    }).catch(err => console.error('[customer return confirmation failure]', err.message));

    res.status(201).json({ ok: true, returnRequestId: `RET-${returnRequest.id}` });
  } catch (err) {
    next(err);
  }
};

exports.listReturnRequests = async (req, res, next) => {
  try {
    const records = await ReturnRequest.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ count: records.length, returns: records });
  } catch (err) {
    next(err);
  }
};