import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_LOGO    = "https://wesendapps.com/LuxModernis/signature/IMG/luxmodernis-logo.jpg";
const DEFAULT_GIF     = "https://wesendapps.com/LuxModernis/signature/IMG/GIF-New_Website.gif";
const DEFAULT_LI_ICON = "https://wesendapps.com/LuxModernis/signature/IMG/icon-linkedin.svg";
const DEFAULT_IG_ICON = "https://wesendapps.com/LuxModernis/signature/IMG/icon-instagram.svg";
const SZ = 124;

const ROSE = "#EFA9A9"; const DARK = "#1C1C1C"; const GRAY = "#777";
const LIGHT = "#F8F6F3"; const BORDER = "#E8E4DF"; const WHITE = "#FFFFFF";

/* ─── Formatage ──────────────────────────────────────────────────────── */
function titleCase(str) {
  // Capitalise le 1er caractère de chaque mot (séparé par espace ou tiret)
  // Compatible avec les caractères accentués (é, è, à…) et les prénoms composés
  return (str || "").toLowerCase().replace(/(^|[\s-])(\S)/g, (_, sep, char) => sep + char.toUpperCase());
}
function upperCase(str) {
  return (str || "").toUpperCase();
}
// Formate un numéro : espace tous les 2 chiffres, ex: 06 85 26 37 21
function formatPhone(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

const blankTemplate = {
  id: null, name: "", logoUrl: DEFAULT_LOGO,
  showGif: false, gifUrl: DEFAULT_GIF, gifLinkUrl: "", gifWidth: 0,
  logoLinkUrl: "https://luxmodernis.com",
  showAddress: false, address: "",
  showWebsite: true, websiteLabel: "luxmodernis.com", websiteUrl: "https://luxmodernis.com",
  showLinkedin: true,  linkedinUrl: "https://fr.linkedin.com/company/lux-modernis",  liIconUrl: DEFAULT_LI_ICON,
  showInstagram: true, instagramUrl: "https://www.instagram.com/luxmodernis/?hl=fr", igIconUrl: DEFAULT_IG_ICON,
};

/* ─── HTML email ─────────────────────────────────────────────────────── */
function buildHTML(tpl, user) {
  const firstName = titleCase(user.firstName);
  const lastName  = upperCase(user.lastName);
  const fullName  = `${firstName} ${lastName}`.trim();
  const phone     = formatPhone(user.phone);
  const photoSrc  = user.showPhoto ? (user.photoUrl ? user.photoUrl + (user.photoUrl.includes("?") ? "&" : "?") + "v=" + Date.now() : "") : "";
  const hasPhoto  = !!photoSrc;
  const hasGif    = tpl.showGif && tpl.gifUrl;
  const liIcon    = tpl.liIconUrl || DEFAULT_LI_ICON;
  const igIcon    = tpl.igIconUrl || DEFAULT_IG_ICON;

  // Uniquement height="SZ" — Outlook calcule la largeur naturelle seul.
  // Aucun width sur les images = hauteur toujours exacte, proportions garanties.
  const logoImgTag = `<img src="${tpl.logoUrl}" height="${SZ}" alt="Logo" style="display:block;border:0;" />`;
  const logoCell   = tpl.logoLinkUrl ? `<a href="${tpl.logoLinkUrl}" style="display:block;line-height:0;">${logoImgTag}</a>` : logoImgTag;
  const gifImgTag  = `<img src="${tpl.gifUrl}"  height="${SZ}" alt=""     style="display:block;border:0;" />`;
  const gifCell    = tpl.gifLinkUrl  ? `<a href="${tpl.gifLinkUrl}"  style="display:block;line-height:0;">${gifImgTag}</a>`  : gifImgTag;

  const imageTable = `<table cellpadding="0" cellspacing="0" border="0"><tbody><tr>
  <td style="padding:0;vertical-align:top;line-height:0;">${logoCell}</td>${hasPhoto ? `
  <td style="padding:0;vertical-align:top;line-height:0;"><img src="${photoSrc}" height="${SZ}" alt="${fullName}" style="display:block;border:0;" /></td>` : ""}${hasGif ? `
  <td style="padding:0;vertical-align:top;line-height:0;">${gifCell}</td>` : ""}
</tr></tbody></table>`;

  const rows = [];
  if (fullName.trim())
    rows.push(`<tr><td style="padding:10px 0 0;font-family:Arial,sans-serif;font-size:14pt;font-weight:bold;color:#111;">${fullName}</td></tr>`);
  if (user.role)
    rows.push(`<tr><td style="padding:4px 0 0;font-family:Arial,sans-serif;font-size:10pt;font-weight:normal;color:#333;">${titleCase(user.role)}</td></tr>`);
  if (phone)
    rows.push(`<tr><td style="padding:3px 0 0;font-family:Arial,sans-serif;font-size:10pt;font-weight:bold;color:#111;">${phone}</td></tr>`);
  if (tpl.showAddress && tpl.address)
    rows.push(`<tr><td style="padding:3px 0 0;font-family:Arial,sans-serif;font-size:10pt;font-weight:normal;color:#555;">${tpl.address}</td></tr>`);
  if (tpl.showWebsite && tpl.websiteUrl)
    rows.push(`<tr><td style="padding:3px 0 0;"><a href="${tpl.websiteUrl}" style="font-family:Arial,sans-serif;font-size:10pt;color:#111;text-decoration:underline;">${tpl.websiteLabel || tpl.websiteUrl}</a></td></tr>`);
  const icons = [];
  if (tpl.showLinkedin  && tpl.linkedinUrl)  icons.push(`<a href="${tpl.linkedinUrl}"  style="display:inline-block;margin-right:6px;"><img src="${liIcon}" width="22" height="22" alt="LinkedIn"  style="display:block;border:0;" /></a>`);
  if (tpl.showInstagram && tpl.instagramUrl) icons.push(`<a href="${tpl.instagramUrl}" style="display:inline-block;"><img src="${igIcon}" width="22" height="22" alt="Instagram" style="display:block;border:0;" /></a>`);
  if (icons.length) rows.push(`<tr><td style="padding:10px 0 0;">${icons.join("")}</td></tr>`);

  const textTable = rows.length
    ? `<table cellpadding="0" cellspacing="0" border="0"><tbody>${rows.join("")}</tbody></table>`
    : "";

  return imageTable + textTable;
}

/* ─── Helpers styles ─────────────────────────────────────────────────── */
function gs(v) {
  const b = { border:"none", borderRadius:6, padding:"9px 18px", fontSize:12, cursor:"pointer", fontWeight:500, fontFamily:"inherit", transition:"opacity .15s" };
  if (v==="primary") return { ...b, background:ROSE, color:DARK };
  if (v==="dark")    return { ...b, background:DARK, color:WHITE };
  if (v==="ghost")   return { ...b, background:WHITE, color:DARK, border:`1px solid ${BORDER}` };
  if (v==="danger")  return { ...b, background:"transparent", color:"#c44", border:"1px solid #fcc", padding:"6px 10px" };
  return b;
}
const INP = { width:"100%", border:`1px solid ${BORDER}`, borderRadius:6, padding:"8px 11px", fontSize:13, color:DARK, outline:"none", background:WHITE, fontFamily:"inherit", boxSizing:"border-box" };

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", color:GRAY, marginBottom:5 }}>{label}</label>
      {hint && <p style={{ fontSize:10, color:"#bbb", margin:"0 0 5px", lineHeight:1.4 }}>{hint}</p>}
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", marginBottom: checked && children ? 10 : 0 }}>
        <div onClick={onChange} style={{ width:34, height:19, borderRadius:10, background:checked?ROSE:"#ddd", position:"relative", transition:"background .2s", flexShrink:0, cursor:"pointer" }}>
          <div style={{ position:"absolute", top:2.5, left:checked?15:2.5, width:14, height:14, borderRadius:7, background:WHITE, transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.18)" }} />
        </div>
        <span style={{ fontSize:12, color:DARK, fontWeight:500 }}>{label}</span>
      </label>
      {checked && children && <div style={{ paddingLeft:42 }}>{children}</div>}
    </div>
  );
}

