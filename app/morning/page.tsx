/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";

export default function MorningPage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch("/api/morning-brief")
            .then(r => r.json())
            .then(setData);
    }, []);

    if (!data) return <div className="p-10 text-gray-300">Loading...</div>;

    return (
        <div className="p-8 space-y-12">
            <h1 className="text-5xl font-bold">Morning Brief</h1>
            <h1 className="text-3xl font-bold mb-4">Morning Brief</h1>

            {data.summary && (
                <div className="mb-8 p-4 bg-zinc-900 border border-neutral-500/40 border-dashed rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Summary</h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                        {data.summary}
                    </p>
                </div>
            )}


            {/* Gmail Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">📬 Gmail</h2>
                {data.gmail.length === 0 && <p className="text-zinc-200">No recent emails</p>}
                <div className="space-y-4">
                    {data.gmail.map((mail: any, i: number) => (
                        <div key={i} className="border  border-neutral-500/30 border-dashed rounded-lg p-4 bg-zinc-900 shadow-sm">
                            <p className="font-semibold">{mail.subject}</p>
                            <p className="text-sm text-zinc-300">{mail.from}</p>
                            <p className="text-xs text-zinc-400 mb-2">{mail.date}</p>
                            <p className="text-zinc-400 line-clamp-3">{mail.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Slack Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">💬 Slack</h2>
                {data.slack.length === 0 && <p className="text-zinc-200">No recent messages</p>}
                <div className="space-y-4">
                    {data.slack.map((msg: any, i: number) => (
                        <div key={i} className="border  border-neutral-500/30 border-dashed rounded-lg p-4 bg-zinc-900 shadow-sm">
                            <p className="font-semibold">{msg.from}</p>
                            <p className="text-zinc-300">{msg.text}</p>
                            <p className="text-xs text-zinc-400">{new Date(msg.date).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
