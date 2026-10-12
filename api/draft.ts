import { json } from "./_server";

export const config = { runtime: "edge" };

const allowedCategories = ["Cleaning", "Restroom", "Maintenance", "Lighting", "Waste", "Safety", "Other"];

function geminiFailure(status: number, message?: string) {
  const details = (message || "").toLowerCase();
  if (status === 400) return "Gemini couldn't process this photo or voice note. Try a different file.";
  if (status === 401 || status === 403) return "Gemini rejected the API key or project. Check GEMINI_API_KEY in .env.local and restart the app.";
  if (status === 404) return "The configured Gemini model is unavailable. Check GEMINI_MODEL in .env.local.";
  if (status === 429) return "Gemini has reached its current rate or usage limit. Wait a little and try again.";
  if (status >= 500) return "Gemini is temporarily unavailable. Wait a moment and try again.";
  if (details.includes("api key")) return "Gemini rejected the API key. Check GEMINI_API_KEY in .env.local and restart the app.";
  return "Gemini could not draft this report. Check the API settings and try again.";
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  return btoa(binary);
}

export default async function handler(request: Request) {
  if (request.method !== "POST") return json({ error: "Use POST to draft a report." }, 405);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: "AI setup is not complete yet. Add GEMINI_API_KEY to .env.local (or the deployment environment)." }, 503);

  let form: FormData;
  try { form = await request.formData(); }
  catch { return json({ error: "Could not read the report form." }, 400); }
  const image = form.get("image");
  const voice = form.get("voice");
  const note = String(form.get("note") || "").trim();
  const campus = String(form.get("campus") || "Campus").trim();
  const location = String(form.get("location") || "Campus location").trim();
  if (!(image instanceof File) || !image.type.startsWith("image/")) return json({ error: "A photo is required for every campus report." }, 400);
  if (image.size > 4 * 1024 * 1024) return json({ error: "Please use a photo smaller than 4 MB." }, 413);
  if (voice instanceof File && voice.size > 8 * 1024 * 1024) return json({ error: "Please use a voice note shorter than 8 MB." }, 413);

  try {
    const parts: Array<Record<string, unknown>> = [{
      text: [
        "Review this campus facilities report and draft useful details for the reporter to check and edit.",
        `Campus: ${campus}`,
        `Building and area: ${location}`,
        `Typed note: ${note || "(none)"}`,
        "An attached voice note, if present, contains the reporter's description. Transcribe its relevant details and use them with the photo.",
        "Do not invent details. Describe only what the photo or reporter supports. Mark a hazard urgent only when there is a clear immediate risk.",
        `Choose category from: ${allowedCategories.join(", ")}. Choose priority from: Low, Standard, Urgent. Return JSON with title, description, category, priority, and transcript (empty string if no voice note).`,
      ].join("\n"),
    }, {
      inlineData: { mimeType: image.type, data: toBase64(new Uint8Array(await image.arrayBuffer())) },
    }];
    if (voice instanceof File && voice.size > 0) {
      parts.push({ inlineData: { mimeType: voice.type || "audio/webm", data: toBase64(new Uint8Array(await voice.arrayBuffer())) } });
    }

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const completion = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });
    const result = await completion.json().catch(() => ({}));
    if (!completion.ok) {
      console.error("Gemini report draft request failed", { status: completion.status, message: result?.error?.message });
      return json({ error: geminiFailure(completion.status, result?.error?.message) }, 502);
    }
    const outputText = result.candidates?.[0]?.content?.parts?.map((item: { text?: string }) => item.text || "").join("") || "";
    const draft = JSON.parse(outputText);
    const category = allowedCategories.includes(draft.category) ? draft.category : "Other";
    const priority = ["Low", "Standard", "Urgent"].includes(draft.priority) ? draft.priority : "Standard";
    const transcript = String(draft.transcript || "").slice(0, 2000);
    return json({ title: String(draft.title || "Campus issue").slice(0, 100), description: String(draft.description || note || transcript).slice(0, 1000), category, priority, transcript });
  } catch (error) {
    console.error("Report draft failed", error);
    if (error instanceof TypeError) return json({ error: "Could not connect to Gemini. Check the app server's internet connection and try again." }, 502);
    return json({ error: "Could not create the draft. Please review your photo and try again." }, 502);
  }
}
