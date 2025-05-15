import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

// define a function every time someone makes a POST reqest to /api/analyze endpoint

export async function POST(request) {
  // extracting the body of the request
  const body = await request.json();

  // specifically, pulls out they value from the key-val pair of "text" in the body
  const { text } = body;

  // then, give some training labeled data of cognitive distortions to the cohere model
  const examples = [
    {
      text: "I made a mistake, so I am a failure",
      label: "All-or-Nothing Thinking",
    },
    {
      text: "I am terrified of airplanes, so flying is dangerous",
      label: "Emotional Reasoning",
    },
    {
      text: "She's a bad person",
      label: "Labeling",
    },
    {
      text: "My boss said he liked my work, but since he didn't say it was perfect, I must be doing a terrible job",
      label: "Mental Filtering",
    },
    {
      text: "Every time I get the day off, it rains",
      label: "Overgeneralization",
    },
    {
      text: "I got the job, but I was just lucky",
      label: "Disqualifying the Positive",
    },
    {
      text: "I should have more friends by now",
      label: "Should Statements",
    },
    {
      text: "As soon as I saw him, I knew he had bad intentions",
      label: "Jumping to Conclusions",
    },
    {
      text: "He's thinking that I don't like him",
      label: "Mind Reading",
    },
  ];

  // then, we call the classify function of the cohere model

    const response = await cohere.classify({
      model: "58a29f78-89a1-4619-9b0d-e81528ffaeee-ft",
      inputs: [text],
    });
    console.log(
      "The confidence levels of the labels are:",
      response.classifications
    );
 

  // then, we get the result of the classification
  return NextResponse.json(response.classifications[0]);
}
