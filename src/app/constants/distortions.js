// Definitions taken from : https://www.therapistaid.com/worksheets/cognitive-distortions, https://www.medicalnewstoday.com/articles/cognitive-distortions#types
export const DISTORTION_DATA = {
  "All-or-Nothing Thinking": {
    definition: "Thinking in absolutes such as “always,” “never,” or “every.”",
  },
  Overgeneralization: {
    definition: "Making broad interpretations from a single or few events",
  },
  "Emotional Reasoning": {
    definition:
      "The assumption that emotions reflect the way things really are",
  },
  Labeling: {
    definition:
      "Classifying onself or others in an entirely and absolutely negative way",
  },
  "Should Statements": {
    definition: "The belief that things should be a certain way",
  },
  "Mind Reading": {
    definition:
      "Interpreting the thoughts and beliefs of others without adequate evidence",
  },
  "Disqualifying the Positive": {
    definition:
      "Recognizing only the negative aspects of a situation while ignoring the positive",
  },
  "Mental Filtering": {
    definition:
      "Lingering and focusing on negative events or thoughts, even in the face of contradictory evidence",
  },
  "Jumping to Conclusions": {
    definition:
      "Interpreting the meaning of a situation with little or no evidence",
  },
};

export const DISTORTION_ORDER = [
  "All-or-Nothing Thinking",
  "Overgeneralization",
  "Emotional Reasoning",
  "Labeling",
  "Should Statements",
  "Mind Reading",
  "Disqualifying the Positive",
  "Mental Filtering",
  "Jumping to Conclusions",
];

export const DISTORTION_COLORS = {
  "All-or-Nothing Thinking": "bg-blue-100 hover:bg-blue-200 border-blue-300",
  Overgeneralization: "bg-indigo-100 hover:bg-indigo-200 border-indigo-300",
  "Mind Reading": "bg-purple-100 hover:bg-purple-200 border-purple-300",
  "Emotional Reasoning": "bg-violet-100 hover:bg-violet-200 border-violet-300",
  Labeling: "bg-cyan-100 hover:bg-cyan-200 border-cyan-300",
  "Should Statements": "bg-teal-100 hover:bg-teal-200 border-teal-300",
  "Disqualifying the Positive":
    "bg-emerald-100 hover:bg-emerald-200 border-emerald-300",
  "Mental Filtering": "bg-sky-100 hover:bg-sky-200 border-sky-300",
  "Jumping to Conclusions": "bg-slate-100 hover:bg-slate-200 border-slate-300",
};
