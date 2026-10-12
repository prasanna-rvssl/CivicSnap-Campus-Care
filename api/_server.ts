const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function backendReady() {
  return Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);
}

export async function supabase(path: string, init: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error("Supabase is not configured.");
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase returned ${response.status}.`);
  return text ? JSON.parse(text) : null;
}

export async function uploadReportPhoto(file: File, reportId: string) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error("Supabase is not configured.");
  const extension = file.type === "image/png" ? "png" : "jpg";
  const objectPath = `${reportId}/${crypto.randomUUID()}.${extension}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/campus-report-photos/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": file.type || "image/jpeg",
      "x-upsert": "false",
    },
    body: await file.arrayBuffer(),
  });
  if (!response.ok) throw new Error(await response.text());
  return objectPath;
}

export async function signedReportPhoto(objectPath: string) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error("Supabase is not configured.");
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/campus-report-photos/${objectPath.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST",
    headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Could not create a private photo link.");
  return `${SUPABASE_URL}/storage/v1${result.signedURL}`;
}
