import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  const url = `${process.env.BACKEND_URL}/feedback`;

  const API_KEY = process.env.API_KEY;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data);
}
