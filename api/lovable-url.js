import { injectSpeedInsights } from '@vercel/speed-insights';

export default function handler(req, res) {
  // Inject Vercel Speed Insights for serverless function tracking
  injectSpeedInsights();
  
  // Enable CORS so ChatGPT can call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Valid prompt string is required' 
      });
    }

    // URL encode the prompt
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Build the Lovable URL with hash-based format
    const lovableUrl = `https://lovable.dev/?autosubmit=true#prompt=${encodedPrompt}`;
    
    return res.status(200).json({ 
      url: lovableUrl,
      success: true 
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to generate URL',
      details: error.message 
    });
  }
}