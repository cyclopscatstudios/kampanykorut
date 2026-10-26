import { useState } from "react";
import type { DraftQuestion } from "../CampaignBundleContext";
import { useCampaignDraft } from "../CampaignBundleContext";
import { parseEffectInput } from "../narrativeEffect";
import { newAnswer, newQuestion } from "../narrativeModel";
import { useFocusHash } from "../useFocusHash";

export function NarrativeStep() {
  useFocusHash();
  const { draft, updateDraft } = useCampaignDraft();
  const updateQuestion = (index: number, next: DraftQuestion) =>
    updateDraft({
      questions: draft.questions.map((question, questionIndex) =>
        questionIndex === index ? next : question,
      ),
    });
  const addQuestion = () => {
    if (draft.questions.length >= 25) return;
    updateDraft({
      questions: [
        ...draft.questions,
        newQuestion(
          draft.parties.map(({ id }) => id),
          draft.questions,
        ),
      ],
    });
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">
          Történet
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">
          Kérdések, válaszok és következmények
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Legfeljebb 25 kérdés és kérdésenként 2–6 válasz adható meg. Az
          azonosítók kisbetűt, számot, aláhúzást és kötőjelet tartalmazhatnak;
          módosításuk minden kapcsolódó visszajelzést és hatást együtt frissít.
        </p>
      </div>
      {draft.questions.map((question, questionIndex) => (
        <QuestionEditor
          key={`${questionIndex}-${question.id}`}
          index={questionIndex}
          question={question}
          questionIds={draft.questions.map((item) => item.id)}
          parties={draft.parties.map((party) => party.id)}
          onChange={(next) => updateQuestion(questionIndex, next)}
          onRemove={() => {
            if (
              draft.questions.length > 1 &&
              window.confirm(
                `Törlöd ezt a kérdést: „${question.title || question.id}”?`,
              )
            )
              updateDraft({
                questions: draft.questions.filter(
                  (_, index) => index !== questionIndex,
                ),
              });
          }}
        />
      ))}
      <button
        type="button"
        className="self-start rounded-xl border px-4 py-2 font-bold disabled:opacity-50"
        disabled={draft.questions.length >= 25}
        onClick={addQuestion}
      >
        Kérdés hozzáadása ({draft.questions.length}/25)
      </button>
    </div>
  );
}

