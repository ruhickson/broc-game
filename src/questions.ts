export type Answer = "yes" | "no";

export type QuizCard = {
  id: number;
  topic: string;
  text: string;
  answer: Answer;
};

export const ROUND_SIZE = 10;

export const questions: readonly QuizCard[] = [
  {
    id: 1,
    topic: "Utilities",
    text: "A typical Irish home on electricity and gas pays over €3,000 a year for the two together.",
    answer: "yes",
  },
  {
    id: 2,
    topic: "Housing",
    text: "The median price of a home bought in Ireland in the year to August 2026 was €400,000.",
    answer: "yes",
  },
  {
    id: 3,
    topic: "Phone",
    text: "The average bill-pay mobile customer in Ireland spends under €20 a month.",
    answer: "no",
  },
  {
    id: 4,
    topic: "Subscriptions",
    text: "Irish adults who pay for streaming spend over €40 a month on those services.",
    answer: "yes",
  },
  {
    id: 5,
    topic: "Coffee",
    text: "The average weekly spend on coffee bought outside the home in Ireland is over €10.",
    answer: "yes",
  },
  {
    id: 6,
    topic: "Breakfast",
    text: "A full Irish breakfast in a café usually costs under €10.",
    answer: "no",
  },
  {
    id: 7,
    topic: "Brunch",
    text: "A café brunch for one usually costs less than two takeaway coffees.",
    answer: "no",
  },
  {
    id: 8,
    topic: "Lunch",
    text: "Soup and a sandwich at an Irish café usually costs under €10.",
    answer: "no",
  },
  {
    id: 9,
    topic: "Dinner",
    text: "A casual dinner for one, with two courses and a drink, usually costs more than €30.",
    answer: "yes",
  },
  {
    id: 10,
    topic: "Insurance",
    text: "Most people who compare insurance quotes spend more than a day doing it.",
    answer: "no",
  },
  {
    id: 11,
    topic: "Utilities",
    text: "Wholesale electricity prices rose by almost 93% in the year to September 2026.",
    answer: "yes",
  },
  {
    id: 12,
    topic: "Utilities",
    text: "One in seven Irish homes is behind on the electricity bill.",
    answer: "yes",
  },
  {
    id: 13,
    topic: "Utilities",
    text: "Wholesale electricity is still about half its 2022 peak.",
    answer: "yes",
  },
  {
    id: 14,
    topic: "Housing",
    text: "Renting a two-bedroom apartment in Dublin costs over €30,000 a year.",
    answer: "yes",
  },
  {
    id: 15,
    topic: "Housing",
    text: "The average open-market rent in Ireland is over €2,000 a month.",
    answer: "yes",
  },
  {
    id: 16,
    topic: "Housing",
    text: "The median home in Dún Laoghaire-Rathdown costs more than three times the median home in Longford.",
    answer: "yes",
  },
  {
    id: 17,
    topic: "Subscriptions",
    text: "Irish adults spend almost €2 billion a year on streaming.",
    answer: "yes",
  },
  {
    id: 18,
    topic: "Subscriptions",
    text: "The average Irish streamer spends about 45 days a year watching.",
    answer: "yes",
  },
  {
    id: 19,
    topic: "Subscriptions",
    text: "The share of people in Ireland paying for film or TV streaming is almost twice the EU average.",
    answer: "yes",
  },
  {
    id: 20,
    topic: "Phone",
    text: "A typical bill-pay mobile phone costs over €450 a year.",
    answer: "yes",
  },
  {
    id: 21,
    topic: "Phone",
    text: "Fewer than one in five mobile customers switched network in the last three years.",
    answer: "yes",
  },
  {
    id: 22,
    topic: "Coffee",
    text: "A €4 coffee every weekday costs more than €1,000 a year.",
    answer: "yes",
  },
  {
    id: 23,
    topic: "Coffee",
    text: "A Dublin café put a cappuccino up to €4 after hospitality VAT was cut.",
    answer: "yes",
  },
  {
    id: 24,
    topic: "Lunch",
    text: "Soup and a sandwich has been priced at €17.50 in an Irish café.",
    answer: "yes",
  },
  {
    id: 25,
    topic: "Dinner",
    text: "A meal for two in a Dublin restaurant is priced at about €90.",
    answer: "yes",
  },
  {
    id: 26,
    topic: "Insurance",
    text: "The average adult health-insurance premium is about €1,950 a year.",
    answer: "yes",
  },
];

export function drawRound(pool: readonly QuizCard[] = questions, size = ROUND_SIZE): QuizCard[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = copy[i];
    copy[i] = copy[j];
    copy[j] = current;
  }
  return copy.slice(0, Math.min(size, copy.length));
}
