import fs from "fs";
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), "tokens.json");

export function saveTokens(tokens: {
    accessToken: string;
    refreshToken: string;
    expiryDate: string;
}) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

export function loadTokens() {
    if (!fs.existsSync(TOKEN_PATH)) return null;
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
}
