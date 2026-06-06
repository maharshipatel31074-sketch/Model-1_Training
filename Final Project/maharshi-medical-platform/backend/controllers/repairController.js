const RepairRequest = require('../models/RepairRequest');
const { sendEmail } = require('../config/notifications');

exports.createRepairRequest = async (req, res) => {
  try {
    const { customerName, email, phone, machineName, problem, urgency } = req.body;

    // Input validation — required fields only
    if (!customerName || !email || !phone || !machineName || !problem || !urgency) {
      return res.status(400).json({
        error: 'customerName, email, phone, machineName, problem and urgency are required'
      });
    }

    const request = await RepairRequest.create(req.body);

    // ADMIN EMAIL
    sendEmail({
      subject: `🔧 New Repair Request #${request.id}`,
      html: `
      <div style="font-family:Arial,sans-serif;max-width:800px;margin:auto;background:#f8f9fa;padding:20px;">
        <div style="background:#dc3545;color:white;padding:20px;text-align:center;">
          <h1>🔧 New Repair Request Received</h1>
        </div>
        <div style="background:white;padding:20px;border:1px solid #ddd;">
          <h2>Customer Information</h2>
          <p><strong>Name:</strong> ${request.customerName}</p>
          <p><strong>Email:</strong> ${request.email}</p>
          <p><strong>Phone:</strong> ${request.phone}</p>
          <p><strong>City:</strong> ${request.city || 'N/A'}</p>
          <hr>
          <h2>Machine Information</h2>
          <p><strong>Machine:</strong> ${request.machineName}</p>
          <p><strong>Model:</strong> ${request.model || 'N/A'}</p>
          <p><strong>Serial Number:</strong> ${request.serialNumber || 'N/A'}</p>
          <p><strong>Urgency:</strong> ${request.urgency}</p>
          <hr>
          <h2>Problem Description</h2>
          <div style="background:#fff3cd;padding:15px;border-radius:5px;">
            ${request.problem}
          </div>
        </div>
      </div>
      `
    }).catch(err => console.error('[admin email]', err.message));

    // CUSTOMER EMAIL
    sendEmail({
      to: request.email,
      subject: `🔧 Repair Request Received - #${request.id}`,
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:auto;background:#f4f7fb;padding:20px;">
        <div style="background:#0d6efd;color:white;padding:25px;text-align:center;border-radius:10px 10px 0 0;">
          <h1 style="margin:0;">🏥 Maharshi Medical</h1>
          <p style="margin-top:8px;">Medical Equipment Sales & Repair Services</p>
        </div>
        <div style="background:white;padding:30px;border:1px solid #ddd;">
          <h2 style="color:#198754;">✅ Repair Request Submitted Successfully</h2>
          <p>Dear <strong>${request.customerName}</strong>,</p>
          <p>Thank you for choosing Maharshi Medical. We have successfully received your repair request.</p>
          <div style="background:#f8f9fa;padding:15px;border-left:4px solid #0d6efd;margin:20px 0;">
            <h3 style="margin-top:0;">Request Details</h3>
            <p><strong>Request ID:</strong> #${request.id}</p>
            <p><strong>Machine:</strong> ${request.machineName}</p>
            <p><strong>Model:</strong> ${request.model || 'N/A'}</p>
            <p><strong>Serial Number:</strong> ${request.serialNumber || 'N/A'}</p>
            <p><strong>Priority:</strong> ${request.urgency}</p>
          </div>
          <h3>📋 Reported Issue</h3>
          <div style="background:#fff8e1;padding:15px;border-radius:5px;border:1px solid #ffe082;">
            ${request.problem}
          </div>
          <br>
          <div style="background:#e8f5e9;padding:15px;border-radius:5px;">
            <strong>Status:</strong>
            <span style="color:#198754;">Request Received & Under Review</span>
          </div>
          <br>
          <p>🔧 Our technician will review your request and contact you shortly.</p>
          <p>📞 Support Number: +91 9427370183</p>
          <p>Thank you for choosing Maharshi Medical.</p>
        </div>
        <div style="background:#343a40;color:white;text-align:center;padding:20px;border-radius:0 0 10px 10px;">
          <h3>Maharshi Medical Equipment</h3>
          <p>Medical Equipment Sales & Repair Services</p>
          <p style="font-size:13px;color:#ccc;">This is an automated email. Please do not reply directly.</p>
          <p style="font-size:12px;color:#aaa;">© ${new Date().getFullYear()} Maharshi Medical Equipment. All Rights Reserved.</p>
        </div>
      </div>
      `
    }).catch(err => console.error('[customer email]', err.message));

    res.status(201).json({ ok: true, request });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create repair request' });
  }
};

exports.listRepairRequests = async (req, res) => {
  try {
    const requests = await RepairRequest.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};