/* eslint-disable prefer-const */
import { NextResponse } from "next/server";
import { loadTokens } from "@/lib/tokens";

export async function GET() {
    const tokens = loadTokens();
    if (!tokens?.slackToken) return NextResponse.json({ error: "Slack not connected" });

    const headers = { Authorization: `Bearer ${tokens.slackToken}` };

    // List DM conversations first
    const convoList = await fetch(
        "https://slack.com/api/conversations.list?types=im",
        { headers }
    ).then(r => r.json());

    if (!convoList.channels) return NextResponse.json([]);

    let messages: unknown[] = [];

    for (const channel of convoList.channels) {
        const hist = await fetch(
            `https://slack.com/api/conversations.history?channel=${channel.id}&limit=20`,
            { headers }
        ).then(r => r.json());

        if (hist.messages) {
            messages.push(...hist.messages.map(m => ({
                user: m.user,
                text: m.text,
                ts: m.ts,
                channel: channel.id
            })));
        }
    }

    return NextResponse.json(messages);
}
