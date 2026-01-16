import { NextResponse } from "next/server"l

export async function POST(request) {
    const body = await request.json();

    const url = `${process.env.BACKEND_URL}/feedback`;

    const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),

    });

    const data = await response.json();

    return NextResponse.json(data);
}