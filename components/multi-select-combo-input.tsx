"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type MultiSelectComboInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  suggestions: readonly string[]
  placeholder?: string
  className?: string
}

export function MultiSelectComboInput({
  id,
  label,
  value,
  onChange,
  suggestions,
  placeholder = "Search or type...",
  className,
}: MultiSelectComboInputProps) {
  const [draft, setDraft] = useState("")
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const comboRef = useRef<HTMLDivElement>(null)

  const selectedItems = useMemo(() => {
    return value
      ? value
          .split(/[,;\n]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  }, [value])

  const filteredSuggestions = useMemo(() => {
    const q = draft.trim().toLowerCase()
    return suggestions.filter(
      (s) =>
        !selectedItems.some((x) => x.toLowerCase() === s.toLowerCase()) &&
        (!q || s.toLowerCase().includes(q))
    )
  }, [draft, suggestions, selectedItems])

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  function addToken(token: string) {
    const t = token.trim()
    if (!t) return
    const lower = new Set(selectedItems.map((s) => s.toLowerCase()))
    const next = [...selectedItems]
    const lk = t.toLowerCase()
    if (!lower.has(lk)) {
      next.push(t)
    }
    onChange(next.join(", "))
    setDraft("")
    setSuggestionsOpen(false)
  }

  const removeTokenAt = (index: number) => {
    const next = selectedItems.filter((_, i) => i !== index)
    onChange(next.join(", "))
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`${id}-input`}>{label}</Label>
      <div ref={comboRef} className={cn("rounded-md border border-input bg-background relative", suggestionsOpen && "z-[100]")}>
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border-b border-border">
            {selectedItems.map((s, i) => (
              <Badge
                key={`${s}-${i}`}
                variant="secondary"
                className="pl-2 pr-1 py-0.5 gap-1 font-normal"
              >
                {s}
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-muted"
                  onClick={() => removeTokenAt(i)}
                  aria-label={`Remove ${s}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
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
            onClick={() => setSuggestionsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addToken(draft)
              }
              if (e.key === ",") {
                e.preventDefault()
                addToken(draft)
              }
              if (
                e.key === "Backspace" &&
                !draft &&
                selectedItems.length > 0
              ) {
                removeTokenAt(selectedItems.length - 1)
              }
              if (e.key === "Escape") {
                setSuggestionsOpen(false)
              }
            }}
            placeholder={placeholder}
            className={cn(
              "h-11 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
              selectedItems.length > 0
                ? "rounded-none rounded-b-md"
                : "rounded-md"
            )}
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
                      onClick={() => addToken(s)}
                    >
                      {s}
                    </button>
                  </li>
                ))}
                {filteredSuggestions.length === 0 && draft.trim().length > 0 && (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    No suggestion match — press{" "}
                    <kbd className="px-1 rounded border bg-muted text-[10px]">Enter</kbd> to add
                    &quot;{draft.trim()}&quot;
                  </li>
                )}
              </ul>
            )}
        </div>
      </div>
    </div>
  )
}
