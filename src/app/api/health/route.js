import { NextResponse } from "next/server";

export async function GET(request) {
  const url = `${process.env.BACKEND_URL}/health`;

  await fetch(url);

  return NextResponse.json({ status: "ok" });
}
