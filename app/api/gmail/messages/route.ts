/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { NextResponse } from "next/server";
import { loadTokens, saveTokens } from "@/lib/tokens";

async function refreshAccess(refreshToken: string) {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
        }),
    }).then((r) => r.json());

    const expiry = new Date(Date.now() + tokenRes.expires_in * 1000);

    saveTokens({
        accessToken: tokenRes.access_token,
        refreshToken,
        expiryDate: expiry.toISOString(),
    });

    return tokenRes.access_token;
}

function extractPlainTextBody(payload: any): string {
    let bodyData = "";

    function findPart(part: any) {
        if (!part) return;

        if (part.mimeType === "text/plain" && part.body?.data) {
            bodyData = Buffer.from(part.body.data, "base64").toString("utf-8");
        }

        if (part.parts) {
            part.parts.forEach(findPart);
        }
    }

    findPart(payload);
    return bodyData;
}

export async function GET() {
    const tokens = loadTokens();
    if (!tokens) return NextResponse.json({ error: "Not logged in" });

    let { accessToken, refreshToken, expiryDate } = tokens;

    if (new Date(expiryDate) < new Date()) {
        accessToken = await refreshAccess(refreshToken);
    }

    const baseHeaders = { Authorization: `Bearer ${accessToken}` };

    // 1️⃣ Only fetch Primary Inbox emails
    const list = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=category:primary",
        { headers: baseHeaders }
    ).then((res) => res.json());

    if (!list.messages) return NextResponse.json([]);

    // 2️⃣ Fetch full data for each message
    const fullMessages = await Promise.all(
        list.messages.map(async (m: any) => {
            const msg = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
                { headers: baseHeaders }
            ).then((res) => res.json());

            const headers = msg.payload.headers;
            const getHeader = (name: string) =>
                headers.find((h: any) => h.name === name)?.value || "";

            const body = extractPlainTextBody(msg.payload);

            return {
                id: msg.id,
                snippet: msg.snippet,
                subject: getHeader("Subject"),
                from: getHeader("From"),
                date: getHeader("Date"),
                body, // Full decoded body here
            };
        })
    );

    return NextResponse.json(fullMessages);
}

// rahul