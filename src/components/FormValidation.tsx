import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface BaseFieldProps {
  label: string
  error?: string | null
  touched?: boolean
  required?: boolean
  helperText?: string
  id?: string
  className?: string
}

interface ValidatedInputProps extends BaseFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'prefix'> {
  value: string
  onChange: (val: string) => void
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export function ValidatedInput({
  label,
  value,
  onChange,
  error,
  touched,
  required,
  helperText,
  id,
  prefix,
  suffix,
  placeholder,
  type = 'text',
  disabled,
  className = '',
  ...rest
}: ValidatedInputProps) {
  const hasError = touched && !!error
  const isValid = touched && !error && value && value.trim().length > 0

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
          {label}
          {required && <span className="text-error font-bold">*</span>}
        </label>
        {isValid && (
          <span className="flex items-center gap-1 text-[11px] text-success font-medium">
            <CheckCircle2 size={12} /> Correcto
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 flex items-center pointer-events-none text-text-secondary">
            {prefix}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full rounded-xl py-2.5 px-3.5 text-sm bg-surface-bg text-text-primary border transition-all duration-200 outline-none
            ${prefix ? 'pl-9' : ''}
            ${suffix ? 'pr-16' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-bg-faint' : ''}
            ${
              hasError
                ? 'border-error focus:ring-2 focus:ring-error/20 bg-error/5'
                : isValid
                ? 'border-success/60 focus:border-success focus:ring-2 focus:ring-success/20'
                : 'border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 hover:border-text-secondary/40'
            }
          `}
          {...rest}
        />
        {suffix && (
          <div className="absolute right-3 flex items-center pointer-events-none text-xs font-medium text-text-secondary">
            {suffix}
          </div>
        )}
      </div>

      {hasError ? (
        <p className="flex items-center gap-1 text-xs text-error font-medium mt-0.5 animate-fadeIn">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-text-secondary mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
}

interface ValidatedTextareaProps extends BaseFieldProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string
  onChange: (val: string) => void
}

export function ValidatedTextarea({
  label,
  value,
  onChange,
  error,
  touched,
  required,
  helperText,
  id,
  placeholder,
  rows = 3,
  disabled,
  className = '',
  ...rest
}: ValidatedTextareaProps) {
  const hasError = touched && !!error
  const isValid = touched && !error && value && value.trim().length > 0

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
          {label}
          {required && <span className="text-error font-bold">*</span>}
        </label>
        {isValid && (
          <span className="flex items-center gap-1 text-[11px] text-success font-medium">
            <CheckCircle2 size={12} /> Correcto
          </span>
        )}
      </div>

      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-xl py-2.5 px-3.5 text-sm bg-surface-bg text-text-primary border transition-all duration-200 outline-none resize-none
          ${disabled ? 'opacity-50 cursor-not-allowed bg-bg-faint' : ''}
          ${
            hasError
              ? 'border-error focus:ring-2 focus:ring-error/20 bg-error/5'
              : isValid
              ? 'border-success/60 focus:border-success focus:ring-2 focus:ring-success/20'
              : 'border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 hover:border-text-secondary/40'
          }
        `}
        {...rest}
      />

      {hasError ? (
        <p className="flex items-center gap-1 text-xs text-error font-medium mt-0.5 animate-fadeIn">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-text-secondary mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
}

interface ValidatedSelectProps extends BaseFieldProps {
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
}

export function ValidatedSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción...',
  error,
  touched,
  required,
  helperText,
  id,
  disabled,
  className = '',
}: ValidatedSelectProps) {
  const hasError = touched && !!error
  const isValid = touched && !error && !!value

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
          {label}
          {required && <span className="text-error font-bold">*</span>}
        </label>
        {isValid && (
          <span className="flex items-center gap-1 text-[11px] text-success font-medium">
            <CheckCircle2 size={12} /> Correcto
          </span>
        )}
      </div>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full rounded-xl py-2.5 px-3.5 text-sm bg-surface-bg text-text-primary border transition-all duration-200 outline-none appearance-none cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed bg-bg-faint' : ''}
            ${
              hasError
                ? 'border-error focus:ring-2 focus:ring-error/20 bg-error/5'
                : isValid
                ? 'border-success/60 focus:border-success focus:ring-2 focus:ring-success/20'
                : 'border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 hover:border-text-secondary/40'
            }
          `}
        >
          <option value="" disabled className="text-text-secondary">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-bg text-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary text-xs">
          ▼
        </div>
      </div>

      {hasError ? (
        <p className="flex items-center gap-1 text-xs text-error font-medium mt-0.5 animate-fadeIn">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-text-secondary mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
}
