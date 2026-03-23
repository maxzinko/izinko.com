import { useState, useEffect, useRef, useCallback } from "react";
import { POSTS, PROJECTS, THINGS } from "./content";

/* ── green palette on warm cream ── */
const VARS = {
  "--bg": "#f3f0e8",
  "--text": "#1c1b19",
  "--muted": "#8a8780",
  "--faint": "#b5b2ab",
  "--border": "rgba(28,27,25,0.07)",
  "--accent": "#4d7a5c",
  "--accent-dim": "rgba(77,122,92,0.12)",
  "--accent-glow": "rgba(77,122,92,0.06)",
};

/* ── content with inline markup ── */
const BIO_TITLE = "developer, broadly speaking";

/* ── hover image fan ── */
const IMAGE_LAYOUTS = [
  { rotate: -8, x: -20, y: 0 },
  { rotate: 4, x: 15, y: -10 },
  { rotate: -3, x: -5, y: 8 },
  { rotate: 10, x: 25, y: -5 },
];

function HoverImages({ text, images }) {
  const [h, setH] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <span style={{
        color: "var(--accent)", cursor: "default",
        borderBottom: "0.5px dashed var(--accent-dim)",
        transition: "border-color 0.2s",
      }}>{text}</span>
      <span style={{
        position: "absolute", bottom: "100%", left: "50%",
        pointerEvents: "none", zIndex: 20,
        marginBottom: 10,
      }}>
        {images.map((src, i) => {
          const layout = IMAGE_LAYOUTS[i % IMAGE_LAYOUTS.length];
          return (
            <img key={i} src={src} alt="" style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              maxWidth: 320, maxHeight: 320, width: "auto", height: "auto",
              borderRadius: 10,
              border: "1px solid rgba(28,27,25,0.08)",
              boxShadow: "4px 8px 20px rgba(0,0,0,0.1)",
              opacity: h ? 1 : 0,
              transform: h
                ? `translate(calc(-50% + ${layout.x}px), ${layout.y}px) rotate(${layout.rotate}deg) scale(1)`
                : `translate(-50%, 20px) rotate(0deg) scale(0.3)`,
              transition: `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.04}s, opacity 0.3s ease ${i * 0.04}s`,
              transformOrigin: "center bottom",
              zIndex: images.length - i,
            }} />
          );
        })}
      </span>
    </span>
  );
}

// inline markup: [text](url) for links, *text* for accent, {text}(img1, img2) for hover images
function renderInline(text) {
  const parts = [];
  const regex = /\{([^}]+)\}\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*([^*]+)\*|_([^_]+)_/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1]) {
      // {text}(img1, img2, img3) — hover images
      const imgs = match[2].split(",").map((s) => s.trim());
      parts.push(<HoverImages key={match.index} text={match[1]} images={imgs} />);
    } else if (match[3]) {
      // [text](url) — link
      parts.push(
        <a key={match.index} href={match[4]} target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--accent)", textDecoration: "none", borderBottom: "0.5px solid var(--accent-dim)",
            transition: "border-color 0.2s" }}
          onMouseEnter={(e) => (e.target.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.target.style.borderColor = "var(--accent-dim)")}
        >{match[3]}</a>
      );
    } else if (match[5] || match[6]) {
      // *text* or _text_ — accent
      parts.push(<span key={match.index} style={{ color: "var(--accent)" }}>{match[5] || match[6]}</span>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const BIO = [
  "hey, i'm max - a developer, broadly speaking.",
  "i spent a few years in QA making sure nothing broke. now i build web products and break my own stuff instead.",
  "i care about craft - if it doesn't look right or doesn't work, what's the point.",
  "outside of code, i climb walls, film things with cameras i probably didn't need to buy, and mass-defend my {minecraft}(https://j4jbi0zyeo.ufs.sh/f/MDkjO1tUfV4kikAAfsYDXbQ92dTYyLtZfecx1KIUMBGHh5j3, https://j4jbi0zyeo.ufs.sh/f/MDkjO1tUfV4k07ZdMao78fJI4FSWcupw5kRzvQeqKT9YxXlE) builds from no one. i've been poking at AI tools since before it was cool.",
  "originally from {tysmenytsia}(https://j4jbi0zyeo.ufs.sh/f/MDkjO1tUfV4k9ea56FIWaUMg3jTKVFl9A2xcum71BkZERIvX), ukraine. now based in *toronto*.",
];

const SOCIALS = [
  { label: "twitter", url: "https://x.com/maxzinko" },
  { label: "github", url: "https://github.com/maxzinko" },
  { label: "email", url: "mailto:max@izi.cc" },
];

/* ── hooks ── */
function useDualTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (tz) => {
    const d = new Date(now.toLocaleString("en-US", { timeZone: tz }));
    return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
  };
  return { toronto: fmt("America/Toronto"), tysmenytsia: fmt("Europe/Kyiv") };
}

function useReveal(count, delay = 55) {
  const [vis, setVis] = useState(new Set());
  useEffect(() => {
    const t = [];
    for (let i = 0; i < count; i++) t.push(setTimeout(() => setVis((s) => new Set(s).add(i)), delay * (i + 1) + 200));
    return () => t.forEach(clearTimeout);
  }, [count, delay]);
  return vis;
}

/* ── cursor glow ── */
function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = -500, y = -500, cx = -500, cy = -500, raf;
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const loop = () => {
      cx += (x - cx) * 0.07;
      cy += (y - cy) * 0.07;
      el.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} style={{
      position: "fixed", top: 0, left: 0, width: 400, height: 400, borderRadius: "50%",
      background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
      pointerEvents: "none", zIndex: 0, willChange: "transform",
    }} />
  );
}

