import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * The single sanitized Markdown renderer used by the builder preview and the
 * public event page. Raw HTML is not enabled; rehype-sanitize is a second
 * layer of defence for links and images.
 */
export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "space-y-3 text-sm leading-6 text-slate-700",
        "[&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-slate-900",
        "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900",
        "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900",
        "[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
        "[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
        "[&_a]:font-medium [&_a]:text-indigo-600 [&_a]:underline",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:text-slate-500",
        className,
      )}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ node: _node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer nofollow" />
          ),
          code: ({ children, className: codeClassName }) => (
            <code
              className={cn(
                "rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800",
                codeClassName,
              )}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {children}
            </pre>
          ),
        }}
      >
        {content || "_Nothing here yet._"}
      </ReactMarkdown>
    </div>
  );
}
