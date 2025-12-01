import { NextResponse } from "next/server";
import { saveTokens } from "@/lib/tokens";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) return NextResponse.json({ error: "Missing code" });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
            grant_type: "authorization_code",
        }),
    }).then(r => r.json());

    console.log("TOKEN RESPONSE:", tokenRes);

    if (!tokenRes.access_token) {
        return NextResponse.json({ error: tokenRes }, { status: 400 });
    }

    const expiry = new Date(Date.now() + tokenRes.expires_in * 1000);

    saveTokens({
        accessToken: tokenRes.access_token,
        refreshToken: tokenRes.refresh_token,
        expiryDate: expiry.toISOString(),
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/mail`);

}
