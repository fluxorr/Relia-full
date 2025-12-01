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

    // list all direct and group conversations
    const convoList = await fetch(
        "https://slack.com/api/conversations.list?types=im,mpim",
        { headers }
    ).then(r => r.json());

    if (!convoList.channels) return [];

    const usersCache: Record<string, string> = {};

    async function getUserName(id: string) {
        if (usersCache[id]) return usersCache[id];

        const userRes = await fetch(
            `https://slack.com/api/users.info?user=${id}`,
            { headers }
        ).then(r => r.json());

        const name =
            userRes.user?.real_name ||
            userRes.user?.name ||
            userRes.user?.profile?.display_name ||
            id;

        usersCache[id] = name;
        return name;
    }

    let messages: any[] = [];

    for (const ch of convoList.channels) {
        const hist = await fetch(
            `https://slack.com/api/conversations.history?channel=${ch.id}&limit=20`,
            { headers }
        ).then(r => r.json());

        if (!hist.messages) continue;

        for (const m of hist.messages) {
            const tsDate = new Date(Number(m.ts) * 1000);

            // recent only
            if (Date.now() - tsDate.getTime() <= 1000 * 60 * 60 * 24) {
                messages.push({
                    text: m.text,
                    from: await getUserName(m.user),
                    date: tsDate.toISOString(),
                });
            }
        }
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
