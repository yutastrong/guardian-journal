import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const { content } = body;

  const { data, error } = await supabase
    .from("journals")
    .insert([{ content }])
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}