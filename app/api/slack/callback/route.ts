import { NextResponse } from "next/server";
import { saveTokens } from "@/lib/tokens";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
        console.log(">> Missing code");
        return NextResponse.json({ error: "Missing code" });
    }

    const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.SLACK_CLIENT_ID!,
            client_secret: process.env.SLACK_CLIENT_SECRET!,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`,
        }),
    }).then(r => r.json());

    console.log("SLACK TOKEN RESPONSE:", tokenRes);

    if (!tokenRes.ok) {
        return NextResponse.json({ error: tokenRes }, { status: 400 });
    }

    const slackToken =
        tokenRes.authed_user?.access_token || tokenRes.access_token;

    if (!slackToken) {
        return NextResponse.json({ error: "No Slack user token" }, { status: 400 });
    }

    saveTokens({ slackToken });

    return NextResponse.redirect(new URL("/", `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/messages`,));
}
