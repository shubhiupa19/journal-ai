import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

// define a function every time someone makes a POST reqest to /api/analyze endpoint

export async function POST(request) {
  // extracting the body of the request
  const body = await request.json();

  // specifically, pulls out they value from the key-val pair of "text" in the body
  const { text } = body;

  // splits text into sentences + removes whitespace, if necessary
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);;

  // then, we call the classify function of the cohere model

  const response = await cohere.classify({
    model: "58a29f78-89a1-4619-9b0d-e81528ffaeee-ft",
    inputs: sentences,
  });
  console.log(
    "The confidence levels of the labels are:",
    response.classifications
  );

  // then, we get the result of the classification
  return NextResponse.json({
    // returns the result in an array of objects, each corresponding to a sentence
    // each object is considered a classification and contains the input sentence, prediction, and confidence
    // this entire array of objects is sent to the client
    results: response.classifications.map((classification) => ({
      input: classification.input,
      prediction: classification.prediction,
      confidence: classification.confidence,
    })),
  });
}
