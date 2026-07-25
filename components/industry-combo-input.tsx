"use client"

import { SuggestionComboInput } from "@/components/suggestion-combo-input"
import {
  formatIndustryToken,
  normalizeIndustryCsv,
  SUGGESTED_INDUSTRIES,
} from "@/lib/suggested-industries"

type IndustryComboInputProps = {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function IndustryComboInput({
  id = "industry-combo",
  label = "Industry",
  value,
  onChange,
  className,
}: IndustryComboInputProps) {
  // Keep first value only and map legacy snake_case labels
  const normalized = value ? formatIndustryToken(value.split(/[,;]/)[0]?.trim() || "") : ""

  return (
    <SuggestionComboInput
      id={id}
      label={label}
      value={normalized}
      onChange={(next) => onChange(formatIndustryToken(next))}
      suggestions={SUGGESTED_INDUSTRIES}
      placeholder="Search or type an industry"
      className={className}
    />
  )
}

export { normalizeIndustryCsv }
