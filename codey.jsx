import { useState, useEffect, useRef } from "react";

// ─── Cursify cursor ───────────────────────────────────────────────────────────
function CursifyCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", move);

    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;
    const loop = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.12);
      if (ring.current) {
        ring.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const over = (e) => {
      if (e.target.closest("a,button,[data-hover]")) setHovered(true);
    };
    const out = () => setHovered(false);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        style={{
          position: "fixed", top: 0, left: 0, width: 6, height: 6,
          background: "#00FFB2", borderRadius: "50%", pointerEvents: "none",
          zIndex: 9999, transform: "translate(-50%,-50%)", marginLeft: -3, marginTop: -3,
          transition: "background 0.2s",
        }}
      />
      <div
        ref={ring}
        style={{
          position: "fixed", top: 0, left: 0,
          width: hovered ? 48 : 28, height: hovered ? 48 : 28,
          border: `1.5px solid ${hovered ? "#FF6B35" : "#00FFB2"}`,
          borderRadius: "50%", pointerEvents: "none",
          zIndex: 9998,
          marginLeft: hovered ? -24 : -14, marginTop: hovered ? -24 : -14,
          transition: "width 0.25s, height 0.25s, border-color 0.25s, margin 0.25s",
          opacity: 0.7,
        }}
      />
    </>
  );
}

