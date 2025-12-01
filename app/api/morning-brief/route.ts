/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { loadTokens } from "@/lib/tokens";
import dayjs from "dayjs";

async function fetchGmail(accessToken: string) {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const since = Math.floor(dayjs().subtract(1, "day").valueOf() / 1000);

    const list = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=newer_than:2d category:primary`,
        { headers }
    ).then(r => r.json());

    if (!list.messages) return [];

    const fullMessages = await Promise.all(

        list.messages.map(async (m: any) => {
            const msg = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
                { headers }
            ).then(r => r.json());

            const msgHeaders = msg.payload.headers;
            const get = (n: string) => msgHeaders.find((h: any) => h.name === n)?.value || "";

            let body = "";
            function extract(part: any) {
                if (!part) return;
                if (part.mimeType === "text/plain" && part.body?.data) {
                    body = Buffer.from(part.body.data, "base64").toString("utf-8");
                }
                if (part.parts) part.parts.forEach(extract);
            }
            extract(msg.payload);

            return {
                subject: get("Subject"),
                from: get("From"),
                date: get("Date"),
                body,
            };
        })
    );

    return fullMessages;
}

async function fetchSlack(token: string) {
    const headers = { Authorization: `Bearer ${token}` };

    const convoList = await fetch(
        "https://slack.com/api/conversations.list?types=im,mpim,private_channel,public_channel",
        { headers }
    ).then(r => r.json());

    if (!convoList.channels) return [];

    let messages: any[] = [];

    for (const ch of convoList.channels) {
        const hist = await fetch(
            `https://slack.com/api/conversations.history?channel=${ch.id}&limit=20`,
            { headers }
        ).then(r => r.json());

        if (!hist.messages) continue;

        messages.push(
            ...hist.messages
                .filter((m: any) => Number(m.ts) * 1000 > dayjs().subtract(1, "day").valueOf())
                .map((m: any) => ({
                    text: m.text,
                    user: m.user,
                    date: new Date(Number(m.ts) * 1000).toISOString(),
                }))
        );
    }

    return messages;
}

export async function GET() {
    const tokens = loadTokens();
    if (!tokens) return NextResponse.json({ error: "Not connected" });

    const gmail = tokens.accessToken ? await fetchGmail(tokens.accessToken) : [];
    const slack = tokens.slackToken ? await fetchSlack(tokens.slackToken) : [];

    return NextResponse.json({ gmail, slack });
}
