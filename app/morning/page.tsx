"use client";

import { useEffect, useState } from "react";

export default function MorningPage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch("/api/morning-brief")
            .then(r => r.json())
            .then(setData);
    }, []);

    if (!data) return <div>Loading...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Morning Brief Preview</h1>

            <h2>📬 Gmail</h2>
            {data.gmail.length === 0 && <p>No recent emails</p>}
            {data.gmail.map((mail: any, i: number) => (
                <div key={i} style={{ marginBottom: 10 }}>
                    <strong>{mail.subject}</strong>
                    <p>{mail.from} — {mail.date}</p>
                    <small>{mail.body.slice(0, 120)}...</small>
                </div>
            ))}

            <h2>💬 Slack</h2>
            {data.slack.length === 0 && <p>No recent messages</p>}
            {data.slack.map((msg: any, i: number) => (
                <div key={i} style={{ marginBottom: 10 }}>
                    <strong>{msg.user}</strong>
                    <p>{msg.text}</p>
                </div>
            ))}
        </div>
    );
}
