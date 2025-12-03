import { NextResponse } from "next/server";
import { loadTokens } from "@/lib/tokens";

function encodeMessage(str: string) {
    return Buffer.from(str)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function GET() {
    const tokens = loadTokens();
    if (!tokens?.accessToken) {
        return NextResponse.json({ error: "Not logged in with Gmail" }, { status: 401 });
    }

    // Fetch the user profile to get the actual Gmail address
    const profile = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/profile",
        {
            headers: { Authorization: `Bearer ${tokens.accessToken}` }
        }
    ).then(r => r.json());

    const toEmail = profile?.emailAddress;
    if (!toEmail) {
        return NextResponse.json({ error: "Unable to get Gmail profile" }, { status: 500 });
    }

    // Get morning brief data
    const brief = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/morning-brief`)
        .then(r => r.json());

    const emailText = `
            Morning ${toEmail.split("@")[0]},

            These are the things that should be in your attention today:

            ${brief.summary}

            Make progress on the important stuff.
`.trim();

    const rawEmail = [
        `From: Me <${toEmail}>`,
        `To: ${toEmail}`,
        "Subject: Your Morning Brief",
        "Content-Type: text/plain; charset=UTF-8",
        "",
        emailText,
    ].join("\r\n");

    const encodedMessage = encodeMessage(rawEmail);

    const sendRes = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw: encodedMessage }),
        }
    ).then(r => r.json());

    console.log(toEmail, '\n', rawEmail)

    return NextResponse.json({ status: "email_sent", sendRes });
}
