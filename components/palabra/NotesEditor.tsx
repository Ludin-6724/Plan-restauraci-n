"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  Italic,
  List,
  Minus,
  Pencil,
  Quote,
} from "lucide-react";

/** Editor de notas con formato ligero (markdown simple) + vista previa. */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Negrita **...** y cursiva *...*
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(
        <em key={`${keyPrefix}-i${i}`}>{token.slice(1, -1)}</em>
      );
    }
    last = m.index + token.length;
    i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function NotesPreview({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (!list.length) return;
    blocks.push(
      <ul key={key} className="list-disc pl-5 space-y-1">
        {list.map((item, j) => (
          <li key={j}>{renderInline(item, `${key}-${j}`)}</li>
        ))}
      </ul>
    );
    list = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const key = `l${idx}`;
    if (line.startsWith("- ") || line.startsWith("• ")) {
      list.push(line.slice(2));
      return;
    }
    flushList(`ul${idx}`);
    if (!line.trim()) {
      blocks.push(<div key={key} className="h-2" />);
    } else if (line.startsWith("### ")) {
      blocks.push(
        <h4 key={key} className="text-sm font-semibold text-ink mt-2">
          {renderInline(line.slice(4), key)}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h3 key={key} className="text-base font-bold text-ink mt-3">
          {renderInline(line.slice(3), key)}
        </h3>
      );
    } else if (line === "---") {
      blocks.push(<hr key={key} className="border-line my-2" />);
    } else if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={key}
          className="border-l-2 border-primary/50 pl-3 text-muted italic"
        >
          {renderInline(line.slice(2), key)}
        </blockquote>
      );
    } else {
      blocks.push(
        <p key={key} className="leading-relaxed">
          {renderInline(line, key)}
        </p>
      );
    }
  });
  flushList("ul-end");

  if (!text.trim()) {
    return <p className="text-sm text-subtle">Sin notas todavía.</p>;
  }
  return <div className="text-sm text-ink space-y-0.5">{blocks}</div>;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  minHeightClass?: string;
  placeholder?: string;
};

export function NotesEditor({
  value,
  onChange,
  minHeightClass = "min-h-[min(60vh,32rem)]",
  placeholder,
}: Props) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [preview, setPreview] = useState(false);

  /** Inserta sintaxis en la posición del cursor y devuelve el foco al textarea. */
  const apply = (fn: (sel: { start: number; end: number; text: string }) => { next: string; caret: number }) => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const { next, caret } = fn({ start, end, text: value });
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caret, caret);
    });
  };

  const prefixLine = (prefix: string) =>
    apply(({ start, text }) => {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const next = text.slice(0, lineStart) + prefix + text.slice(lineStart);
      return { next, caret: start + prefix.length };
    });

  const wrap = (mark: string, hint: string) =>
    apply(({ start, end, text }) => {
      const selected = text.slice(start, end) || hint;
      const next = text.slice(0, start) + mark + selected + mark + text.slice(end);
      return { next, caret: start + mark.length + selected.length + mark.length };
    });

  const insertBlock = (block: string) =>
    apply(({ start, text }) => {
      const needsNl = start > 0 && text[start - 1] !== "\n";
      const ins = (needsNl ? "\n" : "") + block;
      const next = text.slice(0, start) + ins + text.slice(start);
      return { next, caret: start + ins.length };
    });

  const tools: { title: string; icon: ReactNode; action: () => void }[] = [
    { title: "Subtítulo", icon: <Heading2 size={15} />, action: () => prefixLine("## ") },
    { title: "Encabezado menor", icon: <Heading3 size={15} />, action: () => prefixLine("### ") },
    { title: "Negrita", icon: <Bold size={15} />, action: () => wrap("**", "negrita") },
    { title: "Cursiva", icon: <Italic size={15} />, action: () => wrap("*", "cursiva") },
    { title: "Viñetas", icon: <List size={15} />, action: () => prefixLine("- ") },
    { title: "Cita", icon: <Quote size={15} />, action: () => prefixLine("> ") },
    { title: "Separador", icon: <Minus size={15} />, action: () => insertBlock("\n---\n") },
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {tools.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            aria-label={t.title}
            onClick={t.action}
            disabled={preview}
            className="seg-btn p-2 rounded-lg border border-line bg-surface-soft text-muted hover:text-ink hover:bg-surface-raised/70 transition disabled:opacity-40"
          >
            {t.icon}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className={`seg-btn ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
            preview
              ? "border-primary/40 bg-primary/12 text-ink"
              : "border-line bg-surface-soft text-muted hover:text-ink"
          }`}
          aria-pressed={preview}
        >
          {preview ? <Pencil size={13} /> : <Eye size={13} />}
          {preview ? "Editar" : "Vista previa"}
        </button>
      </div>
      {preview ? (
        <div
          className={`input-field ${minHeightClass} overflow-y-auto bg-surface-raised/60`}
        >
          <NotesPreview text={value} />
        </div>
      ) : (
        <textarea
          ref={taRef}
          className={`input-field ${minHeightClass} leading-relaxed`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ??
            "Escribe tus notas… Usa la barra de arriba para subtítulos, viñetas, negritas y citas. Se guardan solas."
          }
        />
      )}
    </div>
  );
}
