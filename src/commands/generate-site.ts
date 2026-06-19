import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";

/**
 * Generate a standalone static HTML page from an exported ANVL project JSON.
 * The output is a single self-contained HTML file you can host anywhere
 * (IPFS, GitHub Pages, Cloudflare Pages, Netlify, etc.)
 */
export async function generateSiteCommand(jsonPath: string, opts: { out?: string; template?: string }): Promise<void> {
  const spinner = ora("Generating site…").start();

  if (!fs.existsSync(jsonPath)) {
    spinner.fail(`File not found: ${jsonPath}`);
    process.exit(1);
  }

  let project: { coinData: Record<string, unknown> };
  try {
    project = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch {
    spinner.fail("Invalid JSON file");
    process.exit(1);
  }

  const d = project.coinData ?? {};
  const socials = (d.socials as Record<string, string>) ?? {};

  const html = buildHtml(d, socials);

  const ticker = ((d.ticker as string) ?? "coin").toLowerCase();
  const outFile = opts.out ?? path.join(path.dirname(jsonPath), `${ticker}-site.html`);
  fs.writeFileSync(outFile, html, "utf8");

  spinner.succeed(`Static site generated`);
  console.log();
  console.log(chalk.dim("  Output: "), chalk.white(outFile));
  console.log(chalk.dim("  Size:   "), chalk.white((Buffer.byteLength(html) / 1024).toFixed(1) + " KB"));
  console.log();
  console.log(chalk.dim("  Deploy options:"));
  console.log(chalk.dim("    Cloudflare Pages: drag-and-drop at pages.cloudflare.com"));
  console.log(chalk.dim("    IPFS:             ipfs add " + outFile));
  console.log();
}

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildHtml(d: Record<string, unknown>, s: Record<string, string>): string {
  const name     = esc(d.name ?? "COIN");
  const ticker   = esc(d.ticker ?? "COIN");
  const tagline  = esc(d.tagline ?? "");
  const lore     = esc(d.lore ?? "");
  const about    = esc(d.about ?? "");
  const howToBuy = esc(d.howToBuy ?? "");
  const disclaimer = esc(d.disclaimer ?? "");
  const primary  = esc(d.primaryColor ?? "#F5A623");
  const bg       = esc(d.bgColor ?? "#0F0F1A");
  const logoUrl  = esc(d.logoUrl ?? "");
  const buyLink  = esc(s.buyLink ?? s.dexscreener ?? "#");
  const dexLink  = esc(s.dexscreener ?? "#");

  const roadmap = Array.isArray(d.roadmap)
    ? (d.roadmap as Array<{ phase?: string; title?: string; description?: string; date?: string; done?: boolean }>)
        .map((r) => `
          <div class="rm-item${r.done ? " done" : ""}">
            <div class="rm-phase">${esc(r.phase)}</div>
            <div class="rm-title">${esc(r.title)}</div>
            <div class="rm-desc">${esc(r.description)}</div>
            <div class="rm-date">${esc(r.date)}</div>
          </div>`).join("")
    : "<p style='color:var(--muted)'>No roadmap defined.</p>";

  const socialLinks = [
    ["Telegram",    s.telegram],
    ["Twitter",     s.twitter],
    ["Discord",     s.discord],
    ["DexScreener", s.dexscreener],
  ].filter(([, v]) => v).map(([label, href]) =>
    `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="soc-link">${label}</a>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${tagline}">
  <title>$${ticker} — ${name}</title>
  <style>
    :root { --p:${primary}; --bg:${bg}; --text:#E0E0F0; --muted:#888899; --border:#2A2A3E; --card:#18182A; }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;}
    a{color:var(--p);text-decoration:none;}
    .hero{text-align:center;padding:96px 24px 64px;border-bottom:1px solid var(--border);}
    .logo{width:100px;height:100px;border-radius:50%;border:2px solid var(--p);box-shadow:0 0 32px var(--p);object-fit:cover;margin-bottom:24px;}
    .badge{display:inline-block;background:var(--p);color:#000;font-weight:700;font-size:13px;padding:3px 14px;border-radius:999px;letter-spacing:2px;margin-bottom:16px;}
    h1{font-size:clamp(2rem,6vw,4rem);font-weight:800;margin-bottom:12px;}
    .tagline{color:var(--muted);font-size:1.1rem;margin-bottom:36px;}
    .cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
    .btn{padding:12px 32px;border-radius:6px;font-weight:700;font-size:14px;letter-spacing:1px;}
    .btn-fill{background:var(--p);color:#000;}
    .btn-outline{border:1px solid var(--p);color:var(--p);}
    section{max-width:860px;margin:0 auto;padding:72px 24px;}
    h2{font-size:1.5rem;font-weight:700;color:var(--p);margin-bottom:24px;text-transform:uppercase;letter-spacing:2px;}
    p{color:var(--muted);font-size:1.02rem;}
    .rm-item{padding:20px 24px;border:1px solid var(--border);border-radius:8px;margin-bottom:12px;display:grid;grid-template-columns:1fr auto;}
    .rm-item.done{border-color:var(--p);}
    .rm-phase{font-size:11px;color:var(--p);text-transform:uppercase;letter-spacing:1px;grid-column:1;margin-bottom:4px;}
    .rm-title{font-weight:600;grid-column:1;}
    .rm-desc{color:var(--muted);font-size:.9rem;grid-column:1;}
    .rm-date{color:var(--muted);font-size:12px;grid-column:2;grid-row:1/4;align-self:center;padding-left:16px;white-space:nowrap;}
    footer{border-top:1px solid var(--border);padding:48px 24px;text-align:center;}
    .soc-link{display:inline-block;border:1px solid var(--border);color:var(--muted);padding:8px 18px;border-radius:4px;font-size:13px;font-weight:600;margin:4px;}
    .soc-link:hover{border-color:var(--p);color:var(--p);}
    .disclaimer{font-size:11px;color:var(--muted);max-width:600px;margin:24px auto 16px;}
    .built-with{font-size:11px;color:var(--muted);}
  </style>
</head>
<body>

  <header class="hero">
    ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="${name} logo" onerror="this.style.display='none'">` : ""}
    <div class="badge">$${ticker}</div>
    <h1>${name}</h1>
    <p class="tagline">${tagline}</p>
    <div class="cta-row">
      <a href="${buyLink}" target="_blank" rel="noopener noreferrer" class="btn btn-fill">BUY $${ticker}</a>
      <a href="${dexLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">DEXSCREENER</a>
    </div>
  </header>

  ${about ? `<section><h2>About</h2><p>${about}</p></section>` : ""}
  ${lore   ? `<section style="background:var(--card);max-width:100%;"><div style="max-width:860px;margin:0 auto;padding:72px 24px;"><h2>Lore</h2><p>${lore}</p></div></section>` : ""}

  <section>
    <h2>Roadmap</h2>
    <div>${roadmap}</div>
  </section>

  ${howToBuy ? `<section><h2>How to Buy</h2><p>${howToBuy}</p></section>` : ""}

  <footer>
    <div>${socialLinks}</div>
    ${disclaimer ? `<p class="disclaimer">${disclaimer}</p>` : ""}
    <p class="built-with">Built with <a href="https://anvl.site">ANVL</a></p>
  </footer>

</body>
</html>`;
}
