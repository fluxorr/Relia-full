import fs from "fs";
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), "tokens.json");

export function loadTokens() {
    if (!fs.existsSync(TOKEN_PATH)) return {};
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
}

export function saveTokens(update: Record<string, any>) {
    const current = loadTokens();
    const newTokens = { ...current, ...update };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(newTokens, null, 2));
    return newTokens;
}
