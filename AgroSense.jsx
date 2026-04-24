import { useState, useRef, useEffect } from "react";

const C = {
  bg: "#0b1a09", surf: "#121f10", card: "#182816", card2: "#1d3018",
  border: "#263f24", primary: "#5db84a", primDim: "rgba(93,184,74,0.15)",
  accent: "#e8a334", accDim: "rgba(232,163,52,0.15)",
  danger: "#e05040", danDim: "rgba(224,80,64,0.15)",
  blue: "#4090e0", bluDim: "rgba(64,144,224,0.15)",
  text: "#ddebd0", muted: "#7a9e70", faint: "#486840",
};

const sevColor = (s) =>
  s === "High" ? C.danger : s === "Medium" ? C.accent : s === "Low" ? "#f0c040" : C.primary;

const plantEmoji = (plant = "") => {
  const p = plant.toLowerCase();
  if (p.includes("tomato")) return "🍅";
  if (p.includes("wheat")) return "🌾";
  if (p.includes("potato")) return "🥔";
  if (p.includes("corn") || p.includes("maize")) return "🌽";
  if (p.includes("rice")) return "🌾";
  if (p.includes("cotton")) return "🌿";
  return "🌱";
};

const FALLBACK = {
  plant: "Tomato", disease: "Early Blight", scientificName: "Alternaria solani",
  confidence: 91, severity: "High",
  description: "Active infection detected. Concentric ring lesions on lower leaves with yellow halos. Without treatment, 40–60% yield loss expected within 2 weeks.",
  treatment: "Apply Mancozeb 75 WP @ 2.5 g/L foliar spray every 7 days for 3 weeks. Remove and destroy infected leaves. Ensure adequate plant spacing for air circulation.",
  alternatives: [{ name: "Septoria Leaf Spot", confidence: 6 }, { name: "Late Blight", confidence: 3 }],
  nitrogenNote: "Low nitrogen (42 kg/ha) is weakening plant immunity."
};

const SAMPLE_FALLBACKS = {
  "tomato plant": { plant: "Tomato", disease: "Early Blight", scientificName: "Alternaria solani", confidence: 91, severity: "High", description: "Active infection with angular lesions surrounded by yellow halos on lower leaves. Fungal pathogen spreads rapidly in humid conditions.", treatment: "Apply Mancozeb 75 WP @ 2.5 g/L every 7 days for 3 weeks. Remove infected lower leaves immediately.", alternatives: [{ name: "Septoria Leaf Spot", confidence: 6 }, { name: "Late Blight", confidence: 3 }], nitrogenNote: "Low nitrogen may increase susceptibility." },
  "wheat plant": { plant: "Wheat", disease: "Powdery Mildew", scientificName: "Blumeria graminis", confidence: 87, severity: "Medium", description: "White powdery fungal growth visible on leaf surface and stems. Reduces photosynthesis and overall grain fill.", treatment: "Apply Propiconazole 25 EC @ 1 ml/L. Improve air circulation by adjusting plant density.", alternatives: [{ name: "Yellow Rust", confidence: 9 }, { name: "Leaf Blight", confidence: 4 }], nitrogenNote: null },
  "potato plant": { plant: "Potato", disease: "Healthy", scientificName: null, confidence: 96, severity: "Healthy", description: "Leaf appears healthy with no visible disease symptoms or nutrient deficiencies. Good canopy color and structure.", treatment: "Continue current management. Monitor weekly. Maintain adequate irrigation and fertilisation.", alternatives: [{ name: "Early Blight", confidence: 3 }, { name: "Nutrient Deficiency", confidence: 1 }], nitrogenNote: null },
  "corn plant": { plant: "Corn", disease: "Northern Leaf Blight", scientificName: "Exserohilum turcicum", confidence: 83, severity: "Medium", description: "Elongated grayish-green to tan lesions parallel to leaf margins. Lesions can coalesce causing significant leaf death.", treatment: "Apply Azoxystrobin + Propiconazole fungicide. Rotate with non-host crops next season.", alternatives: [{ name: "Gray Leaf Spot", confidence: 11 }, { name: "Common Rust", confidence: 6 }], nitrogenNote: "Adequate nitrogen improves disease resistance." },
};

