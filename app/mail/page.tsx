"use client"
import { useEffect, useState } from "react";

export default function MailList() {
    const [mails, setMails] = useState([]);

    useEffect(() => {
        fetch("/api/gmail/messages")
            .then(res => res.json())
            .then(setMails);
    }, []);

    return (
        <ul>
            {mails.map(m => (
                //@ts-expect-error fuck ts
                <li key={m.id}>
                    {/*@ts-expect-error fuck ts */}
                    Email ID: {m.id}
                </li>
            ))}
        </ul>
    );
}