function Flash({ msg, type }) {
  if (!msg) return null;
  const bg = type==="ok"?"#f0fff6":type==="warn"?"#fffbeb":"#fff5f5";
  const br = type==="ok"?"#a8e6be":type==="warn"?"#ffe082":"#fca5a5";
  return <div style={{ background:bg, border:`1px solid ${br}`, borderRadius:6, padding:"9px 14px", fontSize:12, color:DARK, marginBottom:16 }}>{msg}</div>;
}

function Nav({ onBack, title, step }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 28px", background:WHITE, borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
      <button onClick={onBack} style={{ ...gs("ghost"), padding:"7px 14px", flexShrink:0 }}>← Retour</button>
      <div>
        <div style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:20, fontWeight:600, color:DARK, lineHeight:1.2 }}>{title}</div>
        {step && <div style={{ fontSize:11, color:GRAY, marginTop:2 }}>{step}</div>}
      </div>
    </div>
  );
}

/* ─── Aperçu signature ───────────────────────────────────────────────── */
function SigPreview({ tpl, user, showPlaceholder=false }) {
  const photoSrc  = user.showPhoto ? (user.photoBase64 || user.photoUrl || "") : "";
  const hasPhoto  = !!photoSrc;
  const hasGif    = tpl.showGif && tpl.gifUrl;
  const firstName = titleCase(user.firstName);
  const lastName  = upperCase(user.lastName);
  const fullName  = `${firstName} ${lastName}`.trim();
  const phone     = formatPhone(user.phone);
  const liIcon    = tpl.liIconUrl || DEFAULT_LI_ICON;
  const igIcon    = tpl.igIconUrl || DEFAULT_IG_ICON;
  const hasIcons  = (tpl.showLinkedin && tpl.linkedinUrl) || (tpl.showInstagram && tpl.instagramUrl);

  return (
    <div style={{ fontFamily:"Arial, sans-serif" }}>
      {/* Ligne 1 — images jointives */}
      <div style={{ display:"flex", gap:0, lineHeight:0, marginBottom:0, overflow:"hidden" }}>
        {tpl.logoLinkUrl
          ? <a href={tpl.logoLinkUrl} target="_blank" rel="noreferrer" style={{display:"block",lineHeight:0,flexShrink:0}}><img src={tpl.logoUrl} alt="Logo" height={SZ} style={{display:"block",height:SZ,width:"auto"}} /></a>
          : <img src={tpl.logoUrl} alt="Logo" height={SZ} style={{display:"block",height:SZ,width:"auto",flexShrink:0}} />
        }
        {user.showPhoto && (
          photoSrc
            ? <img src={photoSrc} alt={fullName} height={SZ} style={{display:"block",height:SZ,width:"auto",flexShrink:0}}/>
            : showPlaceholder
              ? <div style={{width:SZ,height:SZ,flexShrink:0,background:"#ede9e4",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width={SZ*0.45} height={SZ*0.45} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="#b8b0a8"/>
                    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#b8b0a8" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              : null
        )}
        {hasGif && (
          tpl.gifLinkUrl
            ? <a href={tpl.gifLinkUrl} target="_blank" rel="noreferrer" style={{display:"block",lineHeight:0,flexShrink:0}}><img src={tpl.gifUrl} alt="" height={SZ} style={{display:"block",height:SZ,width:"auto"}} /></a>
            : <img src={tpl.gifUrl} alt="" height={SZ} style={{display:"block",height:SZ,width:"auto",flexShrink:0}} />
        )}
      </div>
      {/* Prénom NOM — Arial 14 bold */}
      {fullName.trim() && (
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:14, fontWeight:"bold", color:"#111", marginTop:10, marginBottom:0, lineHeight:1.3 }}>
          {fullName}
        </div>
      )}
      {/* Poste — Arial 10 regular */}
      {user.role && (
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:10, fontWeight:"normal", color:"#333", marginTop:4, lineHeight:1.4 }}>
          {user.role}
        </div>
      )}
      {/* Téléphone — Arial 10 bold, formaté */}
      {phone && (
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:10, fontWeight:"bold", color:"#111", marginTop:3, lineHeight:1.4 }}>
          {phone}
        </div>
      )}
      {/* Adresse */}
      {tpl.showAddress && tpl.address && (
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:10, fontWeight:"normal", color:"#555", marginTop:3, lineHeight:1.4 }}>
          {tpl.address}
        </div>
      )}
      {/* Site web — Arial 10 regular souligné */}
      {tpl.showWebsite && tpl.websiteUrl && (
        <div style={{ marginTop:3 }}>
          <a href={tpl.websiteUrl} style={{ fontFamily:"Arial,sans-serif", fontSize:10, fontWeight:"normal", color:"#111", textDecoration:"underline" }}>
            {tpl.websiteLabel || tpl.websiteUrl}
          </a>
        </div>
      )}
      {/* Ligne vide + icônes */}
      {hasIcons && (
        <>
          <div style={{ height:10 }} />
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {tpl.showLinkedin && tpl.linkedinUrl && (
              <a href={tpl.linkedinUrl} target="_blank" rel="noreferrer">
                <img src={liIcon} alt="LinkedIn" width={22} height={22} style={{ display:"block" }}
                  onError={e => { e.target.style.outline="2px solid #eee"; }} />
              </a>
            )}
            {tpl.showInstagram && tpl.instagramUrl && (
              <a href={tpl.instagramUrl} target="_blank" rel="noreferrer">
                <img src={igIcon} alt="Instagram" width={22} height={22} style={{ display:"block" }}
                  onError={e => { e.target.style.outline="2px solid #eee"; }} />
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Cropper ────────────────────────────────────────────────────────── */
function Cropper({ src, onConfirm, onCancel }) {
  const cvRef   = useRef(null);
  const imgRef  = useRef(null);
  const scaleRef = useRef(1);
  const dragRef = useRef(null);
  const [crop, setCrop]   = useState(null);
  const [ready, setReady] = useState(false);
  const MAX_W = 340, MAX_H = 400;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const sc = Math.min(MAX_W / img.naturalWidth, MAX_H / img.naturalHeight, 1);
      scaleRef.current = sc;
      const dw = img.naturalWidth * sc;
      const dh = img.naturalHeight * sc;
      const s  = Math.min(dw, dh) * 0.65;
      setCrop({ x:(dw-s)/2, y:(dh-s)/2, s });
      setReady(true);
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !crop || !cvRef.current) return;
    const sc = scaleRef.current;
    const cv = cvRef.current;
    const dw = Math.round(img.naturalWidth * sc);
    const dh = Math.round(img.naturalHeight * sc);
    cv.width = dw; cv.height = dh;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, 0, 0, dw, dh);
    ctx.fillStyle = "rgba(0,0,0,.52)";
    ctx.fillRect(0, 0, dw, dh);
    ctx.save();
    ctx.beginPath(); ctx.rect(crop.x, crop.y, crop.s, crop.s); ctx.clip();
    ctx.drawImage(img, 0, 0, dw, dh);
    ctx.restore();
    ctx.strokeStyle = ROSE; ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.s, crop.s);
    // Poignée coin bas-droit
    ctx.fillStyle = ROSE;
    ctx.fillRect(crop.x + crop.s - 14, crop.y + crop.s - 14, 14, 14);
    // Grille tiers
    ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.lineWidth = 1;
    [1/3, 2/3].forEach(r => {
      ctx.beginPath(); ctx.moveTo(crop.x + crop.s*r, crop.y); ctx.lineTo(crop.x + crop.s*r, crop.y + crop.s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(crop.x, crop.y + crop.s*r); ctx.lineTo(crop.x + crop.s, crop.y + crop.s*r); ctx.stroke();
    });
  }, [crop, ready]);

  const getXY = (e, cv) => {
    const r = cv.getBoundingClientRect();
    const cl = e.touches ? e.touches[0] : e;
    return { px: cl.clientX - r.left, py: cl.clientY - r.top };
  };

  const onDown = useCallback(e => {
    if (!crop || !cvRef.current) return;
    const { px, py } = getXY(e, cvRef.current);
    const { x, y, s } = crop;
    if (px > x+s-20 && px < x+s+4 && py > y+s-20 && py < y+s+4)
      dragRef.current = { mode:"resize", ox:px, oy:py, cs:s, cx:x, cy:y };
    else if (px > x && px < x+s && py > y && py < y+s)
      dragRef.current = { mode:"move", ox:px, oy:py, cx:x, cy:y, cs:s };
    e.preventDefault();
  }, [crop]);

  const onMove = useCallback(e => {
    const d = dragRef.current;
    if (!d || !imgRef.current) return;
    const img = imgRef.current, sc = scaleRef.current;
    const dw = Math.round(img.naturalWidth * sc);
    const dh = Math.round(img.naturalHeight * sc);
    const { px, py } = getXY(e, cvRef.current);
    if (d.mode === "move") {
      setCrop(c => ({
        ...c,
        x: Math.max(0, Math.min(dw - c.s, d.cx + px - d.ox)),
        y: Math.max(0, Math.min(dh - c.s, d.cy + py - d.oy))
      }));
    } else {
      const delta = Math.max(px - d.ox, py - d.oy);
      const ns = Math.max(40, Math.min(dw - d.cx, dh - d.cy, d.cs + delta));
      setCrop(c => ({ ...c, s: ns }));
    }
    e.preventDefault();
  }, []);

  const onUp = useCallback(() => { dragRef.current = null; }, []);

  const confirm = () => {
    const img = imgRef.current;
    if (!img || !crop) return;
    const sc = scaleRef.current;
    const out = document.createElement("canvas");
    const EXPORT = SZ * 2; // 2× pour les écrans Retina
    out.width = EXPORT; out.height = EXPORT;
    // On ramène les coords display → coords image originale
    out.getContext("2d").drawImage(img,
      crop.x / sc, crop.y / sc, crop.s / sc, crop.s / sc,
      0, 0, EXPORT, EXPORT
    );
    onConfirm(out.toDataURL("image/jpeg", .9));
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      <p style={{ margin:0, fontSize:11, color:GRAY, textAlign:"center" }}>
        Déplacez le cadre · tirez le coin rose pour redimensionner
      </p>
      {ready
        ? <canvas ref={cvRef}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
            style={{ maxWidth:"100%", cursor:"crosshair", borderRadius:4, touchAction:"none" }}/>
        : <div style={{ width:200, height:150, background:LIGHT, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", color:GRAY, fontSize:12 }}>Chargement…</div>
      }
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onCancel} style={gs("ghost")}>Annuler</button>
        <button onClick={confirm} disabled={!ready} style={{ ...gs("dark"), opacity: ready ? 1 : .5 }}>Valider le recadrage</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ HOME */
function HomeScreen({ onChoice }) {
  return (
    <div style={{ minHeight:"100vh", background:LIGHT, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      <img src={DEFAULT_LOGO} alt="LuxModernis" style={{ width:64, height:64, objectFit:"cover", borderRadius:6, marginBottom:28 }} onError={e=>e.target.style.display="none"} />
      <h1 style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:30, fontWeight:600, color:DARK, margin:"0 0 8px", textAlign:"center" }}>Signatures LuxModernis</h1>
      <p style={{ fontSize:14, color:GRAY, margin:"0 0 48px", textAlign:"center" }}>Que souhaitez-vous faire ?</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, width:"100%", maxWidth:600 }}>
        {[
          { key:"user",  emoji:"✍️", title:"Créer ma signature",  desc:"Choisissez un template et personnalisez vos informations." },
          { key:"admin", emoji:"⚙️", title:"Gérer les templates", desc:"Créez ou modifiez les templates pour toute l'équipe." },
        ].map(c => (
          <button key={c.key} onClick={() => onChoice(c.key)}
            style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:14, padding:"32px 26px", cursor:"pointer", textAlign:"left", transition:"box-shadow .2s,transform .15s", fontFamily:"inherit" }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 28px rgba(0,0,0,.09)";e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
            <div style={{ fontSize:32, marginBottom:16 }}>{c.emoji}</div>
            <div style={{ fontSize:16, fontWeight:600, color:DARK, marginBottom:8 }}>{c.title}</div>
            <div style={{ fontSize:12, color:GRAY, lineHeight:1.7 }}>{c.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}





/* ═══════════════════════════════════════════════════════════════════════ USER FLOW */
const blankUser = { firstName:"", lastName:"", role:"", phone:"", showPhoto:false, photoUrl:"", photoBase64:null };

async function uploadToServer(base64, firstName, lastName) {
  const first = (firstName || "").trim().charAt(0).toLowerCase();
  const last  = (lastName  || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  const filename = (first + last) || "portrait";
  const res = await fetch("/api/upload-portrait", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ imageData: base64, filename }),
  });
  if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.url.startsWith("http") ? data.url : window.location.origin + data.url;
}

function UploadButton({ user, set, flash }) {
  const [loading, setLoading] = useState(false);
  const upload = async () => {
    setLoading(true);
    try {
      const url = await uploadToServer(user.photoBase64, user.firstName, user.lastName);
      set("photoUrl", url);
      flash("✓ Portrait hébergé et URL ajoutée automatiquement !", "ok");
    } catch(e) {
      flash("Erreur upload : " + e.message, "err");
    } finally { setLoading(false); }
  };
  return (
    <button onClick={upload} disabled={loading}
      style={{...gs("dark"), width:"100%", opacity:loading ? .6 : 1, marginTop:8}}>
      {loading ? "Upload en cours…" : "⬆ Héberger ce portrait"}
    </button>
  );
}


function UserFlow({ templates, onBack }) {
  const [step,setStep]=useState("pick"); const [tpl,setTpl]=useState(null);
  const [user,setUser]=useState({...blankUser}); const [cropSrc,setCropSrc]=useState(null);
  const [msg,setMsg]=useState(""); const [msgType,setMsgType]=useState("ok");
  const [measuredGifW,setMeasuredGifW]=useState(0);
  const [existingPortrait,setExistingPortrait]=useState(null); // URL si portrait déjà hébergé
  const [profileKey,setProfileKey]=useState(""); // clé du profil (ex: bsandrez)
  const fileRef=useRef(null);

  // Mesure le GIF dès qu'un template est sélectionné
  useEffect(()=>{
    if(!tpl||!tpl.showGif||!tpl.gifUrl){setMeasuredGifW(0);return;}
    const img=new Image();
    img.onload=()=>setMeasuredGifW(Math.round(img.naturalWidth*(SZ/img.naturalHeight)));
    img.src=tpl.gifUrl;
  },[tpl]);

  // Détecte un portrait existant quand prénom + nom sont remplis
  useEffect(()=>{
    const first=(user.firstName||"").trim().charAt(0).toLowerCase();
    const last=(user.lastName||"").trim().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z]/g,"");
    if(!first||!last){setExistingPortrait(null);return;}
    const url=`/api/portrait/${first}${last}.jpg`;
    const timer=setTimeout(async()=>{
      // Détection portrait
      const img=new Image();
      img.onload=()=>setExistingPortrait(url);
      img.onerror=()=>setExistingPortrait(null);
      img.src=url+"?check="+Date.now();
      // Détection profil (poste + téléphone)
      try{
        const res=await fetch(`/api/profile/${key}`);
        if(res.ok){
          const profile=await res.json();
          if(profile&&(profile.role||profile.phone)){
            if(!user.role&&profile.role) set("role",profile.role);
            if(!user.phone&&profile.phone) set("phone",profile.phone);
          }
        }
      }catch{}
    },800);
    setProfileKey(key);
    return ()=>clearTimeout(timer);
  },[user.firstName,user.lastName,user.photoUrl]);
  const flash=(t,k="ok")=>{setMsg(t);setMsgType(k);setTimeout(()=>setMsg(""),5500);};
  const set=(k,v)=>setUser(u=>({...u,[k]:v}));

  const copy=async()=>{
    // Sauvegarde du profil si clé connue
    if(profileKey){
      try{
        await fetch("/api/save-profile",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({key:profileKey,role:user.role,phone:user.phone})
        });
      }catch{}
    }
    const hasLocal=user.showPhoto&&user.photoBase64&&!user.photoUrl;
    if(hasLocal){flash("⚠ Photo locale — uploadez-la et entrez l'URL pour qu'elle s'affiche chez vos destinataires.","warn");return;}
    const activeTpl = measuredGifW>0 ? {...tpl,gifWidth:measuredGifW} : tpl;
    const html=buildHTML(activeTpl,user);
    try{
      await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([html],{type:"text/html"})})]);
      flash("✓ Signature copiée ! Collez-la dans votre client mail.","ok");
    }catch{
      try{
        const d=document.createElement("div");d.innerHTML=html;d.style.cssText="position:fixed;left:-9999px";
        document.body.appendChild(d);const r=document.createRange();r.selectNode(d);
        window.getSelection().removeAllRanges();window.getSelection().addRange(r);
        document.execCommand("copy");window.getSelection().removeAllRanges();document.body.removeChild(d);
        flash("✓ Signature copiée !","ok");
      }catch{flash("Impossible de copier automatiquement.","err");}
    }
  };

  if(step==="pick") return(
    <div style={{minHeight:"100vh",background:LIGHT,display:"flex",flexDirection:"column"}}>
      <Nav onBack={onBack} title="Créer ma signature" step="Choisissez un template"/>
      <div style={{padding:"28px 28px 60px",flex:1}}>
        {templates.length===0
          ?<div style={{textAlign:"center",padding:"80px 0",color:GRAY,fontSize:14}}>Aucun template disponible.<br/>Demandez à un admin d'en créer un.</div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(440px,1fr))",gap:20,maxWidth:1100,margin:"0 auto"}}>
            {templates.map(t=>(
              <div key={t.id} onClick={()=>{setTpl(t);setStep("fill");}}
                style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"20px 22px",cursor:"pointer",transition:"border-color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=ROSE}
                onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
                <div style={{fontWeight:600,fontSize:14,color:DARK,marginBottom:16}}>{t.name||"Template sans nom"}</div>
                <div style={{overflow:"hidden",height:165,pointerEvents:"none"}}>
                  <div style={{transform:"scale(0.65)",transformOrigin:"top left",width:"154%"}}>
                    <SigPreview tpl={t} user={{firstName:"Marie",lastName:"DUMONT",role:"Responsable communication",phone:"0612345678",showPhoto:true}} showPlaceholder={true}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );

  return(
    <div style={{height:"100vh",background:LIGHT,display:"flex",flexDirection:"column"}}>
      <Nav onBack={()=>{setStep("pick");setUser({...blankUser});}} title="Créer ma signature" step={`Template : ${tpl.name}`}/>
      {cropSrc&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:WHITE,borderRadius:10,padding:24,maxWidth:420,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{margin:"0 0 14px",fontFamily:"Georgia,serif",fontSize:18,color:DARK}}>Recadrer le portrait</h3>
            <div style={{maxHeight:"60vh",overflowY:"auto"}}>
            <Cropper src={cropSrc} onConfirm={b64=>{set("photoBase64",b64);setCropSrc(null);}} onCancel={()=>setCropSrc(null)}/>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{width:320,background:WHITE,borderRight:`1px solid ${BORDER}`,overflowY:"auto",padding:"24px 22px 60px",flexShrink:0}}>
          <Flash msg={msg} type={msgType}/>
          <Field label="Prénom"><input style={INP} value={user.firstName} onChange={e=>set("firstName",titleCase(e.target.value))} placeholder="Marie"/></Field>
          <Field label="Nom"><input style={INP} value={user.lastName} onChange={e=>set("lastName",upperCase(e.target.value))} placeholder="DUMONT"/></Field>
          <Field label="Poste"><input style={INP} value={user.role} onChange={e=>set("role",e.target.value.charAt(0).toUpperCase()+e.target.value.slice(1))} placeholder="Responsable communication"/></Field>
          <Field label="Téléphone">
            <input style={INP} value={formatPhone(user.phone)} onChange={e=>set("phone",e.target.value.replace(/\D/g,""))} placeholder="06 12 34 56 78"/>
          </Field>
          <div style={{marginTop:20}}>
            {/* Suggestion portrait existant */}
            {existingPortrait&&!user.photoUrl&&!user.photoBase64&&(
              <div style={{background:"#f0fff6",border:"1px solid #a8e6be",borderRadius:8,padding:"12px 14px",marginBottom:12,fontSize:11,color:"#1a5c35"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <img src={existingPortrait} alt="" style={{width:40,height:40,objectFit:"cover",borderRadius:4,border:"1px solid #a8e6be"}}/>
                  <span>Un portrait existe déjà pour ce nom.</span>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{set("photoUrl", existingPortrait.startsWith("http") ? existingPortrait : window.location.origin + existingPortrait); set("showPhoto",true);}} style={{...gs("ghost"),fontSize:10,padding:"5px 10px"}}>
                    Utiliser ce portrait
                  </button>
                  <button onClick={()=>{set("showPhoto",true);setTimeout(()=>fileRef.current?.click(),50);}} style={{...gs("ghost"),fontSize:10,padding:"5px 10px"}}>
                    Remplacer par un nouveau
                  </button>
                </div>
              </div>
            )}
            <Toggle label="Ajouter un portrait" checked={user.showPhoto} onChange={()=>set("showPhoto",!user.showPhoto)}>
              <div style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:GRAY,marginBottom:8}}>Photo</label>
                <div style={{border:`2px dashed ${BORDER}`,borderRadius:8,padding:"16px",textAlign:"center",cursor:"pointer",background:LIGHT,transition:"border-color .15s"}}
                  onClick={()=>fileRef.current?.click()}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=ROSE}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(!f||!f.type.startsWith("image/"))return;set("photoUrl","");const r=new FileReader();r.onload=ev=>setCropSrc(ev.target.result);r.readAsDataURL(f);}}>
                  {(user.photoBase64||user.photoUrl)
                    ?<img src={user.photoBase64||user.photoUrl} alt="" style={{width:60,height:60,objectFit:"cover",borderRadius:4,margin:"0 auto",display:"block"}}/>
                    :<div style={{fontSize:11,color:GRAY,lineHeight:1.8}}>📷 Glisser une photo ici<br/>ou cliquer pour choisir</div>
                  }
                </div>
                <input type="file" accept="image/*" ref={fileRef}
                  onChange={e=>{const f=e.target.files[0];if(!f)return;set("photoUrl","");const r=new FileReader();r.onload=ev=>setCropSrc(ev.target.result);r.readAsDataURL(f);e.target.value="";}}
                  style={{display:"none"}}/>
                {user.photoBase64&&!user.photoUrl&&(
                <UploadButton user={user} set={set} flash={flash}/>
              )}
              </div>
              <Field label="Ou entrez une URL déjà hébergée">
                <input style={INP} value={user.photoUrl} onChange={e=>set("photoUrl",e.target.value)} placeholder="https://…/portrait.jpg"/>
              </Field>
              {user.photoUrl&&<p style={{fontSize:10,color:"#4caf50",margin:"-8px 0 10px"}}>✓ URL renseignée, la photo s'affichera dans les emails.</p>}
            </Toggle>
          </div>
          <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${BORDER}`}}>
            <button onClick={copy} style={{...gs("primary"),width:"100%",fontSize:14,padding:"12px 0"}}>📋 Copier ma signature</button>
          </div>
          <div style={{marginTop:16,background:LIGHT,borderRadius:8,padding:"14px 16px",fontSize:11,color:GRAY,lineHeight:1.9}}>
            <div style={{fontWeight:600,color:"#555",marginBottom:8,fontSize:12}}>Coller dans votre client mail</div>
            <b>Gmail :</b> Paramètres → Signature → <kbd style={{background:"#f0f0f0",border:`1px solid ${BORDER}`,borderRadius:3,padding:"1px 5px"}}>⌘V</kbd><br/>
            <b>Apple Mail :</b> Mail → Préférences → Signatures<br/>
            <div style={{marginTop:6}}><b>Outlook Windows :</b> Paramètres → Signatures → + Nouvelle Signature → Clic droit &gt; Coller ou <kbd style={{background:"#f0f0f0",border:`1px solid ${BORDER}`,borderRadius:3,padding:"1px 5px"}}>Ctrl+V</kbd> dans le champ texte → Enregistrer</div>
            <div style={{marginTop:4}}><b>Outlook Mac :</b> Signature → Gérer les signatures → cliquez sur <kbd style={{background:"#f0f0f0",border:`1px solid ${BORDER}`,borderRadius:3,padding:"1px 5px"}}>+</kbd> → Nommez la signature → Clic droit + Coller ou <kbd style={{background:"#f0f0f0",border:`1px solid ${BORDER}`,borderRadius:3,padding:"1px 5px"}}>⌘V</kbd> dans le champ → Dans "Choisir une signature par défaut" sélectionnez votre signature</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"32px 40px",background:LIGHT}}>
          <p style={{margin:"0 0 20px",fontSize:11,color:"#bbb",fontStyle:"italic"}}>Aperçu en temps réel</p>
          <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"28px 32px",display:"inline-block"}}>
            <SigPreview tpl={tpl} user={user}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ ADMIN FLOW */
function AdminFlow({ templates, onSave, onDelete, onBack }) {
  const [view,setView]=useState("list"); const [editing,setEditing]=useState(null);
  const [msg,setMsg]=useState(""); const [msgType,setMsgType]=useState("ok");
  const importRef=useRef(null);
  const flash=(t,k="ok")=>{setMsg(t);setMsgType(k);setTimeout(()=>setMsg(""),4500);};
  const set=(k,v)=>setEditing(e=>({...e,[k]:v}));

  const saveEditing=async()=>{
    if(!editing.name.trim()){flash("Donnez un nom au template.","warn");return;}
    await onSave(editing); flash("✓ Template sauvegardé !"); setTimeout(()=>setView("list"),1200);
  };
  const exportJSON=()=>{
    const blob=new Blob([JSON.stringify(templates,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="templates.json";a.click();URL.revokeObjectURL(a.href);
  };
  const importFile=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{try{const data=JSON.parse(ev.target.result);if(!Array.isArray(data))throw new Error();data.forEach(t=>onSave(t));flash(`✓ ${data.length} template(s) importé(s).`);}catch{flash("Fichier invalide.","err");}};
    r.readAsText(f);e.target.value="";
  };

  if(view==="list") return(
    <div style={{minHeight:"100vh",background:LIGHT,display:"flex",flexDirection:"column"}}>
      <Nav onBack={onBack} title="Gérer les templates" step="Créez et modifiez les templates de votre équipe"/>
      <div style={{padding:"28px 28px 60px",flex:1}}>
        <Flash msg={msg} type={msgType}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10,maxWidth:1020,margin:"0 auto 16px"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={exportJSON} style={gs("ghost")}>⬇ Exporter templates.json</button>
            <button onClick={()=>importRef.current?.click()} style={gs("ghost")}>⬆ Importer</button>
            <input type="file" accept=".json" ref={importRef} onChange={importFile} style={{display:"none"}}/>
          </div>
          <button onClick={()=>{setEditing({...blankTemplate,id:Date.now()});setView("edit");}} style={gs("primary")}>+ Nouveau template</button>
        </div>
        {templates.length===0
          ?<div style={{textAlign:"center",padding:"80px 0",color:GRAY,fontSize:14}}>Aucun template. Créez le premier !</div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(440px,1fr))",gap:20,maxWidth:1100,margin:"0 auto"}}>
            {templates.map(t=>(
              <div key={t.id} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"20px 22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{fontWeight:600,fontSize:14,color:DARK}}>{t.name}</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{setEditing({...t});setView("edit");}} style={gs("ghost")}>Modifier</button>
                    <button onClick={async()=>{await onDelete(t.id);flash("Template supprimé.","warn");}} style={gs("danger")}>×</button>
                  </div>
                </div>
                <div style={{overflow:"hidden",height:165,pointerEvents:"none"}}>
                  <div style={{transform:"scale(0.65)",transformOrigin:"top left",width:"154%"}}>
                    <SigPreview tpl={t} user={{firstName:"Marie",lastName:"DUMONT",role:"Responsable communication",phone:"0612345678",showPhoto:true}} showPlaceholder={true}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );

  return(
    <div style={{height:"100vh",background:LIGHT,display:"flex",flexDirection:"column"}}>
      <Nav onBack={()=>setView("list")} title={templates.find(t=>t.id===editing.id)?"Modifier le template":"Nouveau template"} step="Configurez les éléments de la signature"/>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{width:360,background:WHITE,borderRight:`1px solid ${BORDER}`,overflowY:"auto",padding:"24px 22px 60px",flexShrink:0}}>
          <Flash msg={msg} type={msgType}/>
          <Field label="Nom du template">
            <input style={INP} value={editing.name} onChange={e=>set("name",e.target.value)} placeholder="Ex : Signature principale 2025"/>
          </Field>
          <div style={{height:1,background:BORDER,margin:"16px 0"}}/>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:ROSE,marginBottom:12}}>Bloc images</div>
          <Field label="Logo" hint="URL d'une image carrée hébergée sur votre serveur.">
            <input style={INP} value={editing.logoUrl} onChange={e=>set("logoUrl",e.target.value)}/>
          </Field>
          <Field label="Lien au clic sur le logo">
            <input style={INP} value={editing.logoLinkUrl||""} onChange={e=>set("logoLinkUrl",e.target.value)} placeholder="https://luxmodernis.com"/>
          </Field>
          <Toggle label="Afficher le GIF" checked={editing.showGif} onChange={()=>set("showGif",!editing.showGif)}>
            <Field label="URL du GIF"><input style={INP} value={editing.gifUrl} onChange={e=>set("gifUrl",e.target.value)}/></Field>
            <Field label="Lien au clic sur le GIF">
              <input style={INP} value={editing.gifLinkUrl||""} onChange={e=>set("gifLinkUrl",e.target.value)} placeholder="https://…"/>
            </Field>
          </Toggle>
          <div style={{height:1,background:BORDER,margin:"16px 0"}}/>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:ROSE,marginBottom:12}}>Coordonnées</div>
          <Toggle label="Adresse postale" checked={editing.showAddress} onChange={()=>set("showAddress",!editing.showAddress)}>
            <Field label="Adresse">
              <textarea style={{...INP,height:60,resize:"vertical"}} value={editing.address} onChange={e=>set("address",e.target.value)} placeholder="12 rue de la Paix, 75001 Paris"/>
            </Field>
          </Toggle>
          <Toggle label="Site web" checked={editing.showWebsite} onChange={()=>set("showWebsite",!editing.showWebsite)}>
            <Field label="Texte affiché"><input style={INP} value={editing.websiteLabel} onChange={e=>set("websiteLabel",e.target.value)} placeholder="luxmodernis.com"/></Field>
            <Field label="URL"><input style={INP} value={editing.websiteUrl} onChange={e=>set("websiteUrl",e.target.value)} placeholder="https://luxmodernis.com"/></Field>
          </Toggle>
          <div style={{height:1,background:BORDER,margin:"16px 0"}}/>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:ROSE,marginBottom:12}}>Réseaux sociaux</div>
          <Toggle label="LinkedIn" checked={editing.showLinkedin} onChange={()=>set("showLinkedin",!editing.showLinkedin)}>
            <Field label="URL de l'icône"><input style={INP} value={editing.liIconUrl||""} onChange={e=>set("liIconUrl",e.target.value)} placeholder={DEFAULT_LI_ICON}/></Field>
            <Field label="URL de destination"><input style={INP} value={editing.linkedinUrl} onChange={e=>set("linkedinUrl",e.target.value)} placeholder="https://linkedin.com/company/…"/></Field>
          </Toggle>
          <Toggle label="Instagram" checked={editing.showInstagram} onChange={()=>set("showInstagram",!editing.showInstagram)}>
            <Field label="URL de l'icône"><input style={INP} value={editing.igIconUrl||""} onChange={e=>set("igIconUrl",e.target.value)} placeholder={DEFAULT_IG_ICON}/></Field>
            <Field label="URL de destination"><input style={INP} value={editing.instagramUrl} onChange={e=>set("instagramUrl",e.target.value)} placeholder="https://instagram.com/…"/></Field>
          </Toggle>
          <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${BORDER}`}}>
            <button onClick={saveEditing} style={{...gs("dark"),width:"100%",fontSize:14,padding:"12px 0"}}>💾 Sauvegarder le template</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"32px 40px",background:LIGHT}}>
          <p style={{margin:"0 0 20px",fontSize:11,color:"#bbb",fontStyle:"italic"}}>Aperçu avec données factices — chaque membre remplira ses propres informations</p>
          <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"28px 32px",display:"inline-block"}}>
            <SigPreview tpl={editing} user={{firstName:"Marie",lastName:"DUMONT",role:"Responsable communication",phone:"0612345678",showPhoto:true}} showPlaceholder={true}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ ROOT */
