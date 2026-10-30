export type Answer = "yes" | "no";

export type QuizCard = {
  id: number;
  topic: string;
  text: string;
  answer: Answer;
};

export const questions: readonly QuizCard[] = [
  {
    id: 1,
    topic: "Pension",
    text: "You can claim the Irish State Pension from the age of 66.",
    answer: "yes",
  },
  {
    id: 2,
    topic: "Tax",
    text: "Only the rent above €14,000 is taxed if a room in your home earns more than the Rent-a-Room limit.",
    answer: "no",
  },
  {
    id: 3,
    topic: "Mortgage",
    text: "You can claim Help to Buy on a second-hand home.",
    answer: "no",
  },
  {
    id: 4,
    topic: "Tax",
    text: "You pay no Universal Social Charge if your gross income for the year is under €13,000.",
    answer: "yes",
  },
  {
    id: 5,
    topic: "Pension",
    text: "Income tax is taken off the State Pension before it is paid.",
    answer: "no",
  },
  {
    id: 6,
    topic: "Tax",
    text: "A married couple or civil partners on joint assessment can split their standard-rate band.",
    answer: "yes",
  },
  {
    id: 7,
    topic: "Tax",
    text: "Tax relief on a typical GP visit is given at your highest rate of income tax.",
    answer: "no",
  },
  {
    id: 8,
    topic: "Savings",
    text: "Each person gets a Capital Gains Tax exemption of €1,270 a year.",
    answer: "yes",
  },
  {
    id: 9,
    topic: "Savings",
    text: "Capital Gains Tax is charged on the full price you sell an asset for.",
    answer: "no",
  },
  {
    id: 10,
    topic: "Gifts",
    text: "A gift of up to €3,000 to one person in a year is free of gift tax.",
    answer: "yes",
  },
];
