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
            <button className="border-2 text-2xl px-4 py-2 cursor-pointer  border-dashed border-neutral-800 " onClick={handleLogin}>
                Login with Gmail
            </button>
        </div>
    )

}