const ANALYSIS_STEPS = [
  "Preprocessing image…",
  "Running EfficientNet-B4…",
  "Classifying 150+ disease classes…",
  "Generating treatment plan…",
];

const RECENT_SCANS = [
  { plant: "Tomato", disease: "Early Blight", field: "Field 3", time: "Today, 7:42 AM", sev: "High", emoji: "🍅" },
  { plant: "Wheat", disease: "Powdery Mildew", field: "Field 1", time: "Yesterday", sev: "Medium", emoji: "🌾" },
  { plant: "Potato", disease: "Healthy", field: "Field 2", time: "2 days ago", sev: "Healthy", emoji: "🥔" },
];

const TRANSLATIONS = {
  en: { greeting: "Good Morning, Farmer", tagline: "Diagnose any crop disease in seconds", scanNow: "Scan Leaf Now", upload: "Upload from Gallery", home: "Home", scan: "Scan", soil: "Soil", profile: "Profile", analyzing: "Analyzing Leaf", recentScans: "Recent Scans", viewAll: "View all →", scanLeaf: "Scan Leaf", diagResult: "Diagnosis Result", soilCard: "Soil Health Card" },
  hi: { greeting: "सुप्रभात, किसान", tagline: "कुछ सेकंड में फसल रोग की पहचान करें", scanNow: "पत्ती स्कैन करें", upload: "गैलरी से अपलोड", home: "होम", scan: "स्कैन", soil: "मिट्टी", profile: "प्रोफ़ाइल", analyzing: "पत्ती का विश्लेषण", recentScans: "हालिया स्कैन", viewAll: "सभी देखें →", scanLeaf: "पत्ती स्कैन", diagResult: "निदान परिणाम", soilCard: "मिट्टी स्वास्थ्य कार्ड" },
};

