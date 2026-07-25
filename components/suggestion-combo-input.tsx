"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type SuggestionComboInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  suggestions: readonly string[]
  placeholder?: string
  className?: string
}

export function SuggestionComboInput({
  id,
  label,
  value,
  onChange,
  suggestions,
  placeholder = "Search or type...",
  className,
}: SuggestionComboInputProps) {
  const [draft, setDraft] = useState("")
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const comboRef = useRef<HTMLDivElement>(null)

  const selected = (value || "").trim()

  const filteredSuggestions = useMemo(() => {
    const q = draft.trim().toLowerCase()
    return suggestions.filter((s) => !q || s.toLowerCase().includes(q))
  }, [draft, suggestions])

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  function selectValue(token: string) {
    const next = token.trim()
    if (!next) return
    onChange(next)
    setDraft("")
    setSuggestionsOpen(false)
  }

  function clearSelection() {
    onChange("")
    setDraft("")
    setSuggestionsOpen(false)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`${id}-input`}>{label}</Label>
      <div ref={comboRef} className="rounded-md border border-input bg-background relative">
        {selected ? (
          <div className="flex items-center justify-between gap-2 px-3 h-11">
            <span className="text-sm truncate">{selected}</span>
            <button
              type="button"
              className="shrink-0 rounded-full p-1 hover:bg-muted"
              onClick={clearSelection}
              aria-label={`Clear ${label.toLowerCase()}`}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="relative isolate">
            <Input
              id={`${id}-input`}
              autoComplete="off"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                setSuggestionsOpen(true)
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => {
                if (draft.trim()) {
                  selectValue(draft)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  selectValue(draft)
                }
                if (e.key === "Escape") {
                  setSuggestionsOpen(false)
                }
              }}
              placeholder={placeholder}
              className="h-11 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none rounded-md"
            />

            {suggestionsOpen &&
              (filteredSuggestions.length > 0 || draft.trim().length > 0) && (
                <ul
                  className="absolute left-0 right-0 top-full z-[200] mt-0.5 max-h-52 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg ring-1 ring-black/5"
                  role="listbox"
                >
                  {filteredSuggestions.map((s) => (
                    <li key={s} role="option">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => selectValue(s)}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                  {filteredSuggestions.length === 0 && draft.trim().length > 0 && (
                    <li className="px-3 py-2 text-sm text-muted-foreground">
                      No suggestion match — press{" "}
                      <kbd className="px-1 rounded border bg-muted text-[10px]">Enter</kbd> to use
                      &quot;{draft.trim()}&quot;
                    </li>
                  )}
                </ul>
              )}
          </div>
        )}
      </div>
    </div>
  )
}
