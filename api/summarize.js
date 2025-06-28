const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

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
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HUGGINGFACE_TOKEN}`
      },
      body: JSON.stringify({ inputs: text })
    });

    const result = await hfResponse.json();

    let summary;

    if (Array.isArray(result) && result[0]?.summary_text) {
      summary = result[0].summary_text;
    } else if (typeof result === "object" && result?.summary_text) {
      summary = result.summary_text;
    } else {
      summary = result?.error || "No summary returned from model.";
    }

    res.status(200).json({ summary });

  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}