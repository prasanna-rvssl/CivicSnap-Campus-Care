import { useCallback, useEffect, useRef, useState } from "react";

const PHOTO =
  "https://images.unsplash.com/photo-1711361234578-1845b58b20c0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=82&w=1200";

type IconName =
  | "arrow"
  | "back"
  | "building"
  | "camera"
  | "check"
  | "chevron"
  | "clock"
  | "edit"
  | "file"
  | "home"
  | "list"
  | "location"
  | "mic"
  | "plus"
  | "search"
  | "send"
  | "sparkle"
  | "team"
  | "trash"
  | "user"
  | "warning";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    back: <path d="m15 18-6-6 6-6" />,
    building: <><path d="M4 21h16M6 21V5l6-2 6 2v16" /><path d="M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" /></>,
    camera: <><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11h18V7a2 2 0 0 0-2-2Z" /><circle cx="12" cy="12" r="3.5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    edit: <><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10Z" /><path d="m13.5 7 3.5 3.5" /></>,
    file: <><path d="M6 3h8l4 4v14H6Z" /><path d="M14 3v5h5M9 13h6m-6 4h5" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    sparkle: <><path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z" /></>,
    team: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2" /><circle cx="18" cy="9" r="2" /><path d="M16 14a5 5 0 0 1 5 5v1" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7" /><path d="M10 11v6m4-6v6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    warning: <><path d="M12 3 2.5 20h19Z" /><path d="M12 9v5m0 3h.01" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo ${light ? "logo-light" : ""}`}>
      <span className="logo-mark"><Icon name="location" size={19} /></span>
      <span>CivicSnap</span>
    </div>
  );
}

