import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
  validate?: (value: any) => boolean | string
}

export interface ValidationRules {
  [field: string]: ValidationRule
}

export interface ValidationErrors {
  [field: string]: string
}

export function useFormValidation<T extends Record<string, any>>(
  rules: ValidationRules,
  initialValues?: T
) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = useCallback(
    (field: string, value: any): string | null => {
      const rule = rules[field]
      if (!rule) return null

      // Required check
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return rule.message || `${field} 是必填项`
      }

      // Min length
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        return rule.message || `至少需要 ${rule.minLength} 个字符`
      }

      // Max length
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        return rule.message || `最多 ${rule.maxLength} 个字符`
      }

      // Pattern
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return rule.message || '格式不正确'
      }

      // Custom validate
      if (rule.validate) {
        const result = rule.validate(value)
        if (result === false) {
          return rule.message || '验证失败'
        }
        if (typeof result === 'string') {
          return result
        }
      }

      return null
    },
    [rules]
  )

  const validate = useCallback(
    (field: string, value: any): boolean => {
      const error = validateField(field, value)
      setErrors((prev) => {
        const next = { ...prev }
        if (error) {
          next[field] = error
        } else {
          delete next[field]
        }
        return next
      })
      return !error
    },
    [validateField]
  )

  const validateAll = useCallback(
    (values: T): boolean => {
      const newErrors: ValidationErrors = {}
      let isValid = true

      Object.keys(rules).forEach((field) => {
        const error = validateField(field, values[field])
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      })

      setErrors(newErrors)
      return isValid
    },
    [rules, validateField]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  return {
    errors,
    validate,
    validateAll,
    clearErrors,
    clearFieldError,
  }
}

export default useFormValidation
