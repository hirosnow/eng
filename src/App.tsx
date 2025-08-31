import React, { useState, useRef, useEffect } from "react";
import { QUESTIONS as DEFAULT_QUESTIONS, type Word, type Question } from "./data/questions";

const App: React.FC = () => {

  // 問題リスト（デフォルトは既存QUESTIONS、アップロードで差し替え）
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  // 現在の出題
  const [qIndex, setQIndex] = useState(0);
  const correctOrder = questions[qIndex].correctOrder;

  // 候補と解答欄
  const [pool, setPool] = useState<Word[]>(
    () => [...correctOrder].sort(() => Math.random() - 0.5)
  );
  const [answer, setAnswer] = useState<Word[]>([]);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  // 1回でも間違えたかどうか
  const [hasMistake, setHasMistake] = useState<boolean>(false);

  // 音声ファイルを保持するMap
  const [audioFiles, setAudioFiles] = useState<Map<string, File>>(new Map());
  const audioRef = useRef<HTMLAudioElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      (inputRef.current as any).webkitdirectory = true;
      (inputRef.current as any).directory = true;
    }
  }, []);

  useEffect(() => {
    if (audioFiles.has(questions[qIndex].filename) && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line
  }, [qIndex, audioFiles]);

  const handleDropToAnswer = (word: Word) => {
    if (isComplete) return; // 完了中は入力不可

    const newAnswer = [...answer, word];
    const idx = newAnswer.length - 1;

    // 直後判定：位置が違えば戻す

    if (newAnswer[idx].id !== correctOrder[idx].id) {
      setWrongId(word.id);
      setHasMistake(true);
      setTimeout(() => setWrongId(null), 500);
      return;
    }

    // 正しい場合は確定
    setAnswer(newAnswer);
    setPool((prev) => prev.filter((w) => w.id !== word.id));

    // すべて正しく並び終えたら
    if (newAnswer.length === correctOrder.length) {
      setIsComplete(true);
      if (hasMistake) {
        // 間違えた場合はボタン表示で次へ
        // 何もしない（ボタンで進める）
      } else {
        // 間違えなかった場合は1秒後に自動で次へ
        setTimeout(() => {
          goToNextQuestion();
        }, 1000);
      }
    }
  };
  // 次の問題へ進む処理
  const goToNextQuestion = () => {
    const next = (qIndex + 1) % questions.length;
    const nextOrder = questions[next].correctOrder;
    setQIndex(next);
    setAnswer([]);
    setPool([...nextOrder].sort(() => Math.random() - 0.5));
    setWrongId(null);
    setIsComplete(false);
    setHasMistake(false);
  };

  return (
    <>
      <style>{`
        :root {
          --container-width: 100%;
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
        {/* qIndex 表示と選択 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, gap: 12 }}>
          <span>問題: </span>
          <select
            value={qIndex}
            onChange={e => {
              const idx = Number(e.target.value);
              setQIndex(idx);
              setAnswer([]);
              setPool([...questions[idx].correctOrder].sort(() => Math.random() - 0.5));
              setWrongId(null);
              setIsComplete(false);
            }}
            style={{ fontSize: 16, padding: "2px 8px", borderRadius: 4 }}
          >
            {questions.map((_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
          <span>/ {questions.length}</span>
        </div>
        {/* JSONファイルアップロード */}
        <div style={{ textAlign: "right", marginBottom: 8 }}>
          <label style={{ cursor: "pointer" }}>
              <input
              ref={inputRef}
              type="file"
              accept="application/json,audio/*"
              style={{ display: "none" }}
              multiple
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                let allQuestions: Question[] = [];
                let hasInvalid = false;
                const audioMap = new Map<string, File>();
                for (const file of Array.from(files)) {
                  if (file.name.endsWith('.json')) {
                    try {
                      const text = await file.text();
                      const json = JSON.parse(text);
                      if (Array.isArray(json) && json.every(q => typeof q.jp === 'string' && Array.isArray(q.correctOrder))) {
                        allQuestions = allQuestions.concat(json);
                      } else {
                        hasInvalid = true;
                      }
                    } catch {
                      hasInvalid = true;
                    }
                  } else if (file.type.startsWith('audio/')) {
                    audioMap.set(file.name, file);
                  }
                }
                if (allQuestions.length === 0) {
                  alert('有効なJSONファイルが見つかりませんでした。');
                  return;
                }
                setQuestions(allQuestions);
                setQIndex(0);
                setAnswer([]);
                setPool([...allQuestions[0].correctOrder].sort(() => Math.random() - 0.5));
                setWrongId(null);
                setIsComplete(false);
                setAudioFiles(audioMap);
                if (hasInvalid) {
                  alert('一部のファイルは不正な形式だったためスキップされました。');
                }
              }}
            />
            <span style={{ border: "1px solid #aaa", borderRadius: 4, padding: "4px 10px", background: "#f7f7f7" }}>
              ディレクトリから出題を読み込む
            </span>
          </label>
        </div>
        {/* お題（外部データの日本語） */}
        <p className="prompt">{questions[qIndex].jp}</p>
        {/* 音声再生エリア */}
        {audioFiles.has(questions[qIndex].filename) && (
          <audio
            key={questions[qIndex].filename}
            ref={audioRef}
            controls
            autoPlay
            style={{ margin: '12px 0' }}
          >
            <source src={URL.createObjectURL(audioFiles.get(questions[qIndex].filename)!)} />
            お使いのブラウザはaudioタグに対応していません。
          </audio>
        )}

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

        {/* 次の問題ボタン（間違えた場合のみ表示） */}
        {isComplete && hasMistake && (
          <div style={{ margin: "24px 0" }}>
            <button
              onClick={goToNextQuestion}
              style={{
                fontSize: 18,
                padding: "8px 24px",
                borderRadius: 6,
                border: "2px solid #000",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              次の問題
            </button>
          </div>
        )}

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