// ─── Magnetic button ──────────────────────────────────────────────────────────
function MagBtn({ children, style = {}, onClick, variant = "primary" }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    ref.current.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.04)`;
  };
  const handleMouseLeave = () => {
    ref.current.style.transform = "translate(0,0) scale(1)";
  };
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px",
    borderRadius: 99, fontFamily: "'Space Mono', monospace", fontWeight: 700,
    fontSize: 14, letterSpacing: 1, cursor: "pointer", border: "none",
    transition: "transform 0.3s cubic-bezier(.23,1,.32,1), box-shadow 0.3s",
    ...style,
  };
  const primary = {
    background: "linear-gradient(135deg, #00FFB2 0%, #00D4AA 100%)",
    color: "#0A0A0A", boxShadow: "0 0 28px rgba(0,255,178,0.35)",
  };
  const secondary = {
    background: "transparent",
    color: "#00FFB2", border: "1.5px solid #00FFB2",
    boxShadow: "0 0 14px rgba(0,255,178,0.12)",
  };
  return (
    <button
      ref={ref}
      data-hover
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...base, ...(variant === "primary" ? primary : secondary) }}
    >
      {children}
    </button>
  );
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, dir = "up" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const map = { up: "0,40px", down: "0,-40px", left: "-40px,0", right: "40px,0" };
  const [tx, ty] = map[dir].split(",");
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translate(0,0)" : `translate(${tx},${ty})`,
        transition: `opacity 0.7s ${delay}s cubic-bezier(.23,1,.32,1), transform 0.7s ${delay}s cubic-bezier(.23,1,.32,1)`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function Typewriter({ words }) {
  const [wi, setWi] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = words[wi];
    if (!del && text.length < word.length) {
      const t = setTimeout(() => setText(word.slice(0, text.length + 1)), 80);
      return () => clearTimeout(t);
    }
    if (!del && text.length === word.length) {
      const t = setTimeout(() => setDel(true), 1800);
      return () => clearTimeout(t);
    }
    if (del && text.length > 0) {
      const t = setTimeout(() => setText(text.slice(0, -1)), 45);
      return () => clearTimeout(t);
    }
    if (del && text.length === 0) {
      setDel(false);
      setWi((wi + 1) % words.length);
    }
  }, [text, del, wi]);

  return (
    <span style={{ color: "#00FFB2", borderRight: "2px solid #00FFB2", paddingRight: 4 }}>
      {text}
    </span>
  );
}

// ─── Particle bg ─────────────────────────────────────────────────────────────
function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,255,178,0.35)";
        ctx.fill();
      });
      pts.forEach((a, i) => {
        pts.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,255,178,${0.15 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}
    />
  );
}

// ─── Counter ─────────────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = () => {
          start += Math.ceil(target / 60);
          if (start >= target) { setVal(target); return; }
          setVal(start);
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TRACKS = [
  { icon: "⬡", label: "Web Dev", desc: "HTML, CSS, JS, React — build full-stack apps from zero.", color: "#00FFB2", weeks: 8 },
  { icon: "◈", label: "Python & AI", desc: "Data science, ML fundamentals, and building with LLMs.", color: "#FF6B35", weeks: 10 },
  { icon: "▣", label: "Mobile Dev", desc: "React Native & Flutter — ship to iOS and Android.", color: "#A78BFA", weeks: 9 },
  { icon: "◉", label: "Cybersecurity", desc: "Ethical hacking, network defense, and secure coding.", color: "#38BDF8", weeks: 8 },
  { icon: "◬", label: "Game Dev", desc: "Unity, C#, and the game loop — from concept to release.", color: "#FACC15", weeks: 12 },
  { icon: "⬤", label: "Cloud & DevOps", desc: "AWS, Docker, CI/CD pipelines — deploy at scale.", color: "#F472B6", weeks: 8 },
];

const TESTIMONIALS = [
  { name: "Ava Chen", role: "Frontend Eng @ Stripe", text: "In 10 weeks I went from zero to shipping real features. The project-based approach made everything click.", avatar: "AC" },
  { name: "Marcus Obi", role: "Freelance Dev", text: "Landed my first $8k project two months after camp. The curriculum is brutally practical.", avatar: "MO" },
  { name: "Priya Nair", role: "ML Eng @ HuggingFace", text: "The Python & AI track is genuinely advanced. Not just tutorials — real model training from scratch.", avatar: "PN" },
];

const NAV = ["Tracks", "Schedule", "Mentors", "Outcomes"];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{
      background: "#080B10", color: "#E8EDF2", minHeight: "100vh",
      fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", cursor: "none",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#0D1117;}
        ::-webkit-scrollbar-thumb{background:#00FFB230;border-radius:2px;}
        ::selection{background:#00FFB240;}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,255,178,0.4)}50%{box-shadow:0 0 0 14px rgba(0,255,178,0)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
      `}</style>

      <CursifyCursor />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 60px",
        background: "linear-gradient(180deg,rgba(8,11,16,0.95) 0%,rgba(8,11,16,0) 100%)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 18, color: "#00FFB2", letterSpacing: 2 }}>
          CODE<span style={{ color: "#FF6B35" }}>CAMP</span>
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          {NAV.map((n) => (
            <a key={n} href="#" data-hover
              onMouseEnter={() => setActiveNav(n)} onMouseLeave={() => setActiveNav(null)}
              style={{
                color: activeNav === n ? "#00FFB2" : "#9CA3AF",
                fontFamily: "'Space Mono',monospace", fontSize: 13, textDecoration: "none",
                letterSpacing: 1, transition: "color 0.2s",
                borderBottom: activeNav === n ? "1px solid #00FFB2" : "1px solid transparent",
                paddingBottom: 2,
              }}>{n}</a>
          ))}
        </div>
        <MagBtn>Apply Now →</MagBtn>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "120px 60px 80px" }}>
        <ParticleBg />

        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: "15%", left: "8%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,255,178,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "6%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,53,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* Floating badge */}
        <div style={{ position: "absolute", top: "22%", right: "12%", animation: "float 3.5s ease-in-out infinite" }}>
          <div style={{ background: "rgba(0,255,178,0.08)", border: "1px solid rgba(0,255,178,0.25)", borderRadius: 12, padding: "10px 18px", fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#00FFB2" }}>
            🟢 Cohort 12 — Open
          </div>
        </div>

        <div style={{ position: "relative", textAlign: "center", maxWidth: 860 }}>
          <Reveal>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: 4, color: "#FF6B35", marginBottom: 24, textTransform: "uppercase" }}>
              ◈ Immersive · Intensive · In-Person
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 style={{ fontSize: "clamp(42px,7vw,88px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 20, letterSpacing: -2 }}>
              Master{" "}
              <Typewriter words={["Web Dev.", "Python & AI.", "Mobile Apps.", "Cybersecurity.", "Game Dev."]} />
              <br />
              <span style={{ color: "#9CA3AF", fontWeight: 300 }}>Ship Real Products.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p style={{ fontSize: 19, color: "#6B7280", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 44px" }}>
              Project-first code camps for serious learners. 8–12 weeks. Mentors who've built at scale. A job, or your money back.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <MagBtn style={{ fontSize: 15, padding: "16px 40px" }}>Explore Tracks →</MagBtn>
              <MagBtn variant="secondary" style={{ fontSize: 15, padding: "16px 40px" }}>Watch Demo ▶</MagBtn>
            </div>
          </Reveal>

          {/* Stats row */}
          <Reveal delay={0.45}>
            <div style={{ display: "flex", gap: 60, justifyContent: "center", marginTop: 80, flexWrap: "wrap" }}>
              {[
                { val: 4200, suf: "+", label: "Graduates" },
                { val: 94, suf: "%", label: "Job placement" },
                { val: 6, suf: "", label: "Tracks" },
                { val: 120, suf: "+", label: "Mentors" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 36, fontWeight: 700, color: "#00FFB2" }}>
                    <Counter target={s.val} suffix={s.suf} />
                  </div>
                  <div style={{ fontSize: 13, color: "#6B7280", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 1, height: 60, background: "linear-gradient(180deg,#00FFB2,transparent)" }} />
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#4B5563", letterSpacing: 3 }}>SCROLL</span>
        </div>
      </section>

      {/* TRACKS */}
      <section style={{ padding: "120px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div style={{ marginBottom: 72, textAlign: "center" }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: 4, color: "#FF6B35", marginBottom: 16, textTransform: "uppercase" }}>What we teach</div>
            <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 700, letterSpacing: -1 }}>
              Choose Your <span style={{ color: "#00FFB2" }}>Track</span>
            </h2>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24 }}>
          {TRACKS.map((t, i) => (
            <TrackCard key={t.label} track={t} delay={i * 0.08} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "120px 60px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: 4, color: "#FF6B35", marginBottom: 16, textTransform: "uppercase" }}>The process</div>
              <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 700, letterSpacing: -1 }}>How It <span style={{ color: "#00FFB2" }}>Works</span></h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 0, position: "relative" }}>
            {[
              { n: "01", label: "Apply", desc: "A short skills assessment. No degree required — curiosity is the only prerequisite." },
              { n: "02", label: "Choose", desc: "Pick one of 6 intensive tracks. Full-time day or evening cohort — you choose the pace." },
              { n: "03", label: "Build", desc: "Every week: a real project. Every two weeks: a code review with an industry mentor." },
              { n: "04", label: "Ship", desc: "Capstone demo day. A deployed product. A portfolio that actually opens doors." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.12}>
                <div style={{ padding: "40px 36px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none", position: "relative" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 48, fontWeight: 700, color: "rgba(0,255,178,0.08)", position: "absolute", top: 20, right: 20 }}>{s.n}</div>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #00FFB2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#00FFB2", marginBottom: 20, animation: "pulse 2.5s infinite" }}>{s.n}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.label}</div>
                  <div style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "120px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: 4, color: "#FF6B35", marginBottom: 16, textTransform: "uppercase" }}>From the community</div>
            <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 700, letterSpacing: -1 }}>Real <span style={{ color: "#00FFB2" }}>Outcomes</span></h2>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.12} dir="up">
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "36px", position: "relative", overflow: "hidden",
                transition: "border-color 0.3s, transform 0.3s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,178,0.25)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 48, color: "rgba(0,255,178,0.12)", fontFamily: "Georgia,serif", position: "absolute", top: 16, right: 24, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 16, color: "#9CA3AF", lineHeight: 1.8, marginBottom: 28 }}>{t.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#00FFB2,#00D4AA)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 12, color: "#080B10" }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "100px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%,rgba(0,255,178,0.07),transparent)", pointerEvents: "none" }} />
        <Reveal>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 4, color: "#FF6B35", marginBottom: 20, textTransform: "uppercase" }}>Next cohort starts Jun 2025</div>
          <h2 style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 700, letterSpacing: -2, lineHeight: 1.1, marginBottom: 20 }}>
            Ready to <span style={{ background: "linear-gradient(90deg,#00FFB2,#38BDF8,#A78BFA)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "gradShift 4s ease infinite" }}>build</span>?
          </h2>
          <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 44, maxWidth: 480, margin: "0 auto 44px" }}>
            Seats are limited per cohort. Apply in 10 minutes. Hear back in 48 hours.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <MagBtn style={{ fontSize: 16, padding: "18px 48px" }}>Apply Now — Free →</MagBtn>
            <MagBtn variant="secondary" style={{ fontSize: 16, padding: "18px 48px" }}>Talk to an Advisor</MagBtn>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 60px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 18, color: "#00FFB2", letterSpacing: 2 }}>
          CODE<span style={{ color: "#FF6B35" }}>CAMP</span>
        </div>
        <div style={{ fontSize: 13, color: "#4B5563" }}>© 2025 CodeCamp Inc. — The future is open source.</div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Twitter", "GitHub", "Discord"].map((s) => (
            <a key={s} href="#" data-hover style={{ fontSize: 13, color: "#6B7280", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.target.style.color = "#00FFB2")}
              onMouseLeave={(e) => (e.target.style.color = "#6B7280")}
            >{s}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ─── Track Card ───────────────────────────────────────────────────────────────
function TrackCard({ track, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        data-hover
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? `rgba(${track.color === "#00FFB2" ? "0,255,178" : track.color === "#FF6B35" ? "255,107,53" : "167,139,250"},0.05)` : "rgba(255,255,255,0.025)",
          border: `1px solid ${hov ? track.color + "50" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 20, padding: "36px",
          transition: "all 0.35s cubic-bezier(.23,1,.32,1)",
          transform: hov ? "translateY(-6px)" : "translateY(0)",
          cursor: "default",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 32, color: track.color, filter: hov ? `drop-shadow(0 0 14px ${track.color}80)` : "none", transition: "filter 0.3s" }}>{track.icon}</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: track.color, background: `${track.color}18`, borderRadius: 99, padding: "4px 12px", letterSpacing: 1 }}>{track.weeks} WKS</div>
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{track.label}</h3>
        <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 28 }}>{track.desc}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: track.color, fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: 1, opacity: hov ? 1 : 0.5, transition: "opacity 0.3s" }}>
          Explore track <span style={{ marginLeft: 4 }}>→</span>
        </div>
      </div>
    </Reveal>
  );
}