export default function App() {
  const [screen,setScreen]=useState("home");
  const [templates,setTemplates]=useState([]);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    (async()=>{
      try {
        const res = await fetch("/api/get-templates");
        if (res.ok) { const data = await res.json(); if (Array.isArray(data)) setTemplates(data); }
      } catch {
        try{const s=localStorage.getItem("lm_tpl_v2");if(s)setTemplates(JSON.parse(s));}catch{}
      }
      setReady(true);
    })();
  },[]);

  const persist=async tpls=>{
    setTemplates(tpls);
    try {
      await fetch("/api/save-templates", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(tpls)
      });
    } catch { try{localStorage.setItem("lm_tpl_v2",JSON.stringify(tpls));}catch{} }
  };
  const saveTpl=tpl=>{const e=templates.find(t=>t.id===tpl.id);persist(e?templates.map(t=>t.id===tpl.id?tpl:t):[...templates,tpl]);};
  const deleteTpl=id=>persist(templates.filter(t=>t.id!==id));

  // Mesure automatique du gifWidth pour tous les templates qui en ont besoin
  useEffect(()=>{
    if(templates.length===0) return;
    const toMeasure=templates.filter(t=>t.showGif&&t.gifUrl&&(!t.gifWidth||t.gifWidth===0));
    if(toMeasure.length===0) return;
    toMeasure.forEach(t=>{
      const img=new Image();
      img.onload=()=>{
        const w=Math.round(img.naturalWidth*(SZ/img.naturalHeight));
        saveTpl({...t,gifWidth:w});
      };
      img.src=t.gifUrl;
    });
  },[templates.length]);

  if(!ready) return <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",color:GRAY,fontSize:14}}>Chargement…</div>;

  return(
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;}
        body{margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}
        input:focus,textarea:focus{border-color:${ROSE}!important;box-shadow:0 0 0 3px rgba(239,169,169,.2);}
        button:hover{opacity:.85;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#ddd;border-radius:2px;}
      `}</style>
      {screen==="home"  &&<HomeScreen onChoice={setScreen}/>}
      {screen==="user"  &&<UserFlow   templates={templates} onBack={()=>setScreen("home")}/>}
      {screen==="admin" &&<AdminFlow  templates={templates} onSave={saveTpl} onDelete={deleteTpl} onBack={()=>setScreen("home")}/>}
    </>
  );
}