function Button({ children, variant = "primary", icon, onClick, disabled = false }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "quiet" | "danger"; icon?: IconName; onClick?: () => void; disabled?: boolean;
}) {
  return <button className={`button button-${variant}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} />}{children}</button>;
}

function Chip({ children, tone = "received" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`chip chip-${tone}`}><span className="chip-dot" />{children}</span>;
}

async function readApiResponse(response: Response) {
  let data: any;
  try { data = await response.json(); }
  catch { throw new Error("The /api route did not return JSON. Restart CivicSnap with `npm run dev` or check the deployed API routes."); }
  if (!response.ok) throw new Error(data?.error || `The request failed (${response.status}).`);
  return data;
}

function VisitorHeader({ back, onBack }: { back?: boolean; onBack?: () => void }) {
  return (
    <header className="mobile-header">
      {back ? <button className="icon-button" onClick={onBack} aria-label="Go back"><Icon name="back" /></button> : <Logo />}
      {back && <Logo />}
      <span className="avatar" aria-hidden="true"><Icon name="user" size={18} /></span>
    </header>
  );
}

const quickIssues = [
  { icon: "sparkle" as IconName, label: "Needs cleaning" },
  { icon: "trash" as IconName, label: "Bin is full" },
  { icon: "warning" as IconName, label: "Something is broken" },
];

const campusPlaces: Record<string, string[]> = {
  "North Campus": ["Main Library · Ground floor · Public restroom", "Student Center · Cafeteria", "Science Block · Level 2", "Hostel A · Common area", "Sports Complex · Changing rooms"],
  "South Campus": ["Engineering Block · Level 1", "South Cafeteria · Dining hall", "Admin Building · Lobby", "Hostel C · Common area", "Lecture Hall · Ground floor"],
};

function HomeScreen({ go, campus, location, setCampus, setLocation }: { go: (page: string) => void; campus: string; location: string; setCampus: (value: string) => void; setLocation: (value: string) => void }) {
  return (
    <>
      <VisitorHeader />
      <main className="mobile-content home-content !px-5 [&_.welcome]:!px-0 [&_.section-heading]:!mx-0 [&_.how-line+_.how-number]:col-start-1">
        <div className="facility-pill"><Icon name="location" size={18} /><span><small>Your campus · Change location</small><select className="home-location-select" aria-label="Choose campus location" value={`${campus}|${location}`} onChange={(event) => { const [nextCampus, ...rest] = event.target.value.split("|"); setCampus(nextCampus); setLocation(rest.join("|")); }}>{Object.entries(campusPlaces).flatMap(([campusName, places]) => places.map((place) => <option key={`${campusName}|${place}`} value={`${campusName}|${place}`}>{campusName} · {place}</option>))}</select></span><Icon name="chevron" size={16} /></div>
        <section className="welcome">
          <p className="eyebrow">A better space starts here</p>
          <h1>See something that needs attention?</h1>
          <p>Help keep campus spaces safe, clean, and working.</p>
        </section>
        <button className="hero-action" onClick={() => go("details")}>
          <span className="hero-icon"><Icon name="plus" size={26} /></span>
          <span><b>Report a campus issue</b><small>Photo required · voice note optional</small></span>
          <Icon name="arrow" />
        </button>
        <Button variant="secondary" icon="clock" onClick={() => go("tracking")}>Track my reports</Button>
        <div className="section-heading"><h2>Quick start</h2><span>Choose an issue</span></div>
        <div className="quick-grid">
          {quickIssues.map((item) => <button key={item.label} onClick={() => go("details")}><span><Icon name={item.icon} /></span>{item.label}</button>)}
        </div>
        <div className="how-card">
          <div className="how-number">1</div><div><b>Report it</b><span>Tell us what needs attention.</span></div>
          <div className="how-line" />
          <div className="how-number">2</div><div className="flex flex-col pb-[13px]"><b>The team responds</b><span>Your report goes to the right people.</span></div>
          <div className="how-line" />
          <div className="how-number">3</div><div><b>Follow the update</b><span>See progress from start to finish.</span></div>
        </div>
      </main>
    </>
  );
}

type CapturedIssue = { image: File; voice?: Blob; note: string; campus: string; location: string };
type DraftData = { title: string; description: string; category: string; priority: string; transcript: string };
type SavedReport = { id: string; tracking_token: string; title: string; description: string; category: string; priority: string; status: string; campus: string; location: string; image_url: string; created_at: string; response_target_minutes: number; resolution_note?: string; campus_report_updates?: Array<{ status: string; created_at: string; note: string; author: string }> };

function DetailsScreen({ go, campus, location, setCampus, setLocation, onReady }: { go: (page: string) => void; campus: string; location: string; setCampus: (value: string) => void; setLocation: (value: string) => void; onReady: (issue: CapturedIssue) => void }) {
  const [recording, setRecording] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState("");
  const cameraRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [note, setNote] = useState("");
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (photo) URL.revokeObjectURL(photo);
    if (voiceUrl) URL.revokeObjectURL(voiceUrl);
  }, [photo, voiceUrl]);
  const pickPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setCaptureError("Choose an image file for your report."); return; }
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    setPhotoFile(file);
    setCaptureError("");
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setVoiceBlob(blob);
        setVoiceUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecording(true);
      setCaptureError("");
    } catch {
      setCaptureError("Microphone access is unavailable. Allow microphone access in your browser, then try recording again.");
    }
  };
  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecording(false);
  };
  return (
    <>
      <VisitorHeader back onBack={() => go("home")} />
      <main className="mobile-content report-form-content">
        <div className="step-label">Step 1 of 2</div><div className="progress"><span className="two" /></div>
        <h1 className="screen-title">Show us what needs attention</h1>
        <p className="screen-subtitle">A photo is required so the campus team can understand the issue.</p>
        <input ref={cameraRef} className="visually-hidden-input" type="file" accept="image/*" capture="environment" onChange={(event) => pickPhoto(event.target.files?.[0])} />
        <input ref={imageRef} className="visually-hidden-input" type="file" accept="image/*" onChange={(event) => pickPhoto(event.target.files?.[0])} />
        {photo ? <div className="photo-preview"><img src={photo} alt="Selected campus issue" /><div className="photo-badge"><Icon name="check" size={14} /> Photo added</div><button aria-label="Remove photo" onClick={() => { URL.revokeObjectURL(photo); setPhoto(null); setPhotoFile(null); }}><Icon name="trash" size={17} /></button></div> : <div className="photo-empty"><Icon name="camera" size={28} /><b>Add a photo <span>Required</span></b><p>Take a picture or choose one from your phone.</p><div className="button-row"><Button icon="camera" onClick={() => cameraRef.current?.click()}>Take photo</Button><Button variant="secondary" icon="file" onClick={() => imageRef.current?.click()}>Upload photo</Button></div></div>}
        <div className="record-card">
          <button className={`record-button ${recording ? "is-recording" : ""}`} onClick={recording ? stopRecording : startRecording} aria-label={recording ? "Stop recording" : "Start voice recording"}><Icon name={recording ? "check" : "mic"} size={21} /></button>
          <div><b>{recording ? "Recording… tap to finish" : voiceUrl ? "Voice note ready" : "Record a voice message"}</b><span>{recording ? "Tap the button when you’re done" : voiceUrl ? "Tap record to replace your recording" : "Optional · recorded here in the app"}</span></div>
          {recording && <div className="wave"><i /><i /><i /><i /><i /></div>}
        </div>
        {voiceUrl && <div className="audio-review"><audio controls src={voiceUrl} /><button onClick={() => { URL.revokeObjectURL(voiceUrl); setVoiceUrl(null); setVoiceBlob(null); }}>Remove</button></div>}
        <div className="location-card">
          <span className="location-pin"><Icon name="location" /></span>
          <div className="location-fields"><small>REPORT LOCATION</small><select aria-label="Choose campus" value={campus} onChange={(event) => { setCampus(event.target.value); setLocation(campusPlaces[event.target.value][0]); }}><option>North Campus</option><option>South Campus</option></select><select aria-label="Choose building and area" value={location} onChange={(event) => setLocation(event.target.value)}>{campusPlaces[campus].map((place) => <option key={place}>{place}</option>)}</select></div>
        </div>
        <div className="timestamp"><Icon name="clock" size={16} /> {new Date().toLocaleString()} · Campus location selected</div>
        <label className="field-label">Add a note <span>Optional</span></label>
        <textarea className="textarea" placeholder="Add any details the photo may not show. AI can draft a description from your photo." value={note} onChange={(event) => setNote(event.target.value)} />
        {captureError && <p className="capture-error" role="alert">{captureError}</p>}
        <Button icon="sparkle" disabled={!photoFile || recording} onClick={() => { if (!photoFile) setCaptureError("Please take or upload a photo before continuing."); else { onReady({ image: photoFile, voice: voiceBlob ?? undefined, note, campus, location }); go("draft"); } }}>Review report</Button>
      </main>
    </>
  );
}

function DraftScreen({ go, issue, draft, setDraft, onSubmit }: { go: (page: string) => void; issue: CapturedIssue | null; draft: DraftData | null; setDraft: (draft: DraftData | null) => void; onSubmit: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  useEffect(() => { if (issue?.image) { const url = URL.createObjectURL(issue.image); setPreview(url); return () => URL.revokeObjectURL(url); } }, [issue]);
  useEffect(() => {
    if (!issue || draft) return;
    let cancelled = false;
    const create = async () => {
      setLoading(true); setError("");
      try {
        const form = new FormData(); form.append("image", issue.image); if (issue.voice) form.append("voice", issue.voice, "voice-note.webm"); form.append("note", issue.note); form.append("campus", issue.campus); form.append("location", issue.location);
        const response = await fetch("/api/draft", { method: "POST", body: form }); const data = await readApiResponse(response);
        if (!cancelled) setDraft(data);
      } catch (e) { if (!cancelled) { setDraft({ title: issue.note.slice(0, 80) || "Campus issue", description: issue.note || "Please review the attached photo and add any details that may help the facilities team.", category: "Other", priority: "Standard", transcript: "" }); setError(e instanceof Error ? `${e.message} You can still edit and submit the report.` : "AI unavailable. You can still edit the report."); } }
      finally { if (!cancelled) setLoading(false); }
    };
    void create(); return () => { cancelled = true; };
  }, [issue, draft, setDraft]);
  if (!issue || !draft) return <><VisitorHeader back onBack={() => go("details")} /><main className="mobile-content"><p>{loading ? "Preparing your report with AI…" : "Your report is not ready yet."}</p>{error && <p className="capture-error">{error}</p>}</main></>;
  const submit = async () => { setLoading(true); setError(""); try { await onSubmit(); go("submitted"); } catch (e) { setError(e instanceof Error ? e.message : "Could not submit report."); } finally { setLoading(false); } };
  return (
    <>
      <VisitorHeader back onBack={() => go("details")} />
      <main className="mobile-content">
        <div className="step-label">Step 2 of 2</div><div className="progress"><span className="three" /></div>
        <div className="ai-label"><Icon name={error ? "warning" : "sparkle"} size={17} /> {error ? "Draft ready to review" : "AI-drafted report — please review"}</div>
        <h1 className="screen-title">Does this look right?</h1>
        <div className="draft-card">
          <div className="draft-photo"><img src={preview} alt="Photo attached to your report" /><span><Icon name={error ? "edit" : "sparkle"} size={15} /> {error ? "Manual draft" : "Drafted with AI"}</span></div>
          <label>REPORT TITLE</label>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <label>DESCRIPTION</label>
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          <div className="suggestions">
            <div><small>SUGGESTED CATEGORY</small><Chip tone="teal">{draft.category}</Chip></div>
            <div><small>SUGGESTED PRIORITY</small><Chip tone="standard">{draft.priority}</Chip></div>
          </div>
        </div>
        <div className="ai-note"><Icon name="warning" size={17} />AI can make mistakes. Check the details before submitting.</div>
        {error && <><p className="capture-error" role="alert">{error}</p><button className="text-link" disabled={loading} onClick={() => { setError(""); setDraft(null); }}><Icon name="sparkle" size={16} /> Try AI draft again</button></>}
        <div className="button-row"><Button variant="secondary" icon="edit" onClick={() => go("details")}>Edit report</Button><Button icon={loading ? "clock" : "send"} onClick={submit} disabled={loading}>{loading ? "Sending…" : "Send report"}</Button></div>
      </main>
    </>
  );
}

function SubmittedScreen({ go, report }: { go: (page: string) => void; report: SavedReport | null }) {
  return (
    <>
      <VisitorHeader />
      <main className="mobile-content submitted-content">
        <div className="success-orbit"><span><Icon name="check" size={34} /></span></div>
        <p className="eyebrow">Report received</p>
        <h1>Thanks for reporting this.</h1>
        <p>The facility team has been notified.</p>
        <div className="receipt-card">
          <div className="receipt-top"><span>REPORT #{report?.id.slice(0, 8).toUpperCase() || "PENDING"}</span><Chip>{report?.status || "Received"}</Chip></div>
          <b>{report?.title || "Campus issue"}</b>
          <div className="receipt-line"><Icon name="location" size={18} /><span>{report?.campus || "North Campus"}<br /><small>{report?.location || "Campus location"}</small></span></div>
          <div className="receipt-line"><Icon name="clock" size={18} /><span>Submitted {report?.created_at ? new Date(report.created_at).toLocaleString() : "just now"}</span></div>
          <div className="target"><Icon name="clock" /><span><small>TARGET RESPONSE</small><b>Within 30 minutes</b></span></div>
        </div>
        <Button onClick={() => go("tracking")}>View report</Button>
        <Button variant="quiet" icon="plus" onClick={() => go("home")}>Report another issue</Button>
      </main>
    </>
  );
}

function TrackingScreen({ go, report }: { go: (page: string) => void; report: SavedReport | null }) {
  const [current, setCurrent] = useState<SavedReport | null>(report);
  useEffect(() => { setCurrent(report); }, [report]);
  useEffect(() => {
    if (!report?.id || !report.tracking_token) return;
    let active = true;
    const refresh = async () => { try { const response = await fetch(`/api/reports?id=${encodeURIComponent(report.id)}&token=${encodeURIComponent(report.tracking_token)}`); if (response.ok) { const data = await response.json(); if (active) setCurrent(data); } } catch { /* Keep the last loaded status if temporarily offline. */ } };
    void refresh(); const timer = window.setInterval(() => void refresh(), 12000);
    return () => { active = false; window.clearInterval(timer); };
  }, [report]);
  const resolved = current?.status === "Resolved";
  return (
    <>
      <VisitorHeader back onBack={() => go("home")} />
      <main className="mobile-content">
        <div className="tracking-head"><div><p className="eyebrow">REPORT #{current?.id.slice(0, 8).toUpperCase() || "—"}</p><h1>{current?.title || "Your campus report"}</h1></div><Chip tone={resolved ? "resolved" : "received"}>{current?.status || "Received"}</Chip></div>
        {current?.image_url && <div className="tracking-photo"><img src={current.image_url} alt="Photo attached to campus report" /></div>}
        <p className="report-desc">{current?.description || "Submit a report to follow the facilities team's progress."}</p>
        <div className="mini-location"><Icon name="location" /><span><b>{current?.campus || "North Campus"}</b>{current?.location || "Campus location"}</span></div>
        <div className="timeline">
          {(["Received", "Assigned", "In progress", "Resolved"] as const).map((title, i) => { const activeIndex = ["Received", "Assigned", "In progress", "Resolved"].indexOf(current?.status || "Received"); const update = current?.campus_report_updates?.find((item) => item.status === title); const receivedAt = title === "Received" && current?.created_at ? current.created_at : update?.created_at; const detail = receivedAt ? `${update?.note || "Report sent to the facilities team."} · ${new Date(receivedAt).toLocaleString()}` : i <= activeIndex ? "Status updated by campus facilities" : "Waiting for the previous step"; const done = i <= activeIndex; return <div className={done ? "done" : ""} key={title}><span>{done ? <Icon name="check" size={14} /> : i + 1}</span><p><b>{title}</b><small>{detail}</small></p></div>; })}
        </div>
        {!resolved ? <div className="update-card"><span className="live-dot" /><p><b>{current?.status || "Received"}</b><small>Progress refreshes automatically while this page is open.</small></p></div> :
          <div className="resolved-card"><p className="eyebrow">COMPLETION NOTE</p><b>{current?.resolution_note || current?.campus_report_updates?.find((item) => item.status === "Resolved")?.note || "The facilities team marked this report resolved."}</b><p>Updated by campus facilities</p></div>}
      </main>
    </>
  );
}

const reports = [
  { title: "Restroom needs cleaning", place: "Central Library · Ground floor", priority: "Standard", time: "8 min ago", status: "Received", target: "22 min", tone: "received" },
  { title: "Soap dispenser empty", place: "Central Library · Ground floor", priority: "Low", time: "14 min ago", status: "Assigned", target: "46 min", tone: "assigned" },
  { title: "Water leak near sink", place: "Central Library · Level 2", priority: "Urgent", time: "21 min ago", status: "In progress", target: "9 min", tone: "progress" },
  { title: "Damaged hand dryer", place: "Riverside Centre · Level 1", priority: "Standard", time: "1h 12m ago", status: "Past target", target: "12 min past", tone: "past" },
  { title: "Overflowing bin", place: "City Hall Annex · Lobby", priority: "Standard", time: "1h 24m ago", status: "Assigned", target: "6 min", tone: "assigned" },
];

function StaffShell({ detail, setDetail, onExit }: { detail: boolean; setDetail: (v: boolean) => void; onExit: () => void }) {
  const [status, setStatus] = useState("Received");
  return (
    <div className="staff-app">
      <aside className="sidebar">
        <Logo light />
        <nav>
          <button className={!detail ? "active" : ""} onClick={() => setDetail(false)}><Icon name="home" />Overview</button>
          <button className={detail ? "active" : ""}><Icon name="list" />Reports<span>12</span></button>
          <button><Icon name="building" />Facilities</button>
          <button><Icon name="team" />Team</button>
        </nav>
        <div className="sidebar-bottom"><button onClick={onExit}><span className="avatar avatar-light">AM</span><span><b>Alex Morgan</b><small>Supervisor</small></span><Icon name="chevron" size={16} /></button></div>
      </aside>
      <div className="staff-main">
        <header className="staff-header"><div><small>Central Library</small><b>Facilities operations</b></div><div className="header-actions"><button className="search-box"><Icon name="search" />Search reports</button><button className="notification"><Icon name="clock" /><span /></button><span className="avatar">AM</span></div></header>
        {!detail ? <Dashboard openDetail={() => setDetail(true)} /> : <ReportDetail status={status} setStatus={setStatus} back={() => setDetail(false)} />}
      </div>
    </div>
  );
}

const staffMembers = [
  { name: "Maya Patel", role: "Facilities coordinator", team: "Cleaning team", initials: "MP" },
  { name: "Arjun Rao", role: "Campus maintenance", team: "Maintenance team", initials: "AR" },
  { name: "Sam Rivera", role: "Student services", team: "Campus services", initials: "SR" },
];

function StaffMobile({ onExit }: { onExit: () => void }) {
  const [staff, setStaff] = useState<(typeof staffMembers)[number] | null>(null);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [selected, setSelected] = useState<SavedReport | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const load = useCallback(async () => {
    const response = await fetch("/api/reports"); const data = await readApiResponse(response);
    setReports(data); setError("");
  }, []);
  useEffect(() => { if (staff) void load().catch((e) => setError(e.message)); }, [staff, load]);
  const update = async (status: string) => {
    if (!selected) return;
    try {
      const response = await fetch("/api/reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, status, author: staff?.name }) }); const data = await readApiResponse(response);
      setError(""); setSelected({ ...data, image_url: selected.image_url }); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update report."); }
  };
  const openCount = reports.filter((report) => report.status !== "Resolved").length;
  const inProgressCount = reports.filter((report) => report.status === "In progress").length;
  const resolvedCount = reports.filter((report) => report.status === "Resolved").length;
  const visibleReports = reports.filter((report) => (filter === "All" || report.status === filter) && `${report.title} ${report.location} ${report.campus}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="staff-mobile">
    <header className="staff-mobile-header"><button className="icon-button" onClick={staff ? () => setStaff(null) : onExit} aria-label={staff ? "Choose staff member" : "Back to visitor"}><Icon name="back" /></button><Logo /><span className="staff-campus">{staff?.name || "North Campus"}</span></header>
    <main className="staff-mobile-content">
      {!staff ? <section className="staff-login"><p className="eyebrow">CAMPUS FACILITIES</p><h1>Who’s on duty?</h1><p>Choose your staff profile to open the campus dashboard.</p><div className="staff-choices">{staffMembers.map((person) => <button className="staff-choice" key={person.name} onClick={() => { setError(""); setSelected(null); setStaff(person); }}><span className="staff-initials">{person.initials}</span><span><b>{person.name}</b><small>{person.role}</small><small>{person.team}</small></span><Icon name="chevron" /></button>)}</div></section> : selected ? <>
        <button className="back-link" onClick={() => setSelected(null)}><Icon name="back" />All reports</button>
        <div className="staff-report-photo"><img src={selected.image_url} alt="Photo submitted with report" /></div><Chip tone="received">{selected.status}</Chip><h1 className="staff-report-title">{selected.title}</h1><p className="staff-report-description">{selected.description}</p>
        <div className="mini-location"><Icon name="location" /><span><b>{selected.campus}</b>{selected.location}</span></div><p className="eyebrow staff-ai">{selected.category} · {selected.priority} priority</p>
        <div className="staff-status-actions">{selected.status === "Received" && <Button onClick={() => void update("Assigned")}>Assign to facilities</Button>}{selected.status === "Assigned" && <Button onClick={() => void update("In progress")}>Start work</Button>}{selected.status === "In progress" && <Button onClick={() => void update("Resolved")}>Mark resolved</Button>}{selected.status === "Resolved" && <div className="resolved-summary"><span><Icon name="check" /></span><b>This campus issue is resolved.</b></div>}</div>
      </> : <><p className="eyebrow">FACILITIES OPERATIONS · {staff.team.toUpperCase()}</p><h1 className="staff-mobile-title">Campus reports</h1><p className="staff-mobile-subtitle">Welcome, {staff.name.split(" ")[0]}. Here’s what needs attention around campus.</p><div className="staff-stat-grid"><div className="staff-stat-card"><small>Open reports</small><b>{openCount}</b><span>Need attention</span></div><div className="staff-stat-card"><small>In progress</small><b>{inProgressCount}</b><span>Being handled</span></div><div className="staff-stat-card"><small>Resolved</small><b>{resolvedCount}</b><span>Completed</span></div><div className="staff-stat-card"><small>All reports</small><b>{reports.length}</b><span>Campus total</span></div></div><div className="staff-list-heading-row"><h2 className="staff-list-heading">Recent reports</h2><button onClick={() => void load()} aria-label="Refresh reports"><Icon name="clock" size={17} /></button></div><input className="staff-search" aria-label="Search reports" placeholder="Search reports or locations" value={query} onChange={(event) => setQuery(event.target.value)} /><div className="staff-filters">{["All", "Received", "Assigned", "In progress", "Resolved"].map((status) => <button className={filter === status ? "active" : ""} key={status} onClick={() => setFilter(status)}>{status}</button>)}</div>{visibleReports.length ? visibleReports.map((report) => <button className="staff-report-row" key={report.id} onClick={() => setSelected(report)}><img src={report.image_url} alt="" /><span><b>{report.title}</b><small>{report.campus} · {report.location}</small><span className="staff-row-meta"><Chip tone={report.status === "In progress" ? "progress" : report.status === "Resolved" ? "resolved" : report.status === "Assigned" ? "assigned" : "received"}>{report.status}</Chip><small>{report.priority} priority</small></span></span><Icon name="chevron" /></button>) : <div className="staff-empty"><Icon name={error ? "warning" : "check"} /><b>{error ? "Couldn’t load reports" : "No reports match"}</b><span>{error ? "Check SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local, then retry." : "Try another search or status filter."}</span>{error && <button onClick={() => void load()}>Try again</button>}</div>}</>}
      {error && selected && <p className="capture-error" role="alert">{error}</p>}
    </main>
  </div>;
}

function Dashboard({ openDetail }: { openDetail: () => void }) {
  const stats = [["Open reports", "12", "+3 today", "list"], ["In progress", "5", "2 assigned to you", "clock"], ["Resolved today", "18", "87% within target", "check"], ["Past target", "2", "Needs attention", "warning"]] as const;
  return (
    <main className="dashboard">
      <div className="dashboard-title"><div><p className="eyebrow">SAMPLE FACILITY · DEMO DATA</p><h1>Good morning, Alex</h1><p>Here’s what needs attention across your facilities.</p></div><Button icon="plus">New report</Button></div>
      <div className="stat-grid">
        {stats.map((s, i) => <div className={`stat-card stat-${i}`} key={s[0]}><span><Icon name={s[3]} /></span><small>{s[0]}</small><b>{s[1]}</b><p>{s[2]}</p></div>)}
      </div>
      <section className="reports-card">
        <div className="table-tools"><div><h2>Active reports</h2><span>12 open across 3 facilities</span></div><div><button><Icon name="search" size={18} />Search</button><button>All facilities <Icon name="chevron" size={15} /></button><button>All statuses <Icon name="chevron" size={15} /></button></div></div>
        <div className="report-table">
          <div className="table-row table-head"><span>Issue</span><span>Priority</span><span>Received</span><span>Status</span><span>Response target</span><span /></div>
          {reports.map((r, i) => <button className={`table-row ${r.tone === "past" ? "past-row" : ""}`} key={r.title} onClick={i === 0 ? openDetail : undefined}>
            <span className="issue-cell">{i === 0 ? <img src={PHOTO} alt="" /> : <span className="issue-icon"><Icon name={i === 2 ? "warning" : "file"} /></span>}<span><b>{r.title}</b><small>{r.place}</small></span></span>
            <span><Chip tone={r.priority.toLowerCase()}>{r.priority}</Chip></span><span>{r.time}</span><span><Chip tone={r.tone}>{r.status}</Chip></span>
            <span className={r.tone === "past" ? "past-text" : ""}>{r.tone === "past" && <Icon name="warning" size={15} />}{r.target}</span><span><Icon name="chevron" size={17} /></span>
          </button>)}
        </div>
        <div className="table-footer">Showing 5 of 12 reports <button>View all reports <Icon name="arrow" size={16} /></button></div>
      </section>
    </main>
  );
}

function ReportDetail({ status, setStatus, back }: { status: string; setStatus: (s: string) => void; back: () => void }) {
  const resolved = status === "Resolved";
  const statusTone = status === "Received" ? "received" : status === "Assigned" ? "assigned" : resolved ? "resolved" : "progress";
  return (
    <main className="detail-page">
      <button className="back-link" onClick={back}><Icon name="back" size={17} />Back to reports</button>
      <div className="detail-title"><div><div className="detail-meta"><span>REPORT #CS-1048</span><Chip tone={statusTone}>{status}</Chip></div><h1>Restroom needs cleaning</h1><p><Icon name="location" size={16} />Central Library · Ground floor · Public restroom</p></div><div className="detail-actions">{status === "Received" && <Button variant="secondary" onClick={() => setStatus("Assigned")}>Assign report</Button>}{status === "Assigned" && <Button icon="check" onClick={() => setStatus("In progress")}>Start work</Button>}{status === "In progress" && <Button icon="check" onClick={() => setStatus("Resolved")}>Mark resolved</Button>}</div></div>
      <div className="detail-grid">
        <div className="detail-left">
          <div className="large-photo"><img src={PHOTO} alt="Reported public restroom sink area" /><span>Photo submitted by visitor</span></div>
          <section className="detail-card"><h2>Report details</h2><p>The ground-floor public restroom needs attention. The floor and sink area appear dirty.</p><div className="suggestion-row"><div><small><Icon name="sparkle" size={14} />AI-SUGGESTED CATEGORY</small><Chip tone="teal">Cleaning</Chip></div><div><small><Icon name="sparkle" size={14} />AI-SUGGESTED PRIORITY</small><Chip tone="standard">Standard</Chip></div></div><div className="info-grid"><div><small>RECEIVED</small><b>Today, 10:42 AM</b></div><div><small>RESPONSE TARGET</small><b>Within 30 minutes</b></div></div></section>
          <section className="detail-card"><h2>Staff updates</h2><textarea className="textarea" placeholder="Add a note for the visitor or your team…" /><div className="note-actions"><button><Icon name="camera" size={17} />Attach photo</button><Button variant="secondary">Post update</Button></div></section>
        </div>
        <aside className="detail-right">
          <section className="detail-card"><h2>Assignment</h2><label>ASSIGNED TEAM</label><button className="select-control"><span className="team-symbol"><Icon name="team" /></span><span><b>{status === "Received" ? "Cleaning team" : "Jamie R."}</b><small>{status === "Received" ? "3 members available" : "Cleaning team"}</small></span><Icon name="chevron" /></button><label>STATUS</label><div className="status-stack">{["Received", "Assigned", "In progress", "Resolved"].map((s, i) => { const currentStep = ["Received", "Assigned", "In progress", "Resolved"].indexOf(status); return <div className={i <= currentStep ? "active" : ""} key={s}><span>{i < currentStep ? <Icon name="check" size={13} /> : i + 1}</span><b>{s}</b></div>; })}</div></section>
          <section className="target-card"><div><Icon name="clock" /><span><small>RESPONSE TARGET</small><b>{resolved ? "Completed in 30 min" : "22 minutes remaining"}</b></span></div><p>{resolved ? "Resolved within the facility target." : "Target: First response within 30 minutes."}</p></section>
          {resolved && <section className="resolved-summary"><span><Icon name="check" /></span><div><b>Report marked resolved</b><p>The visitor has been notified and can confirm the fix.</p></div></section>}
        </aside>
      </div>
    </main>
  );
}

export default function App() {
  const [mode, setMode] = useState<"visitor" | "staff">("visitor");
  const [page, setPage] = useState("home");
  const [detail, setDetail] = useState(false);
  const [issue, setIssue] = useState<CapturedIssue | null>(null);
  const [draft, setDraftState] = useState<DraftData | null>(null);
  const [saved, setSaved] = useState<SavedReport | null>(() => { try { const raw = localStorage.getItem("civicsnap_last_report"); return raw ? JSON.parse(raw) as SavedReport : null; } catch { return null; } });
  const [campus, setCampus] = useState("North Campus");
  const [location, setLocation] = useState(campusPlaces["North Campus"][0]);
  const setDraft = useCallback((value: DraftData | null) => setDraftState(value), []);
  const submitReport = useCallback(async () => {
    if (!issue || !draft) throw new Error("Report photo or draft is missing.");
    const form = new FormData(); form.append("image", issue.image); form.append("title", draft.title); form.append("description", draft.description); form.append("category", draft.category); form.append("priority", draft.priority); form.append("campus", issue.campus); form.append("location", issue.location); form.append("transcript", draft.transcript);
    const response = await fetch("/api/reports", { method: "POST", body: form }); const data = await readApiResponse(response);
    const completeReport = { ...data.report, tracking_token: data.trackingToken } as SavedReport;
    localStorage.setItem("civicsnap_last_report", JSON.stringify(completeReport));
    setSaved(completeReport);
  }, [issue, draft]);
  const pages: Record<string, React.ReactNode> = {
    home: <HomeScreen go={setPage} campus={campus} location={location} setCampus={setCampus} setLocation={setLocation} />, details: <DetailsScreen go={setPage} campus={campus} location={location} setCampus={setCampus} setLocation={setLocation} onReady={(value) => { setIssue(value); setDraftState(null); }} />,
    draft: <DraftScreen go={setPage} issue={issue} draft={draft} setDraft={setDraft} onSubmit={submitReport} />, submitted: <SubmittedScreen go={setPage} report={saved} />, tracking: <TrackingScreen go={setPage} report={saved} />,
  };
  return (
    <div className="visitor-shell">
      <div className="prototype-bar"><div><span className="prototype-dot" />Campus care, made easier</div><div className="mode-toggle"><button className={mode === "visitor" ? "active" : ""} onClick={() => setMode("visitor")}>Visitor</button><button className={mode === "staff" ? "active" : ""} onClick={() => setMode("staff")}>Staff</button></div></div>
      <div className="phone-frame">{mode === "staff" ? <StaffMobile onExit={() => setMode("visitor")} /> : pages[page]}</div>
      <aside className="demo-panel"><Logo /><p className="eyebrow">END-TO-END DEMO</p><h2>A faster way to care for shared spaces.</h2><p>Report in under a minute. AI helps with the details, while people stay in control.</p><div className="demo-steps">{["Report the issue", "Review the AI draft", "Follow the response"].map((s, i) => <button key={s} className={page === ["details", "draft", "tracking"][i] ? "active" : ""} onClick={() => { setMode("visitor"); setPage(["details", "draft", "tracking"][i]); }}><span>0{i + 1}</span>{s}<Icon name="arrow" size={17} /></button>)}</div><button className="staff-preview" onClick={() => setMode("staff")}><span><Icon name="building" /></span><span><b>Explore staff operations</b><small>Assignment, targets, and resolution</small></span><Icon name="arrow" /></button></aside>
    </div>
  );
}
