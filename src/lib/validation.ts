import { StrKey } from '@stellar/stellar-sdk'

/**
 * Validates standard email address RFC 5322 compliance.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())
}

/**
 * Validates a Stellar Ed25519 Public Key (starts with G, exactly 56 chars, valid checksum).
 */
export function isValidStellarPublicKey(key: string): boolean {
  if (!key) return false
  const clean = key.trim()
  if (!clean.startsWith('G') || clean.length !== 56) return false
  try {
    return StrKey.isValidEd25519PublicKey(clean)
  } catch {
    return false
  }
}

/**
 * Validates international phone format.
 * Rejects any letters or illegal symbols. Requires between 8 and 15 actual digits.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true // optional field
  const trimmed = phone.trim()
  // Reject if contains letters or characters other than digits, +, -, (, ), spaces
  if (!/^[+]?[\d\s\-()]+$/.test(trimmed)) return false
  const digitsOnly = trimmed.replace(/\D/g, '')
  return digitsOnly.length >= 8 && digitsOnly.length <= 15
}


/**
 * Validates business registration fields.
 */
export function validateBusinessRegistration(values: {
  name: string
  email: string
  password: string
  category: string
  phone?: string
  wallet?: string | null
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!values.name || values.name.trim().length < 3) {
    errors.name = 'El nombre del negocio debe tener al menos 3 caracteres.'
  }

  if (!values.email || !isValidEmail(values.email)) {
    errors.email = 'Ingresa un correo electrónico corporativo válido.'
  }

  if (!values.password || values.password.length < 6) {
    errors.password = 'La contraseña debe tener mínimo 6 caracteres.'
  }

  if (!values.category || values.category.trim() === '') {
    errors.category = 'Selecciona una categoría para tu negocio.'
  }

  if (values.phone && !isValidPhone(values.phone)) {
    errors.phone = 'Ingresa un número telefónico válido (mínimo 8 dígitos).'
  }

  if (values.wallet && values.wallet.trim() !== '') {
    if (!isValidStellarPublicKey(values.wallet)) {
      errors.wallet = 'La clave pública de Stellar es inválida (debe empezar con G y tener 56 caracteres).'
    }
  }

  return errors
}

/**
 * Validates promoter registration fields.
 */
export function validatePromoterRegistration(values: {
  name: string
  email: string
  password: string
  phone?: string
  wallet?: string | null
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!values.name || values.name.trim().length < 3) {
    errors.name = 'Ingresa tu nombre completo (mínimo 3 caracteres).'
  }

  if (!values.email || !isValidEmail(values.email)) {
    errors.email = 'Ingresa un correo electrónico válido.'
  }

  if (!values.password || values.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (values.phone && !isValidPhone(values.phone)) {
    errors.phone = 'Ingresa un teléfono válido o déjalo vacío.'
  }

  if (values.wallet && values.wallet.trim() !== '') {
    if (!isValidStellarPublicKey(values.wallet)) {
      errors.wallet = 'La dirección Stellar no es válida. Debe ser una clave pública G... de 56 caracteres.'
    }
  }

  return errors
}

/**
 * Validates Step 1 of Campaign Creation (General Information).
 */
export function validateCampaignStep1(values: {
  name: string
  description: string
  product: string
  category: string
  startDate: string
  endDate: string
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!values.name || values.name.trim().length < 4) {
    errors.name = 'El nombre de la campaña debe tener al menos 4 caracteres.'
  } else if (values.name.length > 80) {
    errors.name = 'El nombre no puede superar los 80 caracteres.'
  }

  if (!values.description || values.description.trim().length < 15) {
    const currentLen = values.description ? values.description.trim().length : 0
    errors.description = `La descripción requiere al menos 15 caracteres (actualmente llevas ${currentLen}).`
  } else if (values.description.length > 500) {
    errors.description = 'La descripción no puede superar los 500 caracteres.'
  }

  if (!values.product || values.product.trim().length < 3) {
    errors.product = 'Especifica el producto o servicio a promocionar (mínimo 3 caracteres).'
  } else if (values.product.length > 80) {
    errors.product = 'El producto no puede superar los 80 caracteres.'
  }

  if (!values.category || values.category.trim() === '') {
    errors.category = 'Selecciona la categoría de la campaña.'
  }

  if (!values.startDate || values.startDate.trim() === '') {
    errors.startDate = 'Indica la fecha de inicio.'
  }

  if (!values.endDate || values.endDate.trim() === '') {
    errors.endDate = 'Indica la fecha de finalización.'
  } else if (values.startDate) {
    const start = new Date(values.startDate)
    const end = new Date(values.endDate)
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
      errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio.'
    }
  }

  return errors
}

/**
 * Validates Step 2 of Campaign Creation (Economics & Escrow).
 */
export function validateCampaignStep2(values: {
  budget: string
  reward: string
  maxConversions?: string
}): Record<string, string> {
  const errors: Record<string, string> = {}

  const budgetNum = parseFloat(values.budget)
  const rewardNum = parseFloat(values.reward)

  if (isNaN(budgetNum) || budgetNum <= 0) {
    errors.budget = 'El presupuesto debe ser un número mayor a 0 USDC.'
  } else if (budgetNum < 10) {
    errors.budget = 'El presupuesto mínimo sugerido para custodia en Stellar es de 10 USDC.'
  }

  if (isNaN(rewardNum) || rewardNum <= 0) {
    errors.reward = 'La recompensa por conversión debe ser mayor a 0 USDC.'
  } else if (!isNaN(budgetNum) && rewardNum > budgetNum) {
    errors.reward = 'La recompensa por conversión no puede superar el presupuesto total.'
  }

  return errors
}

/**
 * Validates Step 3 of Campaign Creation (Attribution & Action).
 */
export function validateCampaignStep3(values: {
  action: string
  validation: string
  identifier: string
  conditions?: string
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!values.action || values.action.trim().length < 4) {
    errors.action = 'Describe la acción verificable que debe realizar el cliente (ej. Compra de entrada).'
  }

  if (!values.validation || values.validation.trim() === '') {
    errors.validation = 'Selecciona el método de atribución.'
  }

  if (!values.identifier || values.identifier.trim().length < 3) {
    errors.identifier = 'Especifica el dato que identificará la operación (ej. N° de Ticket o Boleta).'
  }

  return errors
}
