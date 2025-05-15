import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { trx_ref, ref_id, status } = req.query as { trx_ref?: string; ref_id?: string; status?: string };

    // Log the received data for debugging
    console.log('Received callback data:', req.query);

    if (!trx_ref || !ref_id || !status) {
      return res.status(400).json({ message: 'Missing request content' });
    }

    try {
      // Verify the transaction using Chapa's API
      const verificationResponse = await axios.get(`https://api.chapa.co/v1/transaction/verify/${trx_ref}`, {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      });

      const verificationData = verificationResponse.data;

      // Process based on verification result
      if (verificationData.status === 'success') {
        // Update your database or perform other actions
        console.log('Transaction verified successfully:', verificationData);
      } else {
        console.log('Transaction verification failed:', verificationData);
      }

      // Acknowledge the callback
      res.status(200).json({ message: 'Callback received and processed' });
    } catch (error) {
      console.error('Error verifying transaction:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}