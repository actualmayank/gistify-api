export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST requests allowed' });
    }
  
    const { text } = req.body;
  
    if (!text) {
      return res.status(400).json({ error: 'No input text provided' });
    }
  
    try {
      const response = await fetch("https://api-inference.huggingface.co/models/philschmid/bart-large-cnn-samsum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      });
  
      const result = await response.json();
  
      const summary = Array.isArray(result) && result[0]?.summary_text
        ? result[0].summary_text
        : "No summary found (model returned empty)";
  
      res.status(200).json({ summary });
    } catch (err) {
      console.error("Error from Hugging Face:", err);
      res.status(500).json({ error: "Summarization failed" });
    }
  }