const nodemailer = require('nodemailer');
const https = require('https');

/**
 * Dispatch Order Notification Email to Nursery Owner via Web3Forms API
 * Uses the Web3Forms access key provided by the user.
 */
function sendViaWeb3Forms(order, accessKey) {
  return new Promise((resolve, reject) => {
    const adminPortalUrl = (process.env.CLIENT_URL || 'http://localhost:3000') + '/admin';
    const formattedItems = (order.products || []).map((p, idx) =>
      `${idx + 1}. ${p.name} (Size: ${p.size || 'Medium'}, Pot: ${p.potSize || 'Nursery Pot'}) x ${p.quantity} = ₹${(p.price || p.finalPrice) * p.quantity}`
    ).join('\n');

    const payload = {
      access_key: accessKey,
      subject: `🌱 New Plant Order Alert: #${order.orderNumber} (₹${order.totalAmount}) - ${order.customerName}`,
      from_name: "Ganapathi Gardens Nursery",
      name: order.customerName,
      email: order.email || "orders@ganapathigardens.com",
      phone: order.phone,
      "Order Number": `#${order.orderNumber}`,
      "Customer Name": order.customerName,
      "Customer Mobile": order.phone,
      "Customer Email": order.email || 'Not provided',
      "Delivery Area": order.area || 'Kakinada City',
      "Delivery Address": `${order.address}, ${order.city || 'Kakinada'} - ${order.pincode}`,
      "Payment Method": order.paymentMethod || 'Cash on Delivery',
      "Ordered Plants": formattedItems,
      "Subtotal": `₹${order.subtotal}`,
      "Transport Charge": `₹${order.transportCharge || 0}`,
      "Total Amount": `₹${order.totalAmount}`,
      "Admin Portal": adminPortalUrl,
      message: `A new plant nursery order has been placed on Ganapathi Gardens!\n\nOrder ID: #${order.orderNumber}\nCustomer: ${order.customerName} (📞 ${order.phone})\nTotal: ₹${order.totalAmount} (${order.paymentMethod || 'COD'})\nAddress: ${order.address}, ${order.area || ''}, ${order.city} - ${order.pincode}\n\nOrdered Plants:\n${formattedItems}\n\nManage this order in Admin Portal: ${adminPortalUrl}`
    };

    const dataString = JSON.stringify(payload);
    const options = {
      hostname: 'api.web3forms.com',
      path: '/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.success) {
            console.log(`\n===========================================================`);
            console.log(`🚀 [Web3Forms Email Delivered] Order #${order.orderNumber}`);
            console.log(`Recipient: Web3Forms Connected Inbox (pavansanthoshxo@gmail.com)`);
            console.log(`Customer: ${order.customerName} (Phone: ${order.phone})`);
            console.log(`Total: ₹${order.totalAmount} | Payment: ${order.paymentMethod || 'COD'}`);
            console.log(`===========================================================\n`);
            resolve({ success: true, web3forms: true });
          } else {
            console.warn(`⚠️ [Web3Forms Notice]:`, json.message || body);
            resolve({ success: false, message: json.message });
          }
        } catch (e) {
          console.error(`⚠️ [Web3Forms Parse Error]:`, e.message);
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`⚠️ [Web3Forms Connection Error]:`, e.message);
      resolve({ success: false, error: e.message });
    });

    req.write(dataString);
    req.end();
  });
}

/**
 * Configure Nodemailer Transporter as backup or for customer confirmations
 */
async function getTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (user && pass && user !== 'pavansanthoshxo@gmail.com' && pass !== 'your_app_password_here') {
    if (host.includes('gmail') || user.endsWith('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
    }
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    return {
      isTest: true,
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
    };
  } catch (err) {
    return null;
  }
}

/**
 * Send real-time email notification whenever an order is placed
 * Primary: Web3Forms (Instant delivery to owner's inbox)
 * Secondary: Customer confirmation email
 */
async function sendOrderEmails(order) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ganapathigardens.com';
  const customerEmail = order.email || order.customerDetails?.email;
  const web3FormsKey = process.env.WEB3FORMS_ACCESS_KEY;

  // 1. PRIMARY: Dispatch to owner via Web3Forms
  if (web3FormsKey) {
    try {
      await sendViaWeb3Forms(order, web3FormsKey);
    } catch (w3Err) {
      console.warn('⚠️ Web3Forms dispatch failed, proceeding to fallback:', w3Err.message);
    }
  }

  // 2. SECONDARY: Customer confirmation email if customer provided email
  if (customerEmail && customerEmail.includes('@')) {
    try {
      const transportResult = await getTransporter();
      if (transportResult) {
        const isTest = transportResult.isTest;
        const activeTransporter = isTest ? transportResult.transporter : transportResult;
        const sender = process.env.EMAIL_USER || 'orders@ganapathigardens.com';

        const customerEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8" /></head>
          <body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; padding: 24px;">
              <h2 style="color: #166534; margin-top: 0;">🌿 Ganapathi Gardens - Order Confirmed!</h2>
              <p>Dear <strong>${order.customerName}</strong>,</p>
              <p>Your order <strong>#${order.orderNumber}</strong> has been received by our nursery at Cheediga, Kakinada.</p>
              <p><strong>Total Payable:</strong> ₹${order.totalAmount} (${order.paymentMethod || 'Cash on Delivery'})</p>
              <p><strong>Delivery Address:</strong> ${order.address}, ${order.city} - ${order.pincode}</p>
              <p style="margin-top: 20px; color: #64748b; font-size: 13px;">Need assistance? Call us directly at 090008 35323.</p>
            </div>
          </body>
          </html>
        `;

        await activeTransporter.sendMail({
          from: `"Ganapathi Gardens" <${sender}>`,
          to: customerEmail,
          subject: `Order Confirmation #${order.orderNumber} - Ganapathi Gardens`,
          html: customerEmailHtml
        });
        console.log(`📧 [Customer Confirmation Sent] Dispatched to ${customerEmail}`);
      }
    } catch (custErr) {
      console.warn(`⚠️ [Customer Email Notice]:`, custErr.message);
    }
  }

  return { sent: true, web3forms: Boolean(web3FormsKey), adminEmail };
}

module.exports = { sendOrderEmails, sendViaWeb3Forms };
