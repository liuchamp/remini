export function isPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

export function isPassword(value: string): boolean {
  return value.length >= 8 && value.length <= 20 && /[a-zA-Z]/.test(value) && /\d/.test(value)
}

export function isUsername(value: string): boolean {
  return value.length >= 2 && value.length <= 20 && /^[\w\u4e00-\u9fa5]+$/.test(value)
}

export function isPrice(value: number): boolean {
  return value > 0 && value <= 999999.99
}

export function isAmount(value: number, max: number): boolean {
  return value > 0 && value <= max
}

export function isIdCard(value: string): boolean {
  return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(value)
}

export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export const rules = {
  required: (msg: string) => ({
    validate: (v: any) => isRequired(v),
    message: msg
  }),
  phone: {
    validate: isPhone,
    message: '请输入正确的手机号'
  },
  password: {
    validate: isPassword,
    message: '密码需8-20字符，包含字母和数字'
  },
  price: {
    validate: isPrice,
    message: '请输入有效价格'
  }
}
