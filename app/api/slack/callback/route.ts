import { NextResponse } from "next/server";
import { saveTokens } from "@/lib/tokens";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
        console.log("NO CODE - Slack callback not triggered with code");
        return NextResponse.json({ error: "Missing code" });
    }

    const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        body: new URLSearchParams({
            code,
            client_id: process.env.SLACK_CLIENT_ID!,
            client_secret: process.env.SLACK_CLIENT_SECRET!,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`,
        }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).then(r => r.json());

    console.log("SLACK TOKEN RESPONSE:", tokenRes);

    if (!tokenRes.ok) {
        return NextResponse.json({ error: tokenRes }, { status: 400 });
    }

    saveTokens({
        slackToken: tokenRes.authed_user.access_token,
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/api/slack/messages}`);
}
