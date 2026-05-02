import { NextResponse } from "next/server";

// define a function for what to do every time someone makes a POST request to /api/rewrite endpoint

export async function POST(request) {
  // first, get the request body (which has all of the info we need)
  const body = await request.json();

  // then, get the text and distortions out out
  const { text, distortions } = body;

  // then, we call the url of our python model
  const url = `${process.env.BACKEND_URL}/rewrite`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text , distortions }),
  });
  

  const data = await response.json();

  // then, we get the result of the classification
  return NextResponse.json(data);
}
