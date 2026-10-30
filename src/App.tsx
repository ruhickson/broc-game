import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { drawRound, type Answer } from "./questions.ts";

const SHARE_URL = "https://quiz.broc.fi";
const APP_URL = "https://app.broc.fi";
const CTA = "swipe right to see how Broc can optimise your finances in seconds";

type Phase = "idle" | "stamp" | "leaving";
type Pose = { x: number; y: number; dragging: boolean };

const REST: Pose = { x: 0, y: 0, dragging: false };

type Origin = {
  x: number;
  y: number;
  px: number;
  pt: number;
  vx: number;
};

function cardStyle(pose: Pose): CSSProperties | undefined {
  if (pose.x === 0 && pose.y === 0 && !pose.dragging) return undefined;
  return {
    transform: `translate3d(${pose.x}px, ${pose.y * 0.08}px, 0) rotate(${pose.x / 18}deg)`,
    transition: pose.dragging ? "none" : "transform 420ms cubic-bezier(.16,.84,.32,1)",
  };
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function App() {
  const [round] = useState(() => drawRound());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [choice, setChoice] = useState<Answer | null>(null);
  const [pose, setPose] = useState<Pose>(REST);
  const [shareNote, setShareNote] = useState("");

  const indexRef = useRef(0);
  const scoreRef = useRef(0);
  const finishedRef = useRef(false);
  const lock = useRef(false);
  const origin = useRef<Origin | null>(null);
  const timers = useRef<number[]>([]);
  const answerRef = useRef<(choice: Answer) => void>(() => {});
  const leaveRef = useRef<() => void>(() => {});
  const nudgeRef = useRef<() => void>(() => {});

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  function answer(next: Answer) {
    if (lock.current || finishedRef.current) return;
    lock.current = true;
    const card = round[indexRef.current];
    if (card.answer === next) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
    setChoice(next);
    setPose({
      x: next === "yes" ? 46 : -46,
      y: 0,
      dragging: false,
    });
    setPhase("stamp");
    const reduce = reducedMotion();
    const hold = reduce ? 220 : 860;
    const fly = reduce ? 40 : 400;
    later(() => {
      setPhase("leaving");
      setPose({ x: next === "yes" ? 760 : -760, y: 0, dragging: false });
    }, hold);
    later(() => {
      const upcoming = indexRef.current + 1;
      if (upcoming >= round.length) {
        finishedRef.current = true;
        setFinished(true);
      } else {
        indexRef.current = upcoming;
        setIndex(upcoming);
      }
      setChoice(null);
      setPhase("idle");
      setPose(REST);
      lock.current = false;
    }, hold + fly);
  }

  function leave() {
    if (lock.current || !finishedRef.current) return;
    lock.current = true;
    setPhase("leaving");
    setPose({ x: 760, y: 0, dragging: false });
    later(() => {
      window.location.assign(APP_URL);
    }, reducedMotion() ? 0 : 420);
  }

  function nudge() {
    if (lock.current) return;
    setPose({ x: -42, y: 0, dragging: false });
    later(() => {
      if (!lock.current) setPose(REST);
    }, 180);
  }

  useEffect(() => {
    answerRef.current = answer;
    leaveRef.current = leave;
    nudgeRef.current = nudge;
  });

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.repeat) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      if (finishedRef.current) {
        if (event.key === "ArrowRight") leaveRef.current();
        else nudgeRef.current();
        return;
      }
      answerRef.current(event.key === "ArrowRight" ? "yes" : "no");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (lock.current) return;
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    origin.current = {
      x: event.clientX,
      y: event.clientY,
      px: event.clientX,
      pt: performance.now(),
      vx: 0,
    };
    setPose((current) => ({ ...current, dragging: true }));
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const start = origin.current;
    if (!start || lock.current) return;
    const now = performance.now();
    const dt = now - start.pt;
    if (dt > 0) start.vx = (event.clientX - start.px) / dt;
    start.px = event.clientX;
    start.pt = now;
    setPose({
      x: event.clientX - start.x,
      y: event.clientY - start.y,
      dragging: true,
    });
  }

  function onPointerUp(event: ReactPointerEvent<HTMLElement>) {
    const start = origin.current;
    origin.current = null;
    if (!start || lock.current) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const vertical = Math.abs(dy) > Math.abs(dx) && Math.abs(dx) < 70;
    const flung = Math.abs(dx) > 64 && Math.abs(start.vx) > 0.55;
    const passed = !vertical && (Math.abs(dx) > 108 || flung);
    if (!passed) {
      setPose(REST);
      return;
    }
    const dir: Answer = dx > 0 ? "yes" : "no";
    if (finishedRef.current) {
      if (dir === "no") {
        setPose(REST);
        return;
      }
      leave();
      return;
    }
    answer(dir);
  }

  function onPointerCancel() {
    origin.current = null;
    if (!lock.current) setPose(REST);
  }

  async function share() {
    const text = `I scored ${scoreRef.current} out of ${round.length} on Broc's Irish money quiz.`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Broc quiz", text, url: SHARE_URL });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setShareNote("Link copied");
    } catch {
      setShareNote("Couldn't copy the link");
    }
  }

  const card = round[index];
  const total = round.length;
  const yesWash = Math.max(0, Math.min(1, pose.x / 120));
  const noWash = Math.max(0, Math.min(1, -pose.x / 120));
  const pointer = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };

  const status = finished
    ? `Score ${score} out of ${total}.`
    : choice && phase !== "idle"
      ? card.answer === choice
        ? "Correct."
        : "Not quite."
      : `Card ${index + 1} of ${total}.`;

  return (
    <div className="desk">
      <main className={`phone${pose.dragging ? " is-dragging" : ""}`}>
        <header className="top">
          <p className="brand">
            <span className="dot" aria-hidden="true" />
            Broc
          </p>
          <p className="count">{finished ? "Score" : `${index + 1} of ${total}`}</p>
        </header>
        <div className="pips" aria-hidden="true">
          {round.map((item, pip) => (
            <span key={item.id} className={pip < index || finished ? "on" : pip === index ? "now" : ""} />
          ))}
        </div>
        <div className="stage">
          {!finished && index < total - 1 && <div className="under under-1" aria-hidden="true" />}
          {!finished && index < total - 2 && <div className="under under-2" aria-hidden="true" />}
          {finished ? (
            <article key="score" className="card deal score-card" style={cardStyle(pose)} data-screen="score" {...pointer}>
              <div className="wash yes" style={{ opacity: yesWash }} />
              <div className="score-mid">
                <p className="kicker">Your score</p>
                <p className="num">{score}</p>
                <p className="of">out of {total}</p>
                <button
                  type="button"
                  className="share"
                  onClick={() => void share()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  Share
                </button>
                <p className="share-note" aria-live="polite">
                  {shareNote}
                </p>
              </div>
              <p className="cta">{CTA}</p>
            </article>
          ) : (
            <article
              key={card.id}
              className="card deal"
              style={cardStyle(pose)}
              data-screen="question"
              data-card={index + 1}
              {...pointer}
            >
              <div className="wash yes" style={{ opacity: yesWash }} />
              <div className="wash no" style={{ opacity: noWash }} />
              <p className="lean yes" style={{ opacity: phase === "idle" ? yesWash : 0 }} aria-hidden="true">
                Yes
              </p>
              <p className="lean no" style={{ opacity: phase === "idle" ? noWash : 0 }} aria-hidden="true">
                No
              </p>
              <header className="card-top">
                <span className="idx">{String(index + 1).padStart(2, "0")}</span>
                <span className="topic">{card.topic}</span>
              </header>
              <h1 className="question" id="question">
                {card.text}
              </h1>
              {choice && phase !== "idle" && (
                <p className={card.answer === choice ? "stamp good" : "stamp bad"}>
                  {card.answer === choice ? "Correct" : "Not quite"}
                </p>
              )}
              <footer className="card-foot" aria-hidden="true">
                <span>No</span>
                <span>Yes</span>
              </footer>
            </article>
          )}
        </div>
        {finished ? (
          <p className="hint">The right arrow swipes this card.</p>
        ) : (
          <div className="choices">
            <button type="button" className="choice no" onClick={() => answer("no")} disabled={phase !== "idle"}>
              No
            </button>
            <p className="hint hint-inline">Swipe, or use the arrow keys.</p>
            <button type="button" className="choice yes" onClick={() => answer("yes")} disabled={phase !== "idle"}>
              Yes
            </button>
          </div>
        )}
        <p className="sr" aria-live="polite">
          {status}
        </p>
      </main>
    </div>
  );
}
