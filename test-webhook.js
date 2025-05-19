// This is a simple script to test the webhook endpoint
// Run it with: node test-webhook.js

const fetch = require('node-fetch');

async function testWebhook() {
  try {
    // Replace with your actual course ID and user email
    const webhookData = {
      event: 'charge.success',
      first_name: 'dev',
      last_name: 'Eyu',
      email: 'eyualekifle99@gmail.com', // This should be the user's email
      mobile: null,
      currency: 'ETB',
      amount: '1500.00',
      charge: '37.50',
      status: 'success',
      failure_reason: null,
      mode: 'test',
      reference: 'APOvWNikXB5Sw',
      created_at: '2025-05-19T05:58:25.000000Z',
      updated_at: '2025-05-19T05:58:25.000000Z',
      type: 'API',
      tx_ref: 'Natan-1747634279238', // This should match the tx_ref format used in your app
      payment_method: 'test',
      customization: { title: null, description: null, logo: null },
      meta: null
    };

    // Send the webhook data to your webhook endpoint
    const response = await fetch('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    const data = await response.json();
    console.log('Webhook test response:', data);
  } catch (error) {
    console.error('Error testing webhook:', error);
  }
}

testWebhook();
