// Definitions taken from : https://www.therapistaid.com/worksheets/cognitive-distortions, https://www.medicalnewstoday.com/articles/cognitive-distortions#types
export const DISTORTION_DATA = {
  "All-or-nothing thinking": {
    definition: "Thinking in absolutes such as 'always,' 'never,' or 'every.'",
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
      "Classifying oneself or others in an entirely and absolutely negative way",
  },
  "Should statements": {
    definition: "The belief that things should be a certain way",
  },
  "Mind Reading": {
    definition:
      "Interpreting the thoughts and beliefs of others without adequate evidence",
  },
  Personalization: {
    definition:
      "Taking responsibility for events outside of your control or blaming yourself unnecessarily",
  },
  "Mental filter": {
    definition:
      "Focusing only on negative aspects while filtering out positive ones",
  },
  "Fortune-telling": {
    definition:
      "Predicting negative outcomes without adequate evidence",
  },
  Magnification: {
    definition:
      "Exaggerating the importance of negative events or minimizing positive ones",
  },
  "No Distortion": {
    definition:
      "Healthy, balanced thinking without cognitive distortions",
  },
};

export const DISTORTION_ORDER = [
  "All-or-nothing thinking",
  "Overgeneralization",
  "Emotional Reasoning",
  "Labeling",
  "Should statements",
  "Mind Reading",
  "Personalization",
  "Mental filter",
  "Fortune-telling",
  "Magnification",
  "No Distortion"
];

export const DISTORTION_COLORS = {
  "All-or-nothing thinking": "bg-blue-100 hover:bg-blue-200 border-blue-300",
  Overgeneralization: "bg-indigo-100 hover:bg-indigo-200 border-indigo-300",
  "Mind Reading": "bg-purple-100 hover:bg-purple-200 border-purple-300",
  "Emotional Reasoning": "bg-violet-100 hover:bg-violet-200 border-violet-300",
  Labeling: "bg-cyan-100 hover:bg-cyan-200 border-cyan-300",
  "Should statements": "bg-teal-100 hover:bg-teal-200 border-teal-300",
  Personalization: "bg-pink-100 hover:bg-pink-200 border-pink-300",
  "Mental filter": "bg-sky-100 hover:bg-sky-200 border-sky-300",
  "Fortune-telling": "bg-amber-100 hover:bg-amber-200 border-amber-300",
  Magnification: "bg-rose-100 hover:bg-rose-200 border-rose-300",
};
