import { NextResponse } from "next/server";

export async function GET(request) {
  const url = `${process.env.BACKEND_URL}/health`;

  const response = await fetch(url, {
    method: "GET",
  });

  const data = await response.json();

  return NextResponse.json(data);
}