/* ── row with hover image preview ── */
function Row({ children, right, visible, onClick, image }) {
  const [h, setH] = useState(false);
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "14px 0 14px 0", borderBottom: "0.5px solid var(--border)",
      cursor: "pointer", position: "relative",
      opacity: visible ? 1 : 0, translate: visible ? "0 0" : "0 10px",
      transition: "opacity 0.55s cubic-bezier(0.23,1,0.32,1), translate 0.55s cubic-bezier(0.23,1,0.32,1)",
    }} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      {/* hover image preview */}
      {image && (
        <div style={{
          position: "absolute", left: "50%", bottom: "100%",
          transform: `translateX(-50%) scale(${h ? 1 : 0.4}) rotate(${h ? -6 : 0}deg)`,
          opacity: h ? 1 : 0,
          marginBottom: 12,
          pointerEvents: "none", zIndex: 10,
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease",
          transformOrigin: "center bottom",
        }}>
          <img src={image} alt="" style={{
            width: 180, height: 120, objectFit: "cover",
            borderRadius: 12,
            border: "1px solid rgba(28,27,25,0.08)",
            boxShadow: h ? "4px 10px 24px rgba(0,0,0,0.1)" : "none",
            transform: `rotate(${h ? 4 : 0}deg)`,
            transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease",
          }} />
        </div>
      )}
      <span style={{
        position: "absolute", left: -12, top: "50%", width: 2.5, height: h ? 18 : 0,
        borderRadius: 2, backgroundColor: "var(--accent)", transform: "translateY(-50%)",
        transition: "height 0.3s cubic-bezier(0.23,1,0.32,1)",
        opacity: h ? 1 : 0,
      }} />
      <span style={{
        fontSize: 15, letterSpacing: "-0.015em",
        color: h ? "var(--accent)" : "var(--text)", transition: "color 0.2s ease",
      }}>{children}</span>
      {right && (
        <span style={{
          fontSize: 13, color: "var(--muted)", fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.01em", opacity: h ? 0.85 : 0.35, transition: "opacity 0.3s ease",
        }}>{right}</span>
      )}
    </div>
  );
}

/* ── social link with animated underline ── */
function SocialLink({ label, url }) {
  const [h, setH] = useState(false);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontSize: 13, color: h ? "var(--accent)" : "var(--muted)", textDecoration: "none",
        letterSpacing: "-0.01em", transition: "color 0.2s ease", position: "relative",
        display: "inline-block",
      }}>
      {label}
      <span style={{
        position: "absolute", bottom: -2, left: 0, height: 0.5,
        width: h ? "100%" : "0%", backgroundColor: "var(--accent)",
        transition: "width 0.3s cubic-bezier(0.23,1,0.32,1)",
      }} />
    </a>
  );
}

