import { NextResponse } from "next/server";
import { loadTokens } from "@/lib/tokens";

export function GET() {
    return NextResponse.json(loadTokens());
}
