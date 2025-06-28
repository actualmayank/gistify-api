export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed" });
    }
  
    const { text } = req.body;
  
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: "Text too short or missing." });
    }
  
    try {
      const hfResponse = await fetch("https://api-inference.huggingface.co/models/google/pegasus-xsum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      });
  
      const result = await hfResponse.json();
  
      console.log("🧠 HuggingFace response:", result);
  
      let summary;
  
      // Handle array result format
      if (Array.isArray(result) && result[0]?.summary_text) {
        summary = result[0].summary_text;
      }
  
      // Handle object format
      else if (typeof result === "object" && result?.summary_text) {
        summary = result.summary_text;
      }
  
      // Handle errors from Hugging Face
      else if (result?.error || result?.detail) {
        return res.status(500).json({
          error: "Model error: " + (result.error || result.detail || "Unknown")
        });
      }
  
      // Fallback
      else {
        summary = "No summary available (unexpected model output).";
      }
  
      res.status(200).json({ summary });
  
    } catch (error) {
      console.error("🔥 Server error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }  