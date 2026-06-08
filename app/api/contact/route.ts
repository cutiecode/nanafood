import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, message } = await req.json();
    if (!email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await resend.emails.send({
      from: "NanaFood <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL!,
      subject: `[Nana's African Food] New message — ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #743306;">New message from NanaFood website</h2>
          <p><strong>From:</strong> ${email}</p>
          <hr style="border-color: #ECD8B6;" />
          <p style="line-height: 1.8; color: #333;">${message.replace(/\n/g, "<br/>")}</p>
        </div>
      `,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}