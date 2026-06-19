# anvl-cli

CLI toolkit for the [ANVL](https://anvl.site) memecoin launch platform.

## Install

```bash
npm install -g anvl-cli
# or run without installing:
npx anvl-cli <command>
```

## Commands

### `anvl balance <wallet>`

Check `$ANVL` balance and tier for any Solana wallet.

```bash
anvl balance 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

#   Wallet    7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
#   Balance   125,000 $ANVL
#   Tier      SMITH
```

Options:
- `--rpc <url>` — custom Solana RPC (default: mainnet-beta)
- `--mint <addr>` — override ANVL mint address

---

### `anvl export <store-json>`

Export projects from a `localStorage` dump to individual JSON files.

**How to get your localStorage data:**
1. Open your ANVL site → DevTools → Application → Local Storage
2. Copy the value of `anvl_projects_v1`
3. Save to file: `echo 'PASTE' > anvl-store.json`

```bash
anvl export ./anvl-store.json --out ./my-projects

#  ✔ RetroWave Coin  → ./my-projects/retro.json
#  ✔ Moon Dog        → ./my-projects/mdog.json
#  Exported 2 project(s)
```

Options:
- `--out <dir>` — output directory (default: `./anvl-export`)
- `--id <id>` — export only one specific project

---

### `anvl generate-site <project-json>`

Generate a standalone static HTML coin site from an exported project JSON.  
The output is a **single self-contained HTML file** you can host anywhere.

```bash
anvl generate-site ./my-projects/retro.json --out ./retro-site.html

#  ✔ Static site generated
#  Output:  ./retro-site.html
#  Size:    18.4 KB
```

Deploy the HTML file to:
- **Cloudflare Pages** — drag and drop at pages.cloudflare.com
- **IPFS** — `ipfs add retro-site.html`
- **GitHub Pages** — commit to `gh-pages` branch
- **Netlify** — drag and drop at app.netlify.com

Options:
- `--out <file>` — output file path

---

## Environment Variables

| Variable | Description |
|---|---|
| `ANVL_MINT` | `$ANVL` mint address (for `balance` command) |

## License

MIT
