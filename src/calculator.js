export const DEFAULT_COVERAGE = 350
export const PLANNING_ALLOWANCE = 0.1

export function parsePositive(value, label) {
  if (value === '' || value === null || value === undefined) return { error: `Enter ${label.toLowerCase()}.` }
  const number = Number(value)
  if (!Number.isFinite(number)) return { error: `${label} must be a number.` }
  if (number <= 0) return { error: `${label} must be greater than zero.` }
  return { value: number }
}

export function calculatePaint({ length, width, wallHeight, doors, windows, coats, coverage = DEFAULT_COVERAGE, ceiling }) {
  const values = [
    parsePositive(length, 'Room length'), parsePositive(width, 'Room width'),
    parsePositive(wallHeight, 'Wall height'), parsePositive(coats, 'Number of coats'),
    parsePositive(coverage, 'Coverage per gallon')
  ]
  const errors = values.map(item => item.error).filter(Boolean)
  if (errors.length) return { errors }

  const doorArea = Math.max(0, Number(doors) || 0) * 21
  const windowArea = Math.max(0, Number(windows) || 0) * 15
  const wallArea = (2 * (values[0].value + values[1].value) * values[2].value) - doorArea - windowArea
  const ceilingArea = ceiling ? values[0].value * values[1].value : 0
  const paintArea = Math.max(0, wallArea + ceilingArea)
  const gallonsNeeded = (paintArea * values[3].value) / values[4].value
  const recommendedGallons = gallonsNeeded * (1 + PLANNING_ALLOWANCE)

  return { wallArea, ceilingArea, paintArea, gallonsNeeded, recommendedGallons, errors: [] }
}

export function formatNumber(value, digits = 1) {
  return Number(value).toFixed(digits)
}

export function createCopyText({ result, coats, coverage }) {
  return [
    'Paint estimate',
    `Paintable area: ${formatNumber(result.paintArea)} sq ft`,
    `Coats: ${coats}`,
    `Coverage: ${coverage} sq ft/gallon`,
    `Calculated quantity: ${formatNumber(result.gallonsNeeded)} gallons`,
    `Recommended order: ${formatNumber(result.recommendedGallons)} gallons`,
    'Planning assumption: 10% allowance'
  ].join('\n')
}
