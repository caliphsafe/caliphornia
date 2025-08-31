"use client";

export default function TestPage() {
  async function subscribe() {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
    const data = await res.json();
    alert(JSON.stringify(data));
  }

  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1>Subscribe Test</h1>
      <p>Clicks POST to <code>/api/subscribe</code> with <code>test@example.com</code>.</p>
      <button onClick={subscribe} style={{ padding: "10px 16px", cursor: "pointer" }}>
        Test Subscribe
      </button>
    </main>
  );
}