function QuestionEditor({
  index,
  question,
  questionIds,
  parties,
  onChange,
  onRemove,
}: {
  index: number;
  question: DraftQuestion;
  questionIds: string[];
  parties: string[];
  onChange: (question: DraftQuestion) => void;
  onRemove: () => void;
}) {
  const patch = (value: Partial<DraftQuestion>) =>
    onChange({ ...question, ...value });
  const changeId = (value: string) => {
    if (
      /^[a-z0-9_-]{1,64}$/.test(value) &&
      !questionIds.some((id) => id === value && id !== question.id)
    )
      patch({ id: value });
  };
  const addAnswer = () => {
    if (question.answers.length >= 6) return;
    patch({
      answers: [...question.answers, newAnswer(parties, question.answers)],
    });
  };
  return (
    <details className="rounded-2xl border border-slate-200 p-6 shadow-sm" open>
      <summary className="cursor-pointer font-bold text-slate-900">
        {question.title || question.id}{" "}
        <span className="ml-2 font-mono text-xs text-slate-400">
          {question.id}
        </span>
      </summary>
      <div className="mt-5 grid gap-4">
        <label className="text-sm font-semibold">
          Kérdésazonosító
          <input
            id={`question-${index}-id`}
            className="mt-1 w-full rounded-lg border p-2"
            pattern="[a-z0-9_-]{1,64}"
            required
            value={question.id}
            onChange={(event) => changeId(event.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Cím
          <input
            id={`question-${index}-title`}
            className="mt-1 w-full rounded-lg border p-2"
            maxLength={200}
            value={question.title}
            onChange={(event) => patch({ title: event.target.value })}
          />
        </label>
        <label className="text-sm font-semibold">
          Kérdés
          <textarea
            id={`question-${index}-question`}
            className="mt-1 w-full rounded-lg border p-2"
            rows={4}
            maxLength={20000}
            value={question.question}
            onChange={(event) => patch({ question: event.target.value })}
          />
        </label>
        {question.answers.map((answer, answerIndex) => (
          <fieldset
            key={`${answerIndex}-${answer.id}`}
            className="rounded-xl border border-slate-200 p-4"
          >
            <legend className="px-2 font-bold">{answer.id}. válasz</legend>
            <label className="block text-sm font-semibold">
              Válaszazonosító
              <input
                id={`question-${index}-answer-${answerIndex}-id`}
                className="mt-1 w-full rounded-lg border p-2"
                pattern="[a-z0-9_-]{1,64}"
                required
                value={answer.id}
                onChange={(event) => {
                  const value = event.target.value;
                  if (
                    /^[a-z0-9_-]{1,64}$/.test(value) &&
                    !question.answers.some(
                      (item, answerItemIndex) =>
                        answerItemIndex !== answerIndex && item.id === value,
                    )
                  )
                    patch({
                      answers: question.answers.map((item, itemIndex) =>
                        itemIndex === answerIndex
                          ? { ...item, id: value }
                          : item,
                      ),
                    });
                }}
              />
            </label>
            <label className="mt-3 block text-sm font-semibold">
              Válasz szövege
              <textarea
                id={`question-${index}-answer-${answerIndex}-label`}
                className="mt-1 w-full rounded-lg border p-2"
                rows={3}
                maxLength={20000}
                value={answer.label}
                onChange={(event) =>
                  patch({
                    answers: question.answers.map((item, itemIndex) =>
                      itemIndex === answerIndex
                        ? { ...item, label: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </label>
            <label className="mt-3 block text-sm font-semibold">
              Tanácsadói visszajelzés
              <textarea
                id={`question-${index}-answer-${answerIndex}-feedback`}
                className="mt-1 w-full rounded-lg border p-2"
                rows={3}
                maxLength={20000}
                value={answer.feedback}
                onChange={(event) =>
                  patch({
                    answers: question.answers.map((item, index) =>
                      index === answerIndex
                        ? { ...item, feedback: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
              {parties.map((party) => (
                <label
                  key={party}
                  className="text-xs font-semibold text-slate-600"
                >
                  {party}
                  <EffectInput
                    id={`question-${index}-answer-${answerIndex}-effect-${party}`}
                    value={answer.effects[party] ?? 0}
                    onValidChange={(amount) =>
                      patch({
                        answers: question.answers.map((item, itemIndex) =>
                          itemIndex === answerIndex
                            ? {
                                ...item,
                                effects: { ...item.effects, [party]: amount },
                              }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50"
              disabled={question.answers.length <= 2}
              onClick={() =>
                patch({
                  answers: question.answers.filter(
                    (_, itemIndex) => itemIndex !== answerIndex,
                  ),
                })
              }
            >
              Válasz törlése
            </button>
          </fieldset>
        ))}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50"
            disabled={question.answers.length >= 6}
            onClick={addAnswer}
          >
            Válasz hozzáadása ({question.answers.length}/6)
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700"
            onClick={onRemove}
          >
            Kérdés törlése
          </button>
        </div>
      </div>
    </details>
  );
}

function EffectInput({
  id,
  value,
  onValidChange,
}: {
  id: string;
  value: number;
  onValidChange: (value: number) => void;
}) {
  const [text, setText] = useState(String(value));
  const valid = parseEffectInput(text) !== null;
  const errorId = `${id}-error`;
  return (
    <>
      <input
        id={id}
        className="mt-1 w-full rounded border p-2"
        type="number"
        min={-10}
        max={10}
        step={0.1}
        value={text}
        aria-invalid={!valid}
        aria-describedby={!valid ? errorId : undefined}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          const amount = parseEffectInput(next);
          if (amount !== null) onValidChange(amount);
        }}
      />
      {!valid && (
        <span id={errorId} role="alert" className="mt-1 block text-red-700">
          Adj meg egy számot -10 és 10 között. Az előző hatásérték megmaradt.
        </span>
      )}
    </>
  );
}
