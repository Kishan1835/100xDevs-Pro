"use client";
import { useState } from "react";

export default function MatchesPage() {
    const [email, setEmail] = useState("u1@demo.dev");
    const [eventId, setEventId] = useState("");
    const [res, setRes] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const run = async () => {
        setLoading(true);
        const r = await fetch("/api/match", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, eventId })
        });
        setRes(await r.json());
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Find Matches</h1>
            <div className="space-y-2">
                <input className="border p-2 w-full rounded" value={email} onChange={e => setEmail(e.target.value)} placeholder="your email" />
                <input className="border p-2 w-full rounded" value={eventId} onChange={e => setEventId(e.target.value)} placeholder="eventId (see seed log)" />
                <button onClick={run} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50" disabled={loading}>
                    {loading ? "Matching..." : "Get Matches"}
                </button>
            </div>
            {res && (
                <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">{JSON.stringify(res, null, 2)}</pre>
            )}
        </div>
    );
}
