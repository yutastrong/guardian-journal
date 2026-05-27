import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  // 直近3件取得
  const { data: journals, error } = await supabase
    .from("journals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // journalを文字列化
  const journalText = journals
    ?.map((j) => j.content)
    .join("\n");

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "あなたはジャーナリングから守護霊を生成するAIです。",
      },
      {
        role: "user",
        content: `
以下のジャーナリング記録から、
守護霊を生成してください。

${journalText}

守護霊の
・名前
・レアリティ
・属性
・見た目
・性格
・説明
を出力してください。
`,
      },
    ],
  });

  const guardianText = completion.choices[0].message.content || "";

const imageResult = await client.images.generate({
  model: "gpt-image-1",
  prompt: `
以下の守護霊を、
幻想的なダークファンタジー風に描いてください。

${guardianText}

背景込み。
神秘的。
アニメRPG風。
`,
  size: "1024x1024",
});

const imageBase64 = imageResult.data?.[0]?.b64_json;

return Response.json({
  text: guardianText,
  image: imageBase64,
});
}