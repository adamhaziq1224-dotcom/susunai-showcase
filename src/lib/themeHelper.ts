export function getThemeCss(currentTheme: string, energy: string): string {
  let activeColorGroup = currentTheme;
  if (currentTheme === "smart") {
    activeColorGroup = energy === "Peak" ? "teal-smart" : energy === "Moderate" ? "purple-smart" : "rose-smart";
  }

  // Common glass effects, glowing borders and customized typography for futurism
  if (activeColorGroup === "light") {
    return `
      /* LIGHT THEME - "WHITE ONYX QUARTZ" (Muted, premium hipster studio look) */
      .theme-light, [class*="theme-light"] {
        background-color: #f6f8fa !important;
        background-image: radial-gradient(#6366f108 1.5px, transparent 1.5px) !important;
        background-size: 24px 24px !important;
        color: #0f172a !important;
      }
      .theme-light .text-purple-400,
      .theme-light .text-indigo-400,
      [class*="theme-light"] .text-purple-400,
      [class*="theme-light"] .text-indigo-400 {
        color: #6366f1 !important; 
      }
      .theme-light header, [class*="theme-light"] header {
        background-color: rgba(255, 255, 255, 0.8) !important;
        border-color: rgba(99, 102, 241, 0.1) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02) !important;
      }
      .theme-light nav, [class*="theme-light"] nav {
        background-color: rgba(241, 245, 249, 0.9) !important;
        border-color: rgba(99, 102, 241, 0.12) !important;
        backdrop-blur: 16px !important;
      }
      .theme-light nav button.bg-zinc-900, [class*="theme-light"] nav button.bg-zinc-900 {
        background-color: #ffffff !important;
        color: #6366f1 !important;
        border-color: rgba(99, 102, 241, 0.2) !important;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08) !important;
      }
      .theme-light main h1,
      .theme-light main h2,
      .theme-light main h3,
      .theme-light main h4,
      .theme-light main h5,
      .theme-light main .text-white,
      [class*="theme-light"] main h1,
      [class*="theme-light"] main h2,
      [class*="theme-light"] main h3,
      [class*="theme-light"] main h4,
      [class*="theme-light"] main h5,
      [class*="theme-light"] main .text-white {
        color: #0f172a !important;
      }
      .theme-light main .text-zinc-100, [class*="theme-light"] main .text-zinc-100 {
        color: #1e293b !important;
      }
      .theme-light main .text-zinc-300, [class*="theme-light"] main .text-zinc-300 {
        color: #334155 !important;
      }
      .theme-light main .text-zinc-400,
      .theme-light main .text-slate-400,
      [class*="theme-light"] main .text-zinc-400,
      [class*="theme-light"] main .text-slate-400 {
        color: #475569 !important;
      }
      .theme-light main .text-zinc-500,
      .theme-light main .text-slate-500,
      [class*="theme-light"] main .text-zinc-500,
      [class*="theme-light"] main .text-slate-500 {
        color: #64748b !important;
      }
      .theme-light .bg-zinc-950, [class*="theme-light"] .bg-zinc-950 {
        background-color: #f1f5f9 !important;
        border-color: rgba(99, 102, 241, 0.1) !important;
      }
      .theme-light .border-zinc-850,
      .theme-light .border-zinc-800,
      .theme-light .border-white\\/06,
      .theme-light .border-white\\/10,
      [class*="theme-light"] .border-zinc-850,
      [class*="theme-light"] .border-zinc-800 {
        border-color: rgba(99, 102, 241, 0.12) !important;
      }
      .theme-light .bg-\\[\\#0e0d12\\]\\/50,
      .theme-light .bg-\\[\\#0e0d12\\]\\/60,
      .theme-light .bg-zinc-900\\/40,
      .theme-light .bg-white\\/5,
      .theme-light .bg-black\\/20,
      [class*="theme-light"] .bg-\\[\\#0e0d12\\]\\/50,
      [class*="theme-light"] .bg-\\[\\#0e0d12\\]\\/60 {
        background-color: rgba(255, 255, 255, 0.8) !important;
        border-color: rgba(99, 102, 241, 0.12) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02) !important;
      }
    `;
  } else if (activeColorGroup === "orange") {
    return `
      /* ORANGE THEME - "SOLAR EMBER" (Warm, high-contrast, deep space-copper grid) */
      .theme-orange, [class*="theme-orange"] {
        background-color: #0d0602 !important;
        background-image: radial-gradient(#ea580c0d 1.5px, transparent 1.5px) !important;
        background-size: 24px 24px !important;
        color: #ffedd5 !important;
      }
      .theme-orange header, [class*="theme-orange"] header {
        background-color: rgba(18, 8, 3, 0.85) !important;
        border-color: rgba(234, 88, 12, 0.2) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 4px 30px rgba(234, 88, 12, 0.03) !important;
      }
      .theme-orange .bg-zinc-950, [class*="theme-orange"] .bg-zinc-950 {
        background-color: #1a0b04 !important;
        border-color: rgba(234, 88, 12, 0.2) !important;
      }
      .theme-orange .text-purple-400,
      .theme-orange .text-indigo-400,
      [class*="theme-orange"] .text-purple-400,
      [class*="theme-orange"] .text-indigo-400 {
        color: #f97316 !important;
        text-shadow: 0 0 10px rgba(249, 115, 22, 0.15) !important;
      }
      .theme-orange .text-purple-300, [class*="theme-orange"] .text-purple-300 {
        color: #fdba74 !important;
      }
      .theme-orange .bg-purple-500, [class*="theme-orange"] .bg-purple-500 {
        background-color: #ea580c !important;
        color: #ffffff !important;
        box-shadow: 0 0 15px rgba(234, 88, 12, 0.3) !important;
      }
      .theme-orange .bg-purple-500\\/10, [class*="theme-orange"] .bg-purple-500\\/10 {
        background-color: rgba(234, 88, 12, 0.12) !important;
      }
      .theme-orange .border-purple-500\\/30, [class*="theme-orange"] .border-purple-500\\/30 {
        border-color: rgba(234, 88, 12, 0.3) !important;
      }
      .theme-orange .bg-\\[\\#0e0d12\\]\\/50,
      .theme-orange .bg-\\[\\#0e0d12\\]\\/60,
      .theme-orange .bg-zinc-900\\/40,
      .theme-orange .bg-white\\/5,
      .theme-orange .bg-black\\/20,
      [class*="theme-orange"] .bg-\\[\\#0e0d12\\]\\/50,
      [class*="theme-orange"] .bg-\\[\\#0e0d12\\]\\/60 {
        background-color: rgba(26, 12, 5, 0.7) !important;
        border-color: rgba(234, 88, 12, 0.18) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.03) !important;
      }
      .theme-orange .border-zinc-850,
      .theme-orange .border-zinc-800,
      .theme-orange .border-white\\/10,
      [class*="theme-orange"] .border-zinc-850 {
        border-color: rgba(234, 88, 12, 0.18) !important;
      }
    `;
  } else if (activeColorGroup === "purple" || activeColorGroup === "purple-smart") {
    return `
      /* PURPLE THEME - "MIDNIGHT NEBULA" (Deep sci-fi, glowing orchid energy grid) */
      .theme-purple, .theme-purple-smart, [class*="theme-purple"] {
        background-color: #06020f !important;
        background-image: radial-gradient(#d946ef0c 1.5px, transparent 1.5px) !important;
        background-size: 24px 24px !important;
        color: #fdf4ff !important;
      }
      .theme-purple header, [class*="theme-purple"] header {
        background-color: rgba(14, 5, 28, 0.85) !important;
        border-color: rgba(168, 85, 247, 0.2) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 4px 30px rgba(168, 85, 247, 0.04) !important;
      }
      .theme-purple .bg-zinc-950, [class*="theme-purple"] .bg-zinc-950 {
        background-color: #120524 !important;
        border-color: rgba(168, 85, 247, 0.2) !important;
      }
      .theme-purple .text-purple-400,
      .theme-purple .text-indigo-400,
      [class*="theme-purple"] .text-purple-400,
      [class*="theme-purple"] .text-indigo-400 {
        color: #c084fc !important;
        text-shadow: 0 0 10px rgba(192, 132, 252, 0.2) !important;
      }
      .theme-purple .bg-\\[\\#0e0d12\\]\\/50,
      .theme-purple .bg-\\[\\#0e0d12\\]\\/60,
      .theme-purple .bg-zinc-900\\/40,
      .theme-purple .bg-white\\/5,
      .theme-purple .bg-black\\/20,
      [class*="theme-purple"] .bg-\\[\\#0e0d12\\]\\/50,
      [class*="theme-purple"] .bg-\\[\\#0e0d12\\]\\/60 {
        background-color: rgba(22, 8, 43, 0.72) !important;
        border-color: rgba(168, 85, 247, 0.18) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.04) !important;
      }
      .theme-purple .border-zinc-850,
      .theme-purple .border-zinc-800,
      .theme-purple .border-white\\/10,
      [class*="theme-purple"] .border-zinc-850 {
        border-color: rgba(168, 85, 247, 0.18) !important;
      }
    `;
  } else if (activeColorGroup === "teal-smart") {
    return `
      /* TEAL SMART THEME - "BIOLUMINESCENT GRID" (Peak human performance laser tech) */
      .theme-teal-smart, [class*="theme-teal"] {
        background-color: #010809 !important;
        background-image: radial-gradient(#14b8a60f 1.5px, transparent 1.5px) !important;
        background-size: 24px 24px !important;
        color: #f0fdfa !important;
      }
      .theme-teal-smart header, [class*="theme-teal"] header {
        background-color: rgba(2, 17, 20, 0.85) !important;
        border-color: rgba(20, 184, 166, 0.25) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 4px 30px rgba(20, 184, 166, 0.05) !important;
      }
      .theme-teal-smart .bg-zinc-950, [class*="theme-teal"] .bg-zinc-950 {
        background-color: #042426 !important;
        border-color: rgba(20, 184, 166, 0.25) !important;
      }
      .theme-teal-smart .text-purple-400,
      .theme-teal-smart .text-indigo-400,
      [class*="theme-teal"] .text-purple-400,
      [class*="theme-teal"] .text-indigo-400 {
        color: #2dd4bf !important;
        text-shadow: 0 0 10px rgba(45, 212, 191, 0.2) !important;
      }
      .theme-teal-smart .bg-purple-500, [class*="theme-teal"] .bg-purple-500 {
        background-color: #0d9488 !important;
        color: #ffffff !important;
        box-shadow: 0 0 15px rgba(20, 184, 166, 0.35) !important;
      }
      .theme-teal-smart .bg-purple-500\\/10, [class*="theme-teal"] .bg-purple-500\\/10 {
        background-color: rgba(20, 184, 166, 0.12) !important;
      }
      .theme-teal-smart .border-purple-500\\/30, [class*="theme-teal"] .border-purple-500\\/30 {
        border-color: rgba(20, 184, 166, 0.35) !important;
      }
      .theme-teal-smart .bg-\\[\\#0e0d12\\]\\/50,
      .theme-teal-smart .bg-\\[\\#0e0d12\\]\\/60,
      .theme-teal-smart .bg-zinc-900\\/40,
      .theme-teal-smart .bg-white\\/5,
      .theme-teal-smart .bg-black\\/20,
      [class*="theme-teal"] .bg-\\[\\#0e0d12\\]\\/50,
      [class*="theme-teal"] .bg-\\[\\#0e0d12\\]\\/60 {
        background-color: rgba(4, 25, 28, 0.72) !important;
        border-color: rgba(20, 184, 166, 0.18) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.04) !important;
      }
      .theme-teal-smart .border-zinc-850,
      .theme-teal-smart .border-zinc-800,
      .theme-teal-smart .border-white\\/10,
      [class*="theme-teal"] .border-zinc-850 {
        border-color: rgba(20, 184, 166, 0.18) !important;
      }
    `;
  } else if (activeColorGroup === "rose-smart") {
    return `
      /* ROSE SMART THEME - "QUANTUM ROSE" (Intense energy focus, neon crimson) */
      .theme-rose-smart, [class*="theme-rose"] {
        background-color: #090103 !important;
        background-image: radial-gradient(#f43f5e0c 1.5px, transparent 1.5px) !important;
        background-size: 24px 24px !important;
        color: #fff1f2 !important;
      }
      .theme-rose-smart header, [class*="theme-rose"] header {
        background-color: rgba(22, 3, 10, 0.85) !important;
        border-color: rgba(244, 63, 94, 0.25) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 4px 30px rgba(244, 63, 94, 0.05) !important;
      }
      .theme-rose-smart .bg-zinc-950, [class*="theme-rose"] .bg-zinc-950 {
        background-color: #2b0413 !important;
        border-color: rgba(244, 63, 94, 0.25) !important;
      }
      .theme-rose-smart .text-purple-400,
      .theme-rose-smart .text-indigo-400,
      [class*="theme-rose"] .text-purple-400,
      [class*="theme-rose"] .text-indigo-400 {
        color: #fb7185 !important;
        text-shadow: 0 0 10px rgba(251, 113, 133, 0.2) !important;
      }
      .theme-rose-smart .bg-purple-500, [class*="theme-rose"] .bg-purple-500 {
        background-color: #f43f5e !important;
        color: #ffffff !important;
        box-shadow: 0 0 15px rgba(244, 63, 94, 0.35) !important;
      }
      .theme-rose-smart .bg-purple-500\\/10, [class*="theme-rose"] .bg-purple-500\\/10 {
        background-color: rgba(244, 63, 94, 0.12) !important;
      }
      .theme-rose-smart .border-purple-500\\/30, [class*="theme-rose"] .border-purple-500\\/30 {
        border-color: rgba(244, 63, 94, 0.35) !important;
      }
      .theme-rose-smart .bg-\\[\\#0e0d12\\]\\/50,
      .theme-rose-smart .bg-\\[\\#0e0d12\\]\\/60,
      .theme-rose-smart .bg-zinc-900\\/40,
      .theme-rose-smart .bg-white\\/5,
      .theme-rose-smart .bg-black\\/20,
      [class*="theme-rose"] .bg-\\[\\#0e0d12\\]\\/50,
      [class*="theme-rose"] .bg-\\[\\#0e0d12\\]\\/60 {
        background-color: rgba(33, 5, 16, 0.72) !important;
        border-color: rgba(244, 63, 94, 0.18) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.04) !important;
      }
      .theme-rose-smart .border-zinc-850,
      .theme-rose-smart .border-zinc-800,
      .theme-rose-smart .border-white\\/10,
      [class*="theme-rose"] .border-zinc-850 {
        border-color: rgba(244, 63, 94, 0.18) !important;
      }
    `;
  } else if (activeColorGroup === "cyberpunk") {
    return `
      /* CYBERPUNK - "NEURAL SYNTHWAVE" (Ultra futuristic cyber hipster glow, gorgeous high contrast glass) */
      .theme-cyberpunk, [class*="theme-cyber"] {
        background-color: #040108 !important;
        background-image: 
          radial-gradient(#ec489912 1.5px, transparent 1.5px),
          linear-gradient(rgba(6, 182, 212, 0.02) 1px, transparent 1px) !important;
        background-size: 24px 24px, 48px 48px !important;
        color: #22d3ee !important;
      }
      .theme-cyberpunk header, [class*="theme-cyber"] header {
        background-color: rgba(10, 2, 22, 0.9) !important;
        border-bottom: 2px solid #ec4899 !important;
        box-shadow: 0 4px 25px rgba(236, 72, 153, 0.15) !important;
      }
      .theme-cyberpunk .bg-zinc-950, [class*="theme-cyber"] .bg-zinc-950 {
        background-color: #0a0414 !important;
        border: 1.5px solid rgba(236, 72, 153, 0.4) !important;
        box-shadow: inset 0 0 12px rgba(236, 72, 153, 0.1) !important;
      }
      .theme-cyberpunk .bg-\\[\\#0e0d12\\]\\/50,
      .theme-cyberpunk .bg-\\[\\#0e0d12\\]\\/60,
      .theme-cyberpunk .bg-zinc-900\\/40,
      .theme-cyberpunk .bg-white\\/5,
      .theme-cyberpunk .bg-black\\/20,
      [class*="theme-cyber"] .bg-\\[\\#0e0d12\\]\\/50,
      [class*="theme-cyber"] .bg-\\[\\#0e0d12\\]\\/60 {
        background-color: rgba(14, 4, 30, 0.8) !important;
        border: 1.5px solid rgba(236, 72, 153, 0.4) !important;
        backdrop-blur: 16px !important;
        border-radius: 20px !important;
        box-shadow: 4px 4px 0px #06b6d4, 0 10px 40px rgba(0, 0, 0, 0.6) !important;
      }
      .theme-cyberpunk .border-zinc-850,
      .theme-cyberpunk .border-zinc-800,
      .theme-cyberpunk .border-white\\/10,
      [class*="theme-cyber"] .border-zinc-850 {
        border-color: rgba(6, 182, 212, 0.3) !important;
      }
      .theme-cyberpunk button, [class*="theme-cyber"] button {
        border-radius: 12px !important;
        border: 1px solid rgba(6, 182, 212, 0.35) !important;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .theme-cyberpunk button:hover, [class*="theme-cyber"] button:hover {
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.4) !important;
        background-color: rgba(6, 182, 212, 0.1) !important;
      }
      .theme-cyberpunk .text-purple-400,
      .theme-cyberpunk .text-indigo-400,
      [class*="theme-cyber"] .text-purple-400,
      [class*="theme-cyber"] .text-slate-400 {
        color: #f472b6 !important;
        text-shadow: 0 0 8px rgba(244, 114, 182, 0.4) !important;
      }
      .theme-cyberpunk .bg-purple-500, [class*="theme-cyber"] .bg-purple-500 {
        background-color: #ec4899 !important;
        color: #ffffff !important;
        font-weight: 900 !important;
        border: 1.5px solid #22d3ee !important;
        box-shadow: 0px 0px 15px rgba(236, 72, 153, 0.5) !important;
      }
      .theme-cyberpunk input, .theme-cyberpunk textarea, [class*="theme-cyber"] input {
        border: 1px solid rgba(6, 182, 212, 0.4) !important;
        background-color: rgba(0,0,0,0.4) !important;
        color: #22d3ee !important;
      }
      .theme-cyberpunk input:focus, .theme-cyberpunk textarea:focus {
        border-color: #ec4899 !important;
        box-shadow: 0 0 10px rgba(236, 72, 153, 0.4) !important;
      }
    `;
  } else if (activeColorGroup === "emerald") {
    return `
      /* EMERALD - "JADE GLASS MATRIX" (Serene tech organic workspace style) */
      .theme-emerald, [class*="theme-emerald"] {
        background-color: #010603 !important;
        background-image: radial-gradient(#10b9810d 1.5px, transparent 1.5px) !important;
        background-size: 24px 24px !important;
        color: #f0fdf4 !important;
      }
      .theme-emerald header, [class*="theme-emerald"] header {
        background-color: rgba(2, 15, 7, 0.85) !important;
        border-color: rgba(16, 185, 129, 0.25) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 4px 30px rgba(16, 185, 129, 0.04) !important;
      }
      .theme-emerald .bg-zinc-950, [class*="theme-emerald"] .bg-zinc-950 {
        background-color: #031e0c !important;
        border-color: rgba(16, 185, 129, 0.25) !important;
      }
      .theme-emerald .bg-\\[\\#0e0d12\\]\\/50,
      .theme-emerald .bg-\\[\\#0e0d12\\]\\/60,
      .theme-emerald .bg-zinc-900\\/40,
      .theme-emerald .bg-white\\/5,
      .theme-emerald .bg-black\\/20,
      [class*="theme-emerald"] .bg-\\[\\#0e0d12\\]\\/50,
      [class*="theme-emerald"] .bg-\\[\\#0e0d12\\]\\/60 {
        background-color: rgba(4, 25, 11, 0.72) !important;
        border-color: rgba(16, 185, 129, 0.18) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.04) !important;
      }
      .theme-emerald .border-zinc-850,
      .theme-emerald .border-zinc-800,
      .theme-emerald .border-white\\/10,
      [class*="theme-emerald"] .border-zinc-850 {
        border-color: rgba(16, 185, 129, 0.18) !important;
      }
      .theme-emerald .text-purple-400,
      .theme-emerald .text-indigo-400,
      [class*="theme-emerald"] .text-purple-400,
      [class*="theme-emerald"] .text-indigo-400 {
        color: #34d399 !important;
        text-shadow: 0 0 10px rgba(52, 211, 153, 0.2) !important;
      }
      .theme-emerald .bg-purple-500, [class*="theme-emerald"] .bg-purple-500 {
        background-color: #059669 !important;
        color: #ffffff !important;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.35) !important;
      }
    `;
  } else if (activeColorGroup === "quantum") {
    return `
      /* QUANTUM FUSION THEME (Luxurious holographic smart AI vibe) */
      .theme-quantum, [class*="theme-quantum"] {
        background-color: #03030b !important;
        background-image: 
          radial-gradient(rgba(6, 182, 212, 0.15) 1.2px, transparent 1.2px),
          radial-gradient(rgba(168, 85, 247, 0.12) 1.5px, transparent 1.5px) !important;
        background-size: 20px 20px, 40px 40px !important;
        color: #e0f2fe !important;
      }
      .theme-quantum header, [class*="theme-quantum"] header {
        background-color: rgba(6, 4, 18, 0.85) !important;
        border-color: rgba(6, 182, 212, 0.3) !important;
        backdrop-blur: 16px !important;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(6, 182, 212, 0.1) !important;
      }
      .theme-quantum nav, [class*="theme-quantum"] nav {
        background-color: rgba(6, 4, 18, 0.85) !important;
        border-color: rgba(6, 182, 212, 0.2) !important;
      }
      .theme-quantum .bg-zinc-950, [class*="theme-quantum"] .bg-zinc-950 {
        background-color: #050515 !important;
        border: 1px solid rgba(6, 182, 212, 0.35) !important;
        box-shadow: inset 0 0 10px rgba(6, 182, 212, 0.05) !important;
      }
      .theme-quantum .bg-\\[\\#0e0d12\\]\\/50,
      .theme-quantum .bg-\\[\\#0e0d12\\]\\/60,
      .theme-quantum .bg-zinc-900\\/40,
      .theme-quantum .bg-white\\/5,
      .theme-quantum .bg-black\\/20,
      [class*="theme-quantum"] .bg-\\[\\#0e0d12\\]\\/50,
      [class*="theme-quantum"] .bg-\\[\\#0e0d12\\]\\/60 {
        background-color: rgba(8, 8, 26, 0.75) !important;
        border: 1px solid rgba(139, 92, 246, 0.25) !important;
        border-left: 2.5px solid rgba(6, 182, 212, 0.6) !important;
        backdrop-blur: 20px !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.04) !important;
      }
      .theme-quantum .border-zinc-850,
      .theme-quantum .border-zinc-800,
      .theme-quantum .border-white\\/10,
      [class*="theme-quantum"] .border-zinc-850 {
        border-color: rgba(6, 182, 212, 0.2) !important;
      }
      .theme-quantum .text-purple-400,
      .theme-quantum .text-indigo-400,
      [class*="theme-quantum"] .text-purple-400,
      [class*="theme-quantum"] .text-indigo-400 {
        color: #22d3ee !important;
        text-shadow: 0 0 8px rgba(34, 211, 238, 0.4) !important;
      }
      .theme-quantum .text-purple-300,
      [class*="theme-quantum"] .text-purple-300 {
        color: #c084fc !important;
        text-shadow: 0 0 8px rgba(192, 132, 252, 0.25) !important;
      }
      .theme-quantum .bg-purple-500, [class*="theme-quantum"] .bg-purple-500 {
        background-color: #06b6d4 !important;
        color: #ffffff !important;
        box-shadow: 0px 0px 18px rgba(6, 182, 212, 0.5) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
      .theme-quantum .bg-purple-500\\/10, [class*="theme-quantum"] .bg-purple-500\\/10 {
        background-color: rgba(6, 182, 212, 0.15) !important;
        color: #22d3ee !important;
      }
      .theme-quantum .border-purple-500\\/30, [class*="theme-quantum"] .border-purple-500\\/30 {
        border-color: rgba(6, 182, 212, 0.4) !important;
      }
      .theme-quantum input, .theme-quantum textarea, [class*="theme-quantum"] input {
        border: 1px solid rgba(6, 182, 212, 0.3) !important;
        background-color: rgba(3, 3, 10, 0.7) !important;
        color: #e0f2fe !important;
      }
      .theme-quantum input:focus, .theme-quantum textarea:focus {
        border-color: #a855f7 !important;
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.35) !important;
      }
    `;
  }
  return "";
}
