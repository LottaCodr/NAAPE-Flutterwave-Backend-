import { generateTitles } from "../services/ai.title.service";

export async function suggestTitle(req, res) {
    try {
        const { type, content } = req.body;

        if (typeof type !== "string" || typeof content !== "string" || !type.trim() || content.trim().length < 20) {
            return res.status(400).json({
                error: "type and at least 20 characters of content are required",
            });
        }
        if (content.length > 8_000) {
            return res.status(413).json({ error: "content must not exceed 8,000 characters" });
        }

        const titles = await generateTitles(type, content);

        return res.json({ success: true, titles });
    } catch (err) {
        console.error("AI title error:", err);
        res.status(500).json({ error: "Failed to generate titles" });
    }
}