/* ── post view ── */
function PostView({ slug, onBack }) {
  const post = POSTS[slug];
  const [v, setV] = useState(false);
  const bodyVis = useReveal(post ? post.body.length : 0, 70);
  useEffect(() => { requestAnimationFrame(() => setV(true)); }, []);
  useEffect(() => { if (!post) onBack(); }, [post, onBack]);

  if (!post) return null;

  return (
    <div style={{
      opacity: v ? 1 : 0, translate: v ? "0 0" : "0 18px",
      transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)",
    }}>
      <div onClick={onBack} style={{
        display: "inline-flex", alignItems: "center", gap: 3, cursor: "pointer",
        fontSize: 13, color: "var(--muted)", marginBottom: 52,
        letterSpacing: "-0.01em", transition: "color 0.2s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 1 }}>
          <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        back
      </div>

      <h1 style={{
        fontSize: 32, fontWeight: 500, letterSpacing: "-0.04em", marginBottom: 10, lineHeight: 1.1,
      }}>{post.title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
        <span style={{ fontSize: 13, color: "var(--muted)", letterSpacing: "-0.01em" }}>{post.date}</span>
        {post.link && (
          <>
            <span style={{ color: "var(--faint)", fontSize: 13 }}>·</span>
            <a href={post.link.url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 13, color: "var(--accent)", textDecoration: "none", transition: "opacity 0.2s",
              borderBottom: "0.5px solid var(--accent-dim)",
            }}
              onMouseEnter={(e) => { e.target.style.borderColor = "var(--accent)"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "var(--accent-dim)"; }}
            >{post.link.label} ↗</a>
          </>
        )}
      </div>

      <div style={{
        width: 28, height: 1.5, borderRadius: 1, backgroundColor: "var(--accent-dim)",
        marginBottom: 36,
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {post.body.map((p, i) => (
          <p key={i} style={{
            fontSize: 15.5, lineHeight: 1.78, color: "var(--text)", letterSpacing: "-0.012em",
            opacity: bodyVis.has(i) ? 1 : 0, translate: bodyVis.has(i) ? "0 0" : "0 6px",
            transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
          }}>{renderInline(p)}</p>
        ))}
      </div>
    </div>
  );
}

/* ── home ── */
function Home({ onNavigate }) {
  const time = useDualTime();
  const total = 1 + BIO.length + PROJECTS.length + 1 + THINGS.length + 2;
  const vis = useReveal(total, 50);
  let idx = 0;

  return (
    <>
      <header style={{ marginBottom: 64 }}>
        <p style={{
          fontSize: 13, color: "var(--muted)", marginBottom: 24, letterSpacing: "-0.01em",
          display: "flex", alignItems: "center",
          opacity: vis.has(idx) ? 1 : 0, transition: "opacity 0.5s ease 0.1s",
        }}>
        </p>
        {(() => { idx++; return null })()}
        <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
          {BIO.map((p, i) => {
            const cur = idx++;
            return (
              <p key={i} style={{
                fontSize: 15, lineHeight: 1.78, letterSpacing: "-0.012em", color: "var(--text)",
                opacity: vis.has(cur) ? 1 : 0, translate: vis.has(cur) ? "0 0" : "0 8px",
                transition: "all 0.55s cubic-bezier(0.23,1,0.32,1)",
              }}>{renderInline(p)}</p>
            );
          })}
        </div>
      </header>

      <section style={{ marginBottom: 48 }}>
        {PROJECTS.map((p) => {
          const cur = idx++;
          return (
            <Row key={p.slug} visible={vis.has(cur)} right={p.date}
              image={p.image} onClick={() => onNavigate(p.slug)}>
              {p.title}
            </Row>
          );
        })}
      </section>

      <section style={{ marginBottom: 60 }}>
        <p style={{
          fontSize: 13, color: "var(--muted)", marginBottom: 4, letterSpacing: "-0.01em",
          opacity: vis.has(idx) ? 1 : 0, transition: "opacity 0.5s ease",
        }}>things</p>
        {(() => { idx++; return null })()}
        {THINGS.map((t) => {
          const cur = idx++;
          return (
            <Row key={t.slug} visible={vis.has(cur)} right={t.date}
              image={t.image} onClick={() => onNavigate(t.slug)}>
              {t.title}
            </Row>
          );
        })}
      </section>

      <section style={{ marginBottom: 60 }}>
        <div style={{
          display: "flex", gap: 24,
          opacity: vis.has(idx) ? 1 : 0, transition: "opacity 0.6s ease",
        }}>
          {SOCIALS.map((s) => <SocialLink key={s.label} {...s} />)}
        </div>
      </section>

      <footer style={{
        display: "flex", flexDirection: "column", gap: 20,
        opacity: vis.has(idx + 1) ? 1 : 0, transition: "opacity 0.8s ease",
      }}>
        <div style={{
          display: "flex", gap: 16, fontSize: 12, color: "var(--faint)",
          letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
        }}>
          <span>{time.toronto} toronto</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span>{time.tysmenytsia} tysmenytsia</span>
        </div>
        <a href="/v1/" style={{
          fontSize: 11, color: "var(--faint)", textDecoration: "none",
          letterSpacing: "-0.01em", opacity: 0.4, transition: "opacity 0.3s ease, color 0.2s ease",
          cursor: "pointer",
        }}
          onMouseEnter={(e) => { e.target.style.opacity = 1; e.target.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.target.style.opacity = 0.4; e.target.style.color = "var(--faint)"; }}
        >← v1</a>
      </footer>
    </>
  );
}

/* ── keyframes ── */
const globalStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  ::selection { background: rgba(77,122,92,0.15); color: var(--text); }
`;

/* ── simple path router ── */
function getSlugFromPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  return path && POSTS[path] ? path : null;
}

/* ── app ── */
export default function App() {
  const [post, setPost] = useState(getSlugFromPath);

  useEffect(() => {
    const onPop = () => setPost(getSlugFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((slug) => {
    history.pushState(null, "", `/${slug}`);
    setPost(slug);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const goHome = useCallback(() => {
    history.pushState(null, "", "/");
    setPost(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div style={{
      ...VARS,
      minHeight: "100vh", backgroundColor: "var(--bg)",
      display: "flex", justifyContent: "center",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale",
    }}>
      <style>{globalStyles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet" />
      <CursorGlow />
      <main style={{
        maxWidth: 500, width: "100%", padding: "88px 24px 64px",
        position: "relative", zIndex: 1,
      }}>
        {post ? (
          <PostView slug={post} onBack={goHome} />
        ) : (
          <Home onNavigate={navigate} />
        )}
      </main>
    </div>
  );
}
