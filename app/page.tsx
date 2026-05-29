"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [guardian, setGuardian] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");

  async function saveJournal() {
    if (!content.trim()) {
      setMessage("記述を入力してください");
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/journals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      setMessage("保存に失敗しました");
      setLoading(false);
      return;
    }

    setContent("");
    setMessage("記述を保存しました");
    setLoading(false);
  }

  async function generateGuardian() {
    setLoading(true);
    setMessage("");
    setGuardian("");

    const res = await fetch("/api/generate", {
      method: "POST",
    });

    if (!res.ok) {
      setMessage("守護霊の生成に失敗しました");
      setLoading(false);
      return;
    }

    const data = await res.json();
      setGuardian(data.text);
      setImage(`data:image/png;base64,${data.image}`);
      setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-5 py-8">
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-purple-300 mb-2">Guardian Journal</p>

        <h1 className="text-3xl font-bold mb-3">
          言葉から守護霊を顕現する
        </h1>

        <p className="text-slate-300 mb-8">
          今日の感情、思考、出来事を自由に記述してください。
        </p>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今日の残響を記述する..."
          className="w-full h-48 rounded-xl bg-slate-900 border border-purple-500/40 p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={saveJournal}
            disabled={loading}
            className="flex-1 rounded-xl bg-purple-600 py-3 font-bold hover:bg-purple-500 disabled:opacity-50"
          >
            記述を保存
          </button>

          
        </div>

        {loading && (
          <p className="mt-4 text-purple-300">
            共鳴中...
          </p>
        )}

        {message && (
          <p className="mt-4 text-slate-300">
            {message}
          </p>
        )}

        {guardian && (
          <section className="mt-8 rounded-2xl border border-purple-500/40 bg-slate-900 p-5 whitespace-pre-wrap leading-relaxed">
            <h2 className="text-xl font-bold mb-4 text-purple-300">
              顕現した守護霊
            </h2>

            

            {guardian}
          </section>
        )}
      </div>
    </main>
  );
}