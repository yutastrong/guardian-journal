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
  以下は、人間のジャーナリング記録から生まれた「守護精霊」です。
  
  感情や記録から生まれた精神存在を描く、
日本のソーシャルゲーム風SSRキャラクター解析画面。

単なるファンタジーキャラではなく、
「精神」「感情」「内面世界」を可視化した存在。

ダークファンタジー×近未来UI×精神世界。

キャラクター単体ではなく、
“ゲーム内の存在解析画面”として構成する。

画面内には：

・レアリティ
・属性
・精神波形
・共鳴率
・感情解析
・能力一覧
・精神安定度
・現実接続率
・ストレス耐性
・夢想エネルギー
・形態変化
・システムメッセージ

などのUI情報を含める。

美しいだけではなく、
少し危うく、
感情的で、
精神性を感じる雰囲気。

ネオン紫、
青、
黒を基調にした
幻想的で情報量の多い画面構成。

日本語UI、
ゲーム風パラメータ、
能力アイコン、
解析パネル、
キャラクター説明欄、
データ表示を含める。

「記録から生まれた存在」
「感情の具現化」
「内面世界の住人」
というテーマを強く反映。

超高密度、
ソシャゲSSR、
コレクションカード、
キャラクター解析UI、
情報量多め、
アニメ調、
超美麗、
幻想的、
精神世界、
感情の可視化、
 masterpiece
  
  以下の守護精霊設定を元に描写してください。
  
  ${guardianText}
  `,
    size: "1024x1536",
  });

const imageBase64 = imageResult.data?.[0]?.b64_json;

return Response.json({
  text: guardianText,
  image: imageBase64,
});
}