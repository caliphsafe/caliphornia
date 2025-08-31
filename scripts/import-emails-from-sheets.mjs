diff --git a/scripts/import-emails-from-sheets.mjs b/scripts/import-emails-from-sheets.mjs
new file mode 100644
index 0000000..1111111
--- /dev/null
+++ b/scripts/import-emails-from-sheets.mjs
@@ -0,0 +1,239 @@
+/**
+ * Import emails from a Google Sheets URL into the `public.emails` table.
+ * - No repo deps added. Uses Node 18+ built-in `fetch`.
+ * - Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from env.
+ * - Upserts by unique `email` (lowercased, trimmed).
+ *
+ * Usage:
+ *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-emails-from-sheets.mjs "https://docs.google.com/spreadsheets/d/XXXX/edit?usp=sharing"
+ *
+ * Optional flags:
+ *   --source="d2c-import"   (sets `source` column if none provided in sheet)
+ *   --dry-run               (parse and print counts, but do not write)
+ */
+
+import { createRequire } from 'node:module'
+const require = createRequire(import.meta.url)
+const { createClient } = require('@supabase/supabase-js')
+
+// --- helpers ---
+const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
+
+function toCsvExportUrl(sheetUrl) {
+  // Turns .../edit?usp=sharing into .../export?format=csv
+  try {
+    const u = new URL(sheetUrl)
+    if (!u.hostname.includes('docs.google.com')) return sheetUrl
+    const parts = u.pathname.split('/')
+    // Expect: /spreadsheets/d/<id>/edit
+    const idIdx = parts.indexOf('d') + 1
+    const id = parts[idIdx]
+    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`
+  } catch {
+    return sheetUrl
+  }
+}
+
+// Minimal CSV parser (handles quotes, commas, newlines)
+function parseCSV(text) {
+  const rows = []
+  let cur = ['']
+  let inQuotes = false
+
+  for (let i = 0; i < text.length; i++) {
+    const c = text[i]
+    const next = text[i + 1]
+    if (inQuotes) {
+      if (c === '"' && next === '"') {
+        // Escaped quote
+        cur[cur.length - 1] += '"'
+        i++
+      } else if (c === '"') {
+        inQuotes = false
+      } else {
+        cur[cur.length - 1] += c
+      }
+    } else {
+      if (c === '"') {
+        inQuotes = true
+      } else if (c === ',') {
+        cur.push('')
+      } else if (c === '\n') {
+        rows.push(cur)
+        cur = ['']
+      } else if (c === '\r') {
+        // ignore CR, handle CRLF
+      } else {
+        cur[cur.length - 1] += c
+      }
+    }
+  }
+  rows.push(cur)
+  return rows
+}
+
+function headerMap(headers) {
+  const map = {}
+  headers.forEach((h, i) => {
+    const key = String(h || '').trim().toLowerCase()
+    map[key] = i
+  })
+  return map
+}
+
+function pickEmailAndSource(rows, defaultSource) {
+  if (!rows.length) return { records: [], skipped: 0 }
+  const headers = rows[0]
+  const map = headerMap(headers)
+  const emailIdx =
+    map['email'] ??
+    map['emails'] ??
+    map['e-mail'] ??
+    map['address'] ??
+    undefined
+  const sourceIdx = map['source']
+  if (emailIdx === undefined) {
+    throw new Error(
+      `Could not find an "email" column header. Found headers: ${headers
+        .map((h) => `"${h}"`)
+        .join(', ')}`
+    )
+  }
+  const records = []
+  let skipped = 0
+  for (let r = 1; r < rows.length; r++) {
+    const row = rows[r]
+    if (!row || !row.length) continue
+    const raw = String(row[emailIdx] || '').trim().toLowerCase()
+    if (!raw) {
+      skipped++
+      continue
+    }
+    if (!EMAIL_REGEX.test(raw)) {
+      skipped++
+      continue
+    }
+    const source =
+      (sourceIdx !== undefined ? String(row[sourceIdx] || '').trim() : '') ||
+      defaultSource
+    records.push({ email: raw, source })
+  }
+  return { records, skipped }
+}
+
+async function upsertChunk(supabase, chunk) {
+  // Use upsert on conflict with unique(email)
+  const { error } = await supabase
+    .from('emails')
+    .upsert(chunk, { onConflict: 'email', ignoreDuplicates: false })
+  if (error) throw error
+}
+
+async function main() {
+  const args = process.argv.slice(2)
+  if (!args[0]) {
+    console.error('Usage: node scripts/import-emails-from-sheets.mjs "<google-sheets-url>" [--source="d2c-import"] [--dry-run]')
+    process.exit(1)
+  }
+  const sheetUrl = args[0]
+  const dryRun = args.some((a) => a === '--dry-run')
+  const sourceArg = args.find((a) => a.startsWith('--source='))
+  const defaultSource = sourceArg ? sourceArg.split('=').slice(1).join('=').replace(/^["']|["']$/g, '') : 'import'
+
+  const SUPABASE_URL = process.env.SUPABASE_URL
+  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
+  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
+    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.')
+    process.exit(1)
+  }
+  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
+    auth: { persistSession: false },
+  })
+
+  const csvUrl = toCsvExportUrl(sheetUrl)
+  console.log(`Fetching CSV from: ${csvUrl}`)
+  const res = await fetch(csvUrl)
+  if (!res.ok) {
+    console.error(`Failed to download CSV: ${res.status} ${res.statusText}`)
+    process.exit(1)
+  }
+  const text = await res.text()
+  const rows = parseCSV(text)
+  const { records, skipped } = pickEmailAndSource(rows, defaultSource)
+
+  // Dedupe by email within the file
+  const seen = new Set()
+  const deduped = []
+  for (const rec of records) {
+    if (seen.has(rec.email)) continue
+    seen.add(rec.email)
+    deduped.push(rec)
+  }
+
+  console.log(`Parsed: ${records.length} valid emails (skipped ${skipped}). After in-file dedupe: ${deduped.length}.`)
+  if (dryRun) {
+    console.log('Dry run: not writing to Supabase.')
+    process.exit(0)
+  }
+
+  // Chunked upsert to avoid payload limits
+  const CHUNK = 500
+  let written = 0
+  for (let i = 0; i < deduped.length; i += CHUNK) {
+    const chunk = deduped.slice(i, i + CHUNK)
+    await upsertChunk(supabase, chunk)
+    written += chunk.length
+    console.log(`Upserted ${written}/${deduped.length}...`)
+  }
+  console.log('Done.')
+}
+
+main().catch((e) => {
+  console.error(e)
+  process.exit(1)
+})
