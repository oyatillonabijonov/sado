import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Noto'g'ri so'rov" },
      { status: 400 }
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // TODO: email integratsiyasi (Resend / Nodemailer). Hozircha log.
  console.log("[SADO contact]", parsed.data);

  return NextResponse.json({ ok: true });
}
