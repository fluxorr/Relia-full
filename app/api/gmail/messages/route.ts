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
    }).then(r => r.json());

    const newExpiry = new Date(Date.now() + tokenRes.expires_in * 1000);

    saveTokens({
        accessToken: tokenRes.access_token,
        refreshToken,
        expiryDate: newExpiry.toISOString(),
    });

    return tokenRes.access_token;
}

export async function GET() {
    const stored = loadTokens();
    if (!stored) return NextResponse.json({ error: "Not logged in" });

    let { accessToken, refreshToken, expiryDate } = stored;

    if (!accessToken || !refreshToken) {
        return NextResponse.json({ error: "Invalid tokens" });
    }

    if (new Date(expiryDate) < new Date()) {
        accessToken = await refreshAccess(refreshToken);
    }

    const res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30",
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    ).then(r => r.json());

    return NextResponse.json(res);
}
