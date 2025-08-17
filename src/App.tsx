import React, { useState } from "react";
import { QUESTIONS, type Word } from "./data/questions";

const App: React.FC = () => {
  // 現在の出題
  const [qIndex, setQIndex] = useState(0);
  const correctOrder = QUESTIONS[qIndex].correctOrder;

  // 候補と解答欄
  const [pool, setPool] = useState<Word[]>(
    () => [...correctOrder].sort(() => Math.random() - 0.5)
  );
  const [answer, setAnswer] = useState<Word[]>([]);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const handleDropToAnswer = (word: Word) => {
    if (isComplete) return; // 完了中は入力不可

    const newAnswer = [...answer, word];
    const idx = newAnswer.length - 1;

    // 直後判定：位置が違えば戻す
    if (newAnswer[idx].id !== correctOrder[idx].id) {
      setWrongId(word.id);
      setTimeout(() => setWrongId(null), 500);
      return;
    }

    // 正しい場合は確定
    setAnswer(newAnswer);
    setPool((prev) => prev.filter((w) => w.id !== word.id));

    // すべて正しく並び終えたら達成演出 → 2秒後に次の問題
    if (newAnswer.length === correctOrder.length) {
      setIsComplete(true);
      setTimeout(() => {
        const next = (qIndex + 1) % QUESTIONS.length;
        const nextOrder = QUESTIONS[next].correctOrder;

        setQIndex(next);
        setAnswer([]);
        setPool([...nextOrder].sort(() => Math.random() - 0.5));
        setWrongId(null);
        setIsComplete(false);
      }, 2000);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --border: #000;
          --chip-bg: #fff;
          --chip-bg-ans: #fff;
          --chip-bg-ans-done: #ffe6ef; /* 達成時の薄ピンク */
          --text: #000;
        }
        .wrap {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif;
          background: #fff;
          color: var(--text);
          padding: clamp(16px, 4vw, 40px);
          text-align: center;
          min-height: 100svh;
          box-sizing: border-box;
        }
        .prompt {
          margin: clamp(8px, 4vh, 40px) 0;
          font-size: clamp(14px, 1.8vw, 18px);
        }
        .answerRowWrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin: clamp(16px, 6vh, 40px) auto 0;
          width: min(860px, 80%);
        }
        .answerRow {
          min-height: clamp(44px, 6vh, 60px);
          border: 2px solid var(--border);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          background: #fff;
          transition: background-color .25s ease;
        }
        .chips {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: clamp(24px, 10vh, 60px);
        }
        .chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          border: 2px solid var(--border);
          border-radius: 9999px;
          background: var(--chip-bg);
          color: var(--text);
          line-height: 1;
          cursor: pointer;
          user-select: none;
          transition: transform .25s ease, background-color .25s ease, box-shadow .2s ease;
        }
        .chip:active { transform: scale(.98); }
        .chip--wrong {
          background: #ffdada;
          animation: bump .45s ease;
        }
        .chipAns {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border: 1.5px solid var(--border);
          border-radius: 9999px;
          background: var(--chip-bg-ans);
          color: var(--text);
          line-height: 1;
          transition: background-color .25s ease;
        }
        .chipAns--done {
          background: var(--chip-bg-ans-done);
        }
        @keyframes bump {
          0% { transform: translateY(-8px); }
          50% { transform: translateY(0); }
          100% { transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .answerRowWrap { width: 92%; }
          .chip { padding: 10px 12px; }
        }
        @media (max-width: 480px) {
          .chips { gap: 8px; }
          .chip { padding: 10px 12px; font-size: 15px; }
          .chipAns { padding: 8px 10px; font-size: 15px; }
          .answerRow { min-height: 48px; }
        }
      `}</style>

      <div className="wrap">
        {/* お題（外部データの日本語） */}
        <p className="prompt">{QUESTIONS[qIndex].jp}</p>

        {/* 解答エリア */}
        <div className="answerRowWrap">
          <div className="answerRow" aria-label="answer-area">
            {answer.map((word) => (
              <span
                key={word.id}
                className={`chipAns ${isComplete ? "chipAns--done" : ""}`}
              >
                {word.text}
              </span>
            ))}
          </div>
        </div>

        {/* 候補エリア */}
        <div className="chips">
          {pool.map((word) => {
            const wrong = wrongId === word.id;
            return (
              <div
                key={word.id}
                onClick={() => handleDropToAnswer(word)}
                className={`chip ${wrong ? "chip--wrong" : ""}`}
                role="button"
                aria-pressed="false"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleDropToAnswer(word);
                }}
              >
                {word.text}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default App;
