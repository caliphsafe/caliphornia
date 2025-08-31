diff --git a/lib/supabase-admin.ts b/lib/supabase-admin.ts
new file mode 100644
index 0000000..1111111
--- /dev/null
+++ b/lib/supabase-admin.ts
@@ -0,0 +1,18 @@
+import 'server-only'
+import { createClient } from '@supabase/supabase-js'
+
+// Server-side client using the service role key.
+// This file must NEVER be imported by client components.
+const SUPABASE_URL = process.env.SUPABASE_URL
+const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
+
+if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
+  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
+}
+
+export const supabaseAdmin = createClient(
+  SUPABASE_URL,
+  SUPABASE_SERVICE_ROLE_KEY,
+  { auth: { persistSession: false } }
+)
+
