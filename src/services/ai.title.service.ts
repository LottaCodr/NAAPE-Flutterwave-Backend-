import OpenAI from "openai";

let client: OpenAI | undefined;

const getClient = () => {
    if (!process.env.OPENAI_API_KEY) throw new Error("AI title suggestions are not configured");
    client ||= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return client;
};

export async function generateTitles(type: string, content: string) {
    const cleanType = type.trim().slice(0, 50);
    const cleanContent = content.trim().slice(0, 8_000);
    const prompt = `You are an expert aviation media editor. Generate five compelling, SEO-friendly titles for a ${cleanType}.

Requirements:
- Keep each title short, clear, accurate, and professional.
- Use strong hooks suitable for publications, news articles, or events.
- Avoid sensationalism and clickbait.
- Return only a simple numbered list.

Content:
"${cleanContent}"`;

    const response = await getClient().responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
    });

    return response.output_text
        .trim()
        .split("\n")
        .map((title) => title.replace(/^\d+[.)]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 5);
}
