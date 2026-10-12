import { backendReady, json, signedReportPhoto, supabase, uploadReportPhoto } from "./_server";

export const config = { runtime: "edge" };

const statuses = ["Received", "Assigned", "In progress", "Resolved"];

export default async function handler(request: Request) {
    if (!backendReady()) return json({ error: "Report storage is not configured yet. Add the Supabase project settings." }, 503);
    const url = new URL(request.url);
    try {
      if (request.method === "GET") {
        const id = url.searchParams.get("id");
        const token = url.searchParams.get("token");
        if (id && token) {
          const rows = await supabase(`/rest/v1/campus_reports?id=eq.${encodeURIComponent(id)}&tracking_token=eq.${encodeURIComponent(token)}&select=*,campus_report_updates(created_at,status,note,author)&limit=1`);
          return rows?.length ? json({ ...rows[0], image_url: await signedReportPhoto(rows[0].image_path) }) : json({ error: "Report not found." }, 404);
        }
        const rows = await supabase("/rest/v1/campus_reports?select=*,campus_report_updates(created_at,status,note,author)&order=created_at.desc&limit=100");
        return json(await Promise.all(rows.map(async (row: { image_path: string }) => ({ ...row, image_url: await signedReportPhoto(row.image_path) }))));
      }

      if (request.method === "POST") {
        const form = await request.formData();
        const image = form.get("image");
        const title = String(form.get("title") || "").trim();
        const description = String(form.get("description") || "").trim();
        if (!(image instanceof File) || !image.type.startsWith("image/")) return json({ error: "Every report needs a photo." }, 400);
        if (image.size > 4 * 1024 * 1024) return json({ error: "Please use a photo smaller than 4 MB." }, 413);
        if (!title || !description) return json({ error: "Review the report title and description before sending." }, 400);
        const id = crypto.randomUUID();
        const trackingToken = crypto.randomUUID();
        const imagePath = await uploadReportPhoto(image, id);
        const report = {
          id,
          tracking_token: trackingToken,
          title: title.slice(0, 100),
          description: description.slice(0, 1000),
          category: String(form.get("category") || "Other"),
          priority: ["Low", "Standard", "Urgent"].includes(String(form.get("priority"))) ? String(form.get("priority")) : "Standard",
          status: "Received",
          campus: String(form.get("campus") || "North Campus").slice(0, 100),
          location: String(form.get("location") || "Campus location not selected").slice(0, 200),
          image_path: imagePath,
          voice_transcript: String(form.get("transcript") || "").slice(0, 2000),
          response_target_minutes: 30,
        };
        const saved = await supabase("/rest/v1/campus_reports?select=*", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(report) });
        await supabase("/rest/v1/campus_report_updates", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ report_id: id, status: "Received", note: "Report sent to the North Campus facilities team.", author: "CivicSnap" }) });
        return json({ report: { ...saved[0], image_url: await signedReportPhoto(imagePath) }, trackingToken }, 201);
      }

      if (request.method === "PATCH") {
        const body = await request.json();
        const id = String(body.id || "");
        const status = String(body.status || "");
        const note = String(body.note || "").trim();
        if (!id || !statuses.includes(status)) return json({ error: "Choose a valid report and status." }, 400);
        const updated = await supabase(`/rest/v1/campus_reports?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ status, updated_at: new Date().toISOString(), ...(status === "Resolved" ? { resolution_note: note || "Issue resolved by campus facilities." } : {}) }) });
        if (!updated?.length) return json({ error: "Report not found." }, 404);
        const author = String(body.author || "Campus facilities").slice(0, 100);
        await supabase("/rest/v1/campus_report_updates", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ report_id: id, status, note: note || `Report status updated to ${status}.`, author }) });
        return json(updated[0]);
      }
      return json({ error: "Method not allowed." }, 405);
    } catch (error) {
      console.error("Campus reports request failed", error);
      return json({ error: "The campus reporting service could not complete that request." }, 500);
    }
}
