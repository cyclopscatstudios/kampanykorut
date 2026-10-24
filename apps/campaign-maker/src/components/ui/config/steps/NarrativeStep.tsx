import type { DraftQuestion } from "../CampaignBundleContext";
import { useCampaignDraft } from "../CampaignBundleContext";

export function NarrativeStep() {
  const { draft, updateDraft } = useCampaignDraft();
  const updateQuestion = (index: number, next: DraftQuestion) => updateDraft({ questions: draft.questions.map((question, questionIndex) => questionIndex === index ? next : question) });
  return <div className="flex flex-col gap-6">
    <div><p className="text-sm font-bold uppercase tracking-wide text-brand-700">Történet</p><h1 className="mt-2 text-3xl font-extrabold">Kérdések, válaszok és következmények</h1><p className="mt-2 max-w-3xl text-slate-600">A béta egységes országos támogatottsági hatást engedélyez, pártonként −10 és +10 között. A kérdés- és válaszazonosítókat a hivatkozások épsége miatt ne változtasd meg.</p></div>
    {draft.questions.map((question, questionIndex) => <QuestionEditor key={question.id} question={question} parties={draft.parties.map((party) => party.id)} onChange={(next) => updateQuestion(questionIndex, next)} />)}
  </div>;
}

function QuestionEditor({ question, parties, onChange }: { question: DraftQuestion; parties: string[]; onChange: (question: DraftQuestion) => void }) {
  const patch = (value: Partial<DraftQuestion>) => onChange({ ...question, ...value });
  return <details className="rounded-2xl border border-slate-200 p-6 shadow-sm" open>
    <summary className="cursor-pointer font-bold text-slate-900">{question.title || question.id} <span className="ml-2 font-mono text-xs text-slate-400">{question.id}</span></summary>
    <div className="mt-5 grid gap-4">
      <label className="text-sm font-semibold">Cím<input className="mt-1 w-full rounded-lg border p-2" maxLength={200} value={question.title} onChange={(event) => patch({ title: event.target.value })} /></label>
      <label className="text-sm font-semibold">Kérdés<textarea className="mt-1 w-full rounded-lg border p-2" rows={4} maxLength={20000} value={question.question} onChange={(event) => patch({ question: event.target.value })} /></label>
      {question.answers.map((answer, answerIndex) => <fieldset key={answer.id} className="rounded-xl border border-slate-200 p-4"><legend className="px-2 font-bold">{answer.id}. válasz</legend>
        <label className="block text-sm font-semibold">Válasz szövege<textarea className="mt-1 w-full rounded-lg border p-2" rows={3} maxLength={20000} value={answer.label} onChange={(event) => patch({ answers: question.answers.map((item, index) => index === answerIndex ? { ...item, label: event.target.value } : item) })} /></label>
        <label className="mt-3 block text-sm font-semibold">Tanácsadói visszajelzés<textarea className="mt-1 w-full rounded-lg border p-2" rows={3} maxLength={20000} value={answer.feedback} onChange={(event) => patch({ answers: question.answers.map((item, index) => index === answerIndex ? { ...item, feedback: event.target.value } : item) })} /></label>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">{parties.map((party) => <label key={party} className="text-xs font-semibold text-slate-600">{party}<input className="mt-1 w-full rounded border p-2" type="number" min={-10} max={10} step={0.1} value={answer.effects[party] ?? 0} onChange={(event) => { const amount = Math.max(-10, Math.min(10, Number(event.target.value))); patch({ answers: question.answers.map((item, index) => index === answerIndex ? { ...item, effects: { ...item.effects, [party]: Number.isFinite(amount) ? amount : 0 } } : item) }) }} /></label>)}</div>
      </fieldset>)}
    </div>
  </details>;
}
