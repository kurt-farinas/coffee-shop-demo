export const SIZES = { S: { add: -20, factor: 0.8 }, M: { add: 0, factor: 1 }, L: { add: 30, factor: 1.25 } }
export const MILKS = { whole: { add: 0, ingredientId: 'ing-whole-milk' }, oat: { add: 30, ingredientId: 'ing-oat-milk' } }
export const SHOT = { add: 40, grams: 18 }
export const SUGAR_LEVELS = [0, 25, 50, 100]
export const CATEGORIES = ['Espresso', 'Non-coffee', 'Pastry']
export const DEFAULT_OPTIONS ={ size: 'M', milk: 'whole', extraShot: false, sugar: 100 }

// which choices this item takes: pastries have no size or sugar, no milk line means no milk, no shot unless allowed
export function choicesFor(item) {
  const pastry = item.category === 'Pastry'
  return { size: !pastry, milk: item.recipe.some((line) => line.milk), shot: !!item.allowsShot, sugar: !pastry }
}

// the options that actually apply to this item: a choice the item does not take falls back to the default
function applied(item, given) {
  const options = { ...DEFAULT_OPTIONS, ...given } // a line sent without options gets the defaults
  const c = choicesFor(item)
  return {
    size: c.size ? options.size : DEFAULT_OPTIONS.size,
    milk: c.milk ? options.milk : DEFAULT_OPTIONS.milk,
    extraShot: c.shot && options.extraShot,
    sugar: c.sugar ? options.sugar : DEFAULT_OPTIONS.sugar,
  }
}

export function linePrice(item, options) {
  const o = applied(item, options)
  return item.price + SIZES[o.size].add + MILKS[o.milk].add + (o.extraShot ? SHOT.add : 0)
}

// ingredient amounts for one unit of the item, rounded to whole units
export function lineUsage(item, options) {
  const o = applied(item, options)
  const usage = {}
  for (const line of item.recipe) {
    const id = line.milk ? MILKS[o.milk].ingredientId : line.ingredientId
    usage[id] = (usage[id] ?? 0) + (line.scales ? Math.round(line.qty * SIZES[o.size].factor) : line.qty)
  }
  if (o.extraShot) usage['ing-beans'] = (usage['ing-beans'] ?? 0) + SHOT.grams
  return usage
}

export function optionsLabel(item, options) {
  const o = applied(item, options)
  const parts = []
  if (o.size !== DEFAULT_OPTIONS.size) parts.push(o.size)
  if (o.milk !== DEFAULT_OPTIONS.milk) parts.push(o.milk[0].toUpperCase() + o.milk.slice(1))
  if (o.extraShot) parts.push('+shot')
  if (o.sugar !== DEFAULT_OPTIONS.sugar) parts.push(`${o.sugar}% sugar`)
  return parts.join(' · ')
}
