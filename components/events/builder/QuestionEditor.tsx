"use client";

import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { saveQuestionsAction } from "@/app/dashboard/events/actions";
import type {
  ActionResult,
  Question,
  QuestionInput,
  QuestionType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionCard } from "./SectionCard";

interface QuestionEditorProps {
  eventId: string;
  questions: Question[];
  onSave?: (questions: QuestionInput[]) => Promise<ActionResult<Question[]>>;
}

function toDraft(question: Question): QuestionInput {
  return {
    id: question.id,
    label: question.label,
    type: question.type,
    options: question.options ?? null,
    required: question.required,
    position: question.position,
  };
}

function newQuestion(position: number): QuestionInput {
  return {
    label: "",
    type: "text",
    options: null,
    required: false,
    position,
  };
}

export function QuestionEditor({
  eventId,
  questions: initialQuestions,
  onSave,
}: QuestionEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState<QuestionInput[]>(() =>
    initialQuestions.map(toDraft),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialQuestions.map(toDraft));
  }, [initialQuestions]);

  function update(index: number, patch: Partial<QuestionInput>) {
    setItems((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    );
  }

  function changeType(index: number, type: QuestionType) {
    setItems((current) =>
      current.map((question, questionIndex) => {
        if (questionIndex !== index) {
          return question;
        }

        return {
          ...question,
          type,
          options:
            type === "select"
              ? question.options && question.options.length > 0
                ? question.options
                : ["", ""]
              : null,
        };
      }),
    );
  }

  function addOption(index: number) {
    setItems((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index
          ? {
              ...question,
              options: [...(question.options ?? []), ""],
            }
          : question,
      ),
    );
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) {
    setItems((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options: (question.options ?? []).map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex ? value : option,
          ),
        };
      }),
    );
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    setItems((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options: (question.options ?? []).filter(
            (_option, currentOptionIndex) =>
              currentOptionIndex !== optionIndex,
          ),
        };
      }),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) {
      return;
    }

    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }

  function remove(index: number) {
    setItems((current) =>
      current.filter((_question, questionIndex) => questionIndex !== index),
    );
  }

  async function save() {
    setError(null);
    setSuccess(null);

    for (let index = 0; index < items.length; index += 1) {
      const question = items[index];

      if (!question.label.trim()) {
        setError(`Question ${index + 1} needs a label.`);
        return;
      }

      if (question.type === "select") {
        const options = (question.options ?? [])
          .map((option) => option.trim())
          .filter(Boolean);

        if (options.length < 2) {
          setError(`Question ${index + 1} needs at least two options.`);
          return;
        }

        if (
          new Set(options.map((option) => option.toLowerCase())).size !==
          options.length
        ) {
          setError(`Question ${index + 1} has duplicate options.`);
          return;
        }
      }
    }

    const payload: QuestionInput[] = items.map((question, index) => ({
      ...question,
      label: question.label.trim(),
      options:
        question.type === "select"
          ? (question.options ?? [])
              .map((option) => option.trim())
              .filter(Boolean)
          : null,
      position: index,
    }));

    setPending(true);
    try {
      const action =
        onSave ??
        ((questions) => saveQuestionsAction(eventId, questions));
      const result = await action(payload);
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }

      setItems(result.data.map(toDraft));
      setSuccess("Questions saved.");
      router.refresh();
    } catch {
      setError("Could not save questions. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard
      title="Registration questions"
      description="Ask attendees up to 20 custom questions. Questions with saved answers cannot be removed or change type."
    >
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            No custom questions yet. Registration will only ask for the
            attendee&apos;s basic details.
          </div>
        ) : null}

        {items.map((question, index) => (
          <div
            key={question.id ?? `new-${index}`}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Question {index + 1}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move question ${index + 1} up`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-800 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move question ${index + 1} down`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-800 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove question ${index + 1}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
              <div>
                <label
                  htmlFor={`question-label-${index}`}
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Label
                </label>
                <input
                  id={`question-label-${index}`}
                  type="text"
                  value={question.label}
                  onChange={(event) =>
                    update(index, { label: event.target.value })
                  }
                  maxLength={200}
                  aria-label={`Question ${index + 1} label`}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="e.g. What is your GitHub username?"
                />
              </div>

              <div>
                <label
                  htmlFor={`question-type-${index}`}
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Type
                </label>
                <select
                  id={`question-type-${index}`}
                  value={question.type}
                  onChange={(event) =>
                    changeType(index, event.target.value as QuestionType)
                  }
                  aria-label={`Question ${index + 1} type`}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="text">Short text</option>
                  <option value="select">Single select</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
            </div>

            {question.type === "select" ? (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-medium text-slate-600">
                  Options
                </p>
                <div className="space-y-2">
                  {(question.options ?? []).map((option, optionIndex) => (
                    <div
                      key={`${question.id ?? index}-option-${optionIndex}`}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={option}
                        onChange={(event) =>
                          updateOption(
                            index,
                            optionIndex,
                            event.target.value,
                          )
                        }
                        maxLength={200}
                        aria-label={`Question ${index + 1} option ${optionIndex + 1}`}
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index, optionIndex)}
                        aria-label={`Remove option ${optionIndex + 1} from question ${index + 1}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addOption(index)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add option
                </button>
              </div>
            ) : null}

            <label className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(event) =>
                  update(index, { required: event.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
              />
              Required
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setItems((current) => [...current, newQuestion(current.length)])}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" />
        Add question
      </button>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="min-h-5 text-sm" aria-live="polite">
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : success ? (
            <p className="text-emerald-600">{success}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={pending}
          className={cn(
            "inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {pending ? "Saving..." : "Save all questions"}
        </button>
      </div>
    </SectionCard>
  );
}