export default function AgroSense() {
  const [screen, setScreen] = useState("home");
  const [lang, setLang] = useState("en");
  const [diagResult, setDiagResult] = useState(null);
  const [aStep, setAStep] = useState(0);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);
  const t = TRANSLATIONS[lang];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const go = (s) => setScreen(s);

  const runAnalysis = async (base64, mediaType, sampleKey) => {
    go("analyzing");
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setAStep(i);
      await new Promise((r) => setTimeout(r, 750));
    }
    try {
      let messages;
      const prompt = `You are an expert plant pathologist AI assistant. ${base64 ? "Analyze this leaf image" : `Simulate a diagnosis for a ${sampleKey}`} and provide a disease diagnosis. Respond ONLY with valid JSON, no markdown, no backticks, no preamble:\n{"plant":"plant common name","disease":"disease name or Healthy","scientificName":"scientific name or null","confidence":91,"severity":"High or Medium or Low or Healthy","description":"2-3 sentences about the condition and impact","treatment":"specific actionable treatment steps with product names and dosages","alternatives":[{"name":"alternative diagnosis","confidence":7},{"name":"another possibility","confidence":2}],"nitrogenNote":"nutrient observation if applicable or null"}`;

      if (base64) {
        messages = [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: base64 } }, { type: "text", text: prompt }] }];
      } else {
        messages = [{ role: "user", content: prompt }];
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages }),
      });
      const data = await res.json();
      const text = data.content.filter((c) => c.type === "text").map((c) => c.text).join("");
      const cleaned = text.replace(/```json|```/g, "").trim();
      setDiagResult(JSON.parse(cleaned));
      showToast("Diagnosis complete");
    } catch {
      setDiagResult(sampleKey ? (SAMPLE_FALLBACKS[sampleKey] || FALLBACK) : FALLBACK);
      showToast("Analysis complete (demo data)", "info");
    }
    go("results");
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      runAnalysis(dataUrl.split(",")[1], file.type, null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    .root{font-family:'DM Sans',sans-serif;color:${C.text};background:${C.bg};min-height:100vh;max-width:430px;margin:0 auto;position:relative;overflow-x:hidden}
    .screen{min-height:100vh;padding-bottom:88px;animation:slideUp .32s cubic-bezier(.34,1.1,.64,1)}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(93,184,74,.45)}50%{box-shadow:0 0 0 14px rgba(93,184,74,0)}}
    @keyframes ring{0%{transform:scale(.85);opacity:.7}100%{transform:scale(2.1);opacity:0}}
    @keyframes dot{0%,80%,100%{transform:scale(.55);opacity:.25}40%{transform:scale(1);opacity:1}}
    @keyframes fill{from{width:0}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    .pulse-btn{animation:pulse 2.2s infinite}
    .ring{position:absolute;border-radius:50%;border:2px solid ${C.primary};animation:ring 2s infinite;pointer-events:none}
    .ring2{animation-delay:.7s}
    .dot{width:10px;height:10px;border-radius:50%;background:${C.primary};display:inline-block;animation:dot 1.4s infinite}
    .dot2{animation-delay:.22s}.dot3{animation-delay:.44s}
    .conf-fill{animation:fill 1.1s cubic-bezier(.34,1.1,.64,1) forwards}
    .bar-fill{transition:width 1.3s cubic-bezier(.34,1.1,.64,1)}
    .tap{cursor:pointer;transition:transform .15s,opacity .15s}
    .tap:active{transform:scale(.97);opacity:.85}
    .shimmer{background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);background-size:200% 100%;animation:shimmer 1.6s infinite}
    .toast{animation:fadeIn .3s ease}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
  `;

  const Nav = () => {
    const items = [
      { id: "home", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>, label: t.home },
      { id: "scan", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><circle cx="11" cy="11" r="3"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, label: t.scan },
      { id: "soil", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>, label: t.soil },
      { id: "profile", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: t.profile },
    ];
    return (
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: `${C.surf}f0`, backdropFilter: "blur(24px)", borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 200 }}>
        {items.map((item) => {
          const active = screen === item.id;
          return (
            <button key={item.id} className="tap" onClick={() => go(item.id)}
              style={{ flex: 1, padding: "12px 0 10px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: active ? C.primary : C.faint, transition: "color .2s" }}>
              {item.svg}
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: "0.02em" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // ─── HOME ────────────────────────────────────────────────────────────────
  const HomeScreen = () => (
    <div className="screen" style={{ padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 52, paddingBottom: 4 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Live IoT Active · 28°C</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, lineHeight: 1.15 }}>{t.greeting}</h1>
        </div>
        <button className="tap" onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 14px", color: C.text, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans'", marginTop: 2, flexShrink: 0 }}>
          {lang === "en" ? "🌐 EN" : "🌐 HI"}
        </button>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(145deg, #1a3418 0%, #0d2810 100%)`, borderRadius: 24, padding: 22, margin: "16px 0 14px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: C.primDim, filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: 0, bottom: 0, width: 100, height: 80, background: "rgba(93,184,74,0.06)", filter: "blur(20px)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 25, fontWeight: 900, lineHeight: 1.1, marginBottom: 18, position: "relative" }}>
          {t.tagline.replace("crop disease", "").split("").length > 0 && (
            <>
              {lang === "en" ? (<>Diagnose any <em style={{ color: C.primary, fontStyle: "italic" }}>crop disease</em> in seconds</>) : t.tagline}
            </>
          )}
        </h2>
        <div style={{ display: "flex", gap: 10, position: "relative" }}>
          <button className="pulse-btn tap" onClick={() => go("scan")}
            style={{ flex: 1, background: C.primary, border: "none", borderRadius: 14, padding: "14px 12px", color: "#0b1a09", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans'" }}>
            🔬 {t.scanNow}
          </button>
          <button className="tap" onClick={() => fileRef.current?.click()}
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 12px", color: C.text, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans'" }}>
            🖼 {t.upload}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[{ label: "Scans this week", value: "23", icon: "🔬", col: C.primary }, { label: "Active alerts", value: "4", icon: "⚠️", col: C.accent }].map((s) => (
          <div key={s.label} style={{ background: C.card, borderRadius: 18, padding: "16px 16px 14px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 800, color: s.col, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Scans */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 600 }}>{t.recentScans}</h3>
          <span style={{ fontSize: 12, color: C.primary, cursor: "pointer" }}>{t.viewAll}</span>
        </div>
        {RECENT_SCANS.map((s, i) => (
          <div key={i} className="tap" onClick={() => { setDiagResult(null); go("results"); }}
            style={{ background: C.card, borderRadius: 16, padding: "13px 14px", marginBottom: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: C.card2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.plant} — {s.disease}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.time} · {s.field}</div>
            </div>
            <div style={{ background: sevColor(s.sev) + "22", color: sevColor(s.sev), padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{s.sev}</div>
          </div>
        ))}
      </div>

      <input type="file" ref={fileRef} accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
      <Nav />
    </div>
  );

  // ─── SCAN ────────────────────────────────────────────────────────────────
  const ScanScreen = () => (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "52px 20px 14px" }}>
        <button className="tap" onClick={() => go("home")} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 13px", color: C.text, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>‹</button>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 21, fontWeight: 700 }}>{t.scanLeaf}</h2>
        <div style={{ marginLeft: "auto", fontSize: 18, cursor: "pointer" }}>⚙️</div>
      </div>

      {/* Viewfinder */}
      <div style={{ margin: "0 20px", borderRadius: 22, background: C.card, border: `1px solid ${C.border}`, height: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(93,184,74,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", width: 26, height: 26,
            top: i < 2 ? 16 : undefined, bottom: i >= 2 ? 16 : undefined,
            left: i % 2 === 0 ? 16 : undefined, right: i % 2 === 1 ? 16 : undefined,
            borderTop: i < 2 ? `2.5px solid ${C.primary}` : "none",
            borderBottom: i >= 2 ? `2.5px solid ${C.primary}` : "none",
            borderLeft: i % 2 === 0 ? `2.5px solid ${C.primary}` : "none",
            borderRight: i % 2 === 1 ? `2.5px solid ${C.primary}` : "none",
          }} />
        ))}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72 }}>
          <div className="ring" style={{ width: 72, height: 72, top: 0, left: 0 }} />
          <div className="ring ring2" style={{ width: 72, height: 72, top: 0, left: 0 }} />
          <span style={{ fontSize: 36 }}>📷</span>
        </div>
        <div style={{ marginTop: 14, textAlign: "center", padding: "0 40px" }}>
          <div style={{ fontSize: 14, color: C.muted }}>Point camera at a leaf</div>
          <div style={{ fontSize: 12, color: C.faint, marginTop: 3 }}>Hold steady for best results</div>
        </div>
        <div style={{ position: "absolute", bottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
          <div className="dot" style={{ width: 7, height: 7 }} />
          <span style={{ fontSize: 12, color: C.primary }}>Ready to scan</span>
          <div className="dot dot2" style={{ width: 7, height: 7 }} />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, padding: "16px 20px" }}>
        <button className="pulse-btn tap" onClick={() => fileRef.current?.click()}
          style={{ flex: 1, background: C.primary, border: "none", borderRadius: 16, padding: "16px 12px", color: "#0b1a09", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans'", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span>Scan Now</span>
        </button>
        <button className="tap" onClick={() => fileRef.current?.click()}
          style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 12px", color: C.text, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans'", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 22 }}>🖼</span>
          <span style={{ fontSize: 13 }}>Gallery</span>
        </button>
      </div>

      {/* Samples */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, letterSpacing: "0.04em" }}>Try with sample images</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 9 }}>
          {[
            { key: "tomato plant", emoji: "🍅", label: "Tomato" },
            { key: "wheat plant", emoji: "🌾", label: "Wheat" },
            { key: "potato plant", emoji: "🥔", label: "Potato" },
            { key: "corn plant", emoji: "🌽", label: "Corn" },
          ].map((s) => (
            <button key={s.key} className="tap" onClick={() => runAnalysis(null, null, s.key)}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 26 }}>{s.emoji}</span>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Sans'" }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <input type="file" ref={fileRef} accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
      <Nav />
    </div>
  );

  // ─── ANALYZING ───────────────────────────────────────────────────────────
  const AnalyzingScreen = () => (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: C.bg }}>
      <div style={{ position: "relative", width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
        <div className="ring" style={{ width: 96, height: 96, top: 0, left: 0 }} />
        <div className="ring ring2" style={{ width: 96, height: 96, top: 0, left: 0 }} />
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.primDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>🔬</div>
      </div>
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, marginBottom: 6, textAlign: "center" }}>{t.analyzing}</h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 36, textAlign: "center" }}>Deep learning model running</p>
      <div style={{ width: "100%", maxWidth: 290 }}>
        {ANALYSIS_STEPS.map((s, i) => {
          const done = i < aStep;
          const active = i === aStep;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, opacity: i <= aStep ? 1 : 0.3, transition: "opacity .5s" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: done ? C.primary : active ? C.primDim : C.card, border: `2px solid ${i <= aStep ? C.primary : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, transition: "all .4s", color: "#0b1a09" }}>
                {done ? "✓" : ""}
                {active && <div className="dot" style={{ width: 8, height: 8 }} />}
              </div>
              <span style={{ fontSize: 13, color: active ? C.text : C.muted }}>{s}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 28, display: "flex", gap: 9 }}>
        <div className="dot" /><div className="dot dot2" /><div className="dot dot3" />
      </div>
    </div>
  );

  // ─── RESULTS ─────────────────────────────────────────────────────────────
  const ResultsScreen = () => {
    const r = diagResult || FALLBACK;
    const sc = sevColor(r.severity);
    const allAlts = [{ name: r.disease, confidence: r.confidence }, ...(r.alternatives || [])];
    return (
      <div className="screen" style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "52px 0 16px" }}>
          <button className="tap" onClick={() => go("scan")} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 13px", color: C.text, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>‹</button>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 21, fontWeight: 700 }}>{t.diagResult}</h2>
          <button style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, padding: 4 }}>📤</button>
        </div>

        {/* Disease card */}
        <div style={{ background: C.card, borderRadius: 20, padding: 18, marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 58, height: 58, borderRadius: 14, background: C.card2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>{plantEmoji(r.plant)}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 21, fontWeight: 800, lineHeight: 1.1 }}>{r.disease}</h3>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{r.plant}{r.scientificName ? ` · ${r.scientificName}` : ""}</div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>Confidence</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.primary }}>{r.confidence}%</span>
                </div>
                <div style={{ height: 5, background: C.card2, borderRadius: 3, overflow: "hidden" }}>
                  <div className="conf-fill" style={{ height: "100%", width: `${r.confidence}%`, background: C.primary, borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Severity */}
        <div style={{ background: sc + "18", border: `1px solid ${sc}35`, borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>{r.severity === "High" ? "⚠️" : r.severity === "Healthy" ? "✅" : "⚡"}</span>
            <span style={{ fontWeight: 700, color: sc, fontSize: 14 }}>{r.severity} Risk</span>
          </div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{r.description}</p>
        </div>

        {/* Alternatives */}
        <div style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>🏆 Other Possibilities</div>
          {allAlts.slice(0, 3).map((alt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <span style={{ fontSize: 13, flex: 1, color: i === 0 ? C.text : C.muted, fontWeight: i === 0 ? 500 : 400 }}>{alt.name}</span>
              <span style={{ fontSize: 12, color: i === 0 ? C.primary : C.faint, minWidth: 32, textAlign: "right" }}>{alt.confidence}%</span>
              <div style={{ width: 72, height: 4, background: C.card2, borderRadius: 2, overflow: "hidden" }}>
                <div className="bar-fill" style={{ height: "100%", width: `${alt.confidence}%`, background: i === 0 ? C.primary : C.faint, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Treatment */}
        <div style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>💊 Treatment Plan</div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{r.treatment}</p>
        </div>

        {/* Soil link */}
        {r.nitrogenNote && (
          <div className="tap" onClick={() => go("soil")}
            style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, marginBottom: 3 }}>🌱 View Soil Health Card</div>
              <div style={{ fontSize: 12, color: C.muted }}>{r.nitrogenNote}</div>
            </div>
            <span style={{ color: C.faint, fontSize: 18 }}>›</span>
          </div>
        )}

        <Nav />
      </div>
    );
  };

  // ─── SOIL ─────────────────────────────────────────────────────────────────
  const SoilScreen = () => {
    const [barsVisible, setBarsVisible] = useState(false);
    useEffect(() => { const t = setTimeout(() => setBarsVisible(true), 100); return () => clearTimeout(t); }, []);
    const npk = [
      { label: "Nitrogen", value: 42, max: 100, unit: "kg/ha", status: "Low", col: C.danger },
      { label: "Phosphorus", value: 68, max: 100, unit: "kg/ha", status: "Medium", col: C.accent },
      { label: "Potassium", value: 112, max: 150, unit: "kg/ha", status: "Optimal", col: C.primary },
    ];
    return (
      <div className="screen" style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "52px 0 16px" }}>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 21, fontWeight: 700, flex: 1 }}>{t.soilCard}</h2>
          <button style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, padding: 4 }}>📤</button>
        </div>

        {/* Sensor header */}
        <div style={{ background: C.card, borderRadius: 16, padding: "14px 16px", marginBottom: 16, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Field 3 — Soil Intelligence</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>BLE Sensor · Plot ID: F3-N2</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
              <div className="dot" style={{ width: 7, height: 7 }} />
              <span style={{ fontSize: 11, color: C.primary }}>Live</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Updated 2 hrs ago</div>
          </div>
        </div>

        {/* NPK */}
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 10, letterSpacing: "0.07em", textTransform: "uppercase" }}>N · P · K — Macronutrients</div>
        {npk.map((n) => (
          <div key={n.label} style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{n.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: n.col }}>{n.value}</span>
                <span style={{ fontSize: 11, color: C.muted }}>{n.unit}</span>
                <span style={{ background: n.col + "22", color: n.col, padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{n.status}</span>
              </div>
            </div>
            <div style={{ height: 5, background: C.card2, borderRadius: 3, overflow: "hidden" }}>
              <div className="bar-fill" style={{ height: "100%", width: barsVisible ? `${(n.value / n.max) * 100}%` : "0%", background: n.col, borderRadius: 3 }} />
            </div>
          </div>
        ))}

        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, margin: "18px 0 10px", letterSpacing: "0.07em", textTransform: "uppercase" }}>📊 Environmental Parameters</div>

        {/* pH */}
        <div style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 8, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Soil pH</span>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: C.primary }}>6.4</span>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ height: 7, borderRadius: 4, background: `linear-gradient(90deg, #e05040 0%, #e8a334 35%, ${C.primary} 65%, #4090e0 100%)` }} />
            <div style={{ position: "absolute", top: -3, left: `${(6.4 / 14) * 100}%`, width: 13, height: 13, borderRadius: "50%", background: C.text, border: `2.5px solid ${C.bg}`, transform: "translateX(-50%)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
            <span style={{ fontSize: 10, color: C.faint }}>4.0 Acidic</span>
            <span style={{ fontSize: 10, color: C.faint }}>7.0 Neutral</span>
            <span style={{ fontSize: 10, color: C.faint }}>9.0 Alkaline</span>
          </div>
        </div>

        {/* Moisture */}
        <div style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 8, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Moisture</span>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: C.blue }}>58%</span>
          </div>
          <div style={{ height: 5, background: C.card2, borderRadius: 3, overflow: "hidden" }}>
            <div className="bar-fill" style={{ height: "100%", width: barsVisible ? "58%" : "0%", background: C.blue, borderRadius: 3 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: C.faint }}>Dry</span>
            <span style={{ fontSize: 10, color: C.primary }}>✓ Optimal</span>
            <span style={{ fontSize: 10, color: C.faint }}>Saturated</span>
          </div>
        </div>

        {/* Soil EC */}
        <div style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 8, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Soil EC</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: C.accent }}>1.8</span>
              <span style={{ fontSize: 11, color: C.muted }}>dS/m</span>
              <span style={{ background: C.accent + "22", color: C.accent, padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>Normal</span>
            </div>
          </div>
          <div style={{ height: 5, background: C.card2, borderRadius: 3, overflow: "hidden" }}>
            <div className="bar-fill" style={{ height: "100%", width: barsVisible ? "52%" : "0%", background: C.accent, borderRadius: 3 }} />
          </div>
        </div>

        {/* Temp + Humidity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          {[{ label: "Soil Temp", val: "28°C", icon: "🌡️", col: C.accent }, { label: "Humidity", val: "72%", icon: "💧", col: C.blue }].map((p) => (
            <div key={p.label} style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 26, marginBottom: 7 }}>{p.icon}</div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, color: p.col }}>{p.val}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <div style={{ background: `linear-gradient(145deg, #1d3018, #152a13)`, borderRadius: 16, padding: 16, marginBottom: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8 }}>🔗 AI Correlation Insight</div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>
            Low Nitrogen (42 kg/ha) is weakening plant immunity, making tomatoes significantly more vulnerable to Early Blight infection.
          </p>
          <div style={{ background: C.card, borderRadius: 12, padding: 12, fontSize: 12, color: C.text, lineHeight: 1.65 }}>
            <span style={{ color: C.accent, fontWeight: 600 }}>Recommended: </span>
            Apply Urea @ 25 kg/acre immediately + Mancozeb 75 WP @ 2.5 g/L every 7 days for 3 weeks.
          </div>
        </div>

        <button className="tap" style={{ width: "100%", background: "none", border: `1px solid ${C.primary}`, borderRadius: 16, padding: 15, color: C.primary, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'", marginBottom: 16 }}>
          📋 Generate Full Treatment Report
        </button>
        <Nav />
      </div>
    );
  };

  // ─── PROFILE ─────────────────────────────────────────────────────────────
  const ProfileScreen = () => (
    <div className="screen" style={{ padding: "0 20px" }}>
      <div style={{ paddingTop: 52, paddingBottom: 20 }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 21, fontWeight: 700 }}>{t.profile}</h2>
      </div>

      <div style={{ background: `linear-gradient(145deg, ${C.card2}, ${C.card})`, borderRadius: 20, padding: 20, marginBottom: 18, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 62, height: 62, borderRadius: "50%", background: C.primDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `2px solid ${C.primary}55`, flexShrink: 0 }}>👨‍🌾</div>
        <div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 19, fontWeight: 700 }}>Rajesh Kumar</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Haryana, India · 12 acres</div>
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            {[["🌾", "Wheat", C.primary], ["🍅", "Tomato", C.accent], ["🥔", "Potato", C.muted]].map(([e, l, c]) => (
              <span key={l} style={{ fontSize: 11, color: c }}>{e} {l}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
        {[{ label: "Total Scans", val: "147", icon: "🔬" }, { label: "Diseases Found", val: "23", icon: "⚠️" }, { label: "Fields", val: "4", icon: "🌿" }].map((s) => (
          <div key={s.label} style={{ background: C.card, borderRadius: 14, padding: "14px 10px", border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 5 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: C.primary }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {[
        { label: "Language", val: lang === "en" ? "English" : "हिंदी", icon: "🌐", action: () => setLang((l) => (l === "en" ? "hi" : "en")) },
        { label: "Notifications", val: "On", icon: "🔔" },
        { label: "IoT Device", val: "Connected", icon: "📡" },
        { label: "Export Data", val: "", icon: "📤" },
        { label: "Help & Support", val: "", icon: "💬" },
      ].map((item, i) => (
        <div key={i} className="tap" onClick={item.action}
          style={{ background: C.card, borderRadius: 14, padding: "13px 15px", marginBottom: 7, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{item.label}</span>
          {item.val && <span style={{ fontSize: 12, color: C.primary }}>{item.val}</span>}
          <span style={{ color: C.faint, fontSize: 16 }}>›</span>
        </div>
      ))}

      <div style={{ marginTop: 12, padding: "14px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 20, marginBottom: 6 }}>🌱</div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: C.primary }}>AgroSense</div>
        <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>v2.0.0 · Production</div>
      </div>

      <Nav />
    </div>
  );

  return (
    <div className="root">
      <style>{css}</style>

      {screen === "home" && <HomeScreen />}
      {screen === "scan" && <ScanScreen />}
      {screen === "analyzing" && <AnalyzingScreen />}
      {screen === "results" && <ResultsScreen />}
      {screen === "soil" && <SoilScreen />}
      {screen === "profile" && <ProfileScreen />}

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: toast.type === "success" ? C.primary : C.card, color: toast.type === "success" ? "#0b1a09" : C.text, padding: "10px 20px", borderRadius: 24, fontSize: 13, fontWeight: 600, zIndex: 999, border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
          {toast.type === "success" ? "✓ " : "ℹ "}{toast.msg}
        </div>
      )}
    </div>
  );
}
