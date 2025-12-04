export function MorningBriefEmail({ summary, actionItems }: any) {
    return (
        <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
            <h2>Morning. Here&apos;s what matters today:</h2>

            <p style={{ whiteSpace: "pre-line" }}>{summary}</p>

            <h3 style={{ marginTop: "20px" }}>Action Items</h3>
            <ul>
                {actionItems.map((item: any, i: number) => (
                    <li key={i}>
                        {item.text}
                        {item.priority === "high" && " 🔥"}
                        {item.due && ` (Due: ${item.due})`}
                    </li>
                ))}
            </ul>

            <p style={{ marginTop: "30px" }}>
                Make progress on the important stuff.
            </p>
        </div>
    );
}
