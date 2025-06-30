const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { text } = req.body || {};

  if (!text || text.trim().length < 20) {
    return res.status(400).json({ error: "Text too short or missing." });
  }

  if (!HUGGINGFACE_TOKEN) {
    return res.status(500).json({ error: "Missing Hugging Face token." });
  }

  try {
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/google/pegasus-xsum",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    const result = await hfResponse.json();
    console.log("🔁 HuggingFace Response:", result);

    let summary;

    if (Array.isArray(result) && result[0]?.summary_text) {
      summary = result[0].summary_text;
    } else if (result?.summary_text) {
      summary = result.summary_text;
    } else if (result?.error) {
      return res.status(500).json({ error: result.error });
    } else {
      summary = "No summary returned.";
    }

    return res.status(200).json({ summary });
  } catch (error) {
    console.error("🔥 API Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
