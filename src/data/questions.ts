// 出題データ（外部化）
export type Word = { id: number; text: string };
export type Question = { filename: string; jp: string; correctOrder: Word[] };

export const QUESTIONS: Question[] = [
  {
    filename: "q1.mp3",
    jp: "ランチミーティングで仲間との親睦を深めた",
    correctOrder: [
      { id: 1, text: "I" },
      { id: 2, text: "strengthened" },
      { id: 3, text: "my" },
      { id: 4, text: "bond" },
      { id: 5, text: "with" },
      { id: 6, text: "colleagues" },
      { id: 7, text: "during" },
      { id: 8, text: "a" },
      { id: 9, text: "lunch" },
      { id: 10, text: "meeting" }
    ]
  },
  {
    filename: "q2.mp3",
    jp: "私は毎朝コーヒーを一杯飲む",
    correctOrder: [
      { id: 1, text: "I" },
      { id: 2, text: "drink" },
      { id: 3, text: "a" },
      { id: 4, text: "cup" },
      { id: 5, text: "of" },
      { id: 6, text: "coffee" },
      { id: 7, text: "every" },
      { id: 8, text: "morning" }
    ]
  }
];
