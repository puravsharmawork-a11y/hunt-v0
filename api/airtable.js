export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
  
    const response = await fetch(process.env.VITE_AIRTABLE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
  
    if (!response.ok) {
      return res.status(500).json({ error: 'Airtable webhook failed' });
    }
  
    return res.status(200).json({ success: true });
  }