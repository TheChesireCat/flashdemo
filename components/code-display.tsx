"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { json } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { sql } from "@codemirror/lang-sql"
import { xml } from "@codemirror/lang-xml"
import { php } from "@codemirror/lang-php"
import { rust } from "@codemirror/lang-rust"
import { go } from "@codemirror/lang-go"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"

interface CodeDisplayProps {
  code: string
  language?: string
  readOnly?: boolean
  onChange?: (value: string) => void
  className?: string
}

const languageExtensions = {
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  jsx: javascript({ jsx: true }),
  tsx: javascript({ typescript: true, jsx: true }),
  python: python(),
  java: java(),
  cpp: cpp(),
  c: cpp(),
  html: html(),
  css: css(),
  json: json(),
  markdown: markdown(),
  sql: sql(),
  xml: xml(),
  php: php(),
  rust: rust(),
  go: go(),
}

// Create extensions with hard width guards
const extensions = [
  EditorView.theme({
    "&": {
      fontSize: "14px",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
    },
    ".cm-content": {
      padding: "12px",
      minHeight: "100px",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
    },
    ".cm-focused": {
      outline: "none",
    },
    ".cm-editor": {
      borderRadius: "6px",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
    },
    ".cm-scroller": {
      overflow: "auto",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
    },
    ".cm-line": {
      maxWidth: "100%",
      boxSizing: "border-box",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
    },
    ".cm-gutters": {
      boxSizing: "border-box",
    },
  }),
]

export function CodeDisplay({
  code,
  language,
  readOnly = true,
  onChange,
  className,
}: CodeDisplayProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <pre className={`bg-muted p-2 md:p-3 rounded-md overflow-auto text-xs md:text-sm font-mono max-w-full ${className}`}>
        {code}
      </pre>
    )
  }

  const isDark = resolvedTheme === "dark"

  const languageExtension =
    language && language !== "plaintext" && languageExtensions[language as keyof typeof languageExtensions]
  const currentExtensions = [...extensions]

  if (languageExtension) {
    currentExtensions.push(languageExtension)
  }

  return (
    <div className={`w-full max-w-full overflow-x-auto min-w-0 ${className}`}>
      <div className="w-full max-w-full [&_.cm-editor]:w-full [&_.cm-editor]:max-w-full [&_.cm-editor]:text-xs md:[&_.cm-editor]:text-sm [&_.cm-content]:p-2 md:[&_.cm-content]:p-3 [&_.cm-content]:min-h-[80px] md:[&_.cm-content]:min-h-[100px] [&_.cm-content]:w-full [&_.cm-content]:max-w-full [&_.cm-scroller]:w-full [&_.cm-scroller]:max-w-full [&_.cm-line]:max-w-full [&_.cm-line]:break-words [&_.cm-line]:[overflow-wrap:anywhere]">
        <CodeMirror
          value={code}
          onChange={onChange}
          theme={isDark ? oneDark : undefined}
          extensions={currentExtensions}
          editable={!readOnly}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
          }}
        />
      </div>
    </div>
  )
}

export const supportedLanguages = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "xml", label: "XML" },
  { value: "php", label: "PHP" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
]
