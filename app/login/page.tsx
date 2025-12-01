"use client";

export default function LoginButton() {
    const handleLogin = () => {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
            response_type: "code",
            scope: "https://www.googleapis.com/auth/gmail.readonly",
            access_type: "offline",
            prompt: "consent"
        });

        window.location.href =
            "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
    };

    return (
        <div className="flex justify-center items-center h-screen" >
            <button
                className="border-2 text-2xl px-4 py-2 cursor-pointer border-dashed border-neutral-800 text-transparent bg-clip-text"
                onClick={handleLogin}
                style={{
                    backgroundImage: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                Login with Gmail
            </button>
            <SlackLoginButton />
        </div>
    )

}




function SlackLoginButton() {
    const handleLogin = () => {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
            scope: "im:history,mpim:history,channels:history,groups:history,users:read",
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`,
        });

        window.location.href =
            "https://slack.com/oauth/v2/authorize?" + params.toString();
    };

    return (
        <button className="border-2 text-2xl text-purple-500 px-4 py-2 cursor-pointer  border-dashed border-neutral-800 " onClick={handleLogin}>
            Login with Slack
        </button>
    )
}
