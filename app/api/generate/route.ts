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
  
  これは単なるキャラクターではありません。
  
  言葉、感情、記憶、苦悩、創造性が
  精神世界で融合し、
  超越存在として顕現したものです。
  
  人型に限定しないでください。
  
  守護精霊は、
  ドラゴン、獣、機械、仮面、
  魔導書、煙、結晶、異形、
  宇宙存在、黒い影、小動物、
  概念生命体など、
  自由な姿を取り得ます。
  
  「善悪」は人間側の尺度にすぎません。
  
  神秘、
  畏怖、
  美しさ、
  超越性、
  孤独、
  創造、
  静寂、
  狂気、
  優しさ、
  そういった感情が混ざった存在として描写してください。
  
  アニメ調すぎず、
  幻想画・ダークファンタジー・神話的アート寄り。
  
  スマホ壁紙にしたくなるほど、
  神秘的で印象的なビジュアル。
  
  背景込み。
  光や粒子や魔力の流れを含め、
  “顕現した瞬間”を描写してください。

  単なるキャラクターイラストではなく、
  「守護霊召喚記録カード」としてデザインしてください。

  ゲームUI、
  幻想図鑑、
  研究資料、
  魔導書ページ、
  召喚記録、
  アーカイブ画面のような構成。

  画面内に：

  ・属性
  ・レアリティ
  ・共鳴率
  ・精神傾向
  ・危険度
  ・顕現段階
  ・存在解説

  などの情報UIを含める。

  文字やシンボル、
  紋章、
  ゲージ、
  魔法陣、
  観測ログ、
  パラメータ表示などを入れてよい。

  全体として、
  「未知の存在を観測・記録している」
  雰囲気を強く出す。

  スマホゲームのSSRカード、
  幻想世界のデータベース、
  超常存在の解析画面のような
  高密度なビジュアルにする。
  
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