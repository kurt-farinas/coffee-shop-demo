// Everything a re-skin for a new client touches: name, colours, fonts, menu and ingredients.
export const shopConfig = {
  name: 'Kanto Coffee',
  tagline: 'Orders, barista queue and ingredient stock for your coffee shop, in one place.',
  logoText: 'KC',
  locale: 'en-PH',
  currency: 'PHP',
  staff: { ownerName: 'Bea Santos', cashierName: 'Migo Reyes', baristaName: 'Jun Cruz' },
  // text colours here keep at least 4.5:1 contrast on page, surface and soft; the caramel accent takes dark text
  theme: {
    rail: '#3B2418',
    railInk: '#F7EEE3',
    railActive: '#2B190F',
    page: '#FBF5EC',
    surface: '#FFFFFF',
    line: '#E7D9C6',
    soft: '#F3E8D8',
    text: '#2B1D14',
    muted: '#6A5444',
    accent: '#C9843F',
    accentInk: '#7A4415',
    highlight: '#E9BE7E',
    warnBg: '#FBEBD3',
    warnText: '#6B3A06',
    successBg: '#E9F1DF',
    success: '#3D6B1F',
    danger: '#A3302A',
  },
  fonts: { heading: 'Fraunces', body: 'DM Sans' },
  // stock and lowAt in the ingredient's unit; costPerUnit in pesos per unit
  ingredients: [
    { id: 'ing-beans', name: 'Espresso beans', unit: 'g', stock: 5000, lowAt: 1000, costPerUnit: 1.4 },
    { id: 'ing-whole-milk', name: 'Whole milk', unit: 'ml', stock: 12000, lowAt: 3000, costPerUnit: 0.1 },
    { id: 'ing-oat-milk', name: 'Oat milk', unit: 'ml', stock: 4000, lowAt: 1000, costPerUnit: 0.25 },
    { id: 'ing-water', name: 'Filtered water', unit: 'ml', stock: 50000, lowAt: 5000, costPerUnit: 0.01 },
    { id: 'ing-cup', name: 'Cups', unit: 'pc', stock: 400, lowAt: 100, costPerUnit: 4 },
    { id: 'ing-matcha', name: 'Matcha powder', unit: 'g', stock: 500, lowAt: 100, costPerUnit: 6 },
    { id: 'ing-choco', name: 'Cocoa powder', unit: 'g', stock: 1500, lowAt: 300, costPerUnit: 0.8 },
    { id: 'ing-caramel', name: 'Caramel syrup', unit: 'ml', stock: 1000, lowAt: 200, costPerUnit: 0.5 },
    { id: 'ing-condensed', name: 'Condensed milk', unit: 'ml', stock: 1500, lowAt: 300, costPerUnit: 0.3 },
    { id: 'ing-croissant', name: 'Croissant', unit: 'pc', stock: 24, lowAt: 6, costPerUnit: 45 },
    { id: 'ing-ensaymada', name: 'Ensaymada', unit: 'pc', stock: 24, lowAt: 6, costPerUnit: 35 },
  ],
  // prices are whole pesos for a medium; lines with scales change with size, milk lines take the chosen milk
  menu: [
    {
      id: 'item-americano', name: 'Americano', category: 'Espresso', price: 120, allowsShot: true,
      recipe: [{ ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-water', qty: 200, scales: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-latte', name: 'Latte', category: 'Espresso', price: 150, allowsShot: true,
      recipe: [{ ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-iced-latte', name: 'Iced latte', category: 'Espresso', price: 160, allowsShot: true,
      recipe: [{ ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-cappuccino', name: 'Cappuccino', category: 'Espresso', price: 150, allowsShot: true,
      recipe: [{ ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 150, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-spanish-latte', name: 'Spanish latte', category: 'Espresso', price: 170, allowsShot: true,
      recipe: [
        { ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 180, scales: true, milk: true },
        { ingredientId: 'ing-condensed', qty: 30, scales: true }, { ingredientId: 'ing-cup', qty: 1 },
      ],
    },
    {
      id: 'item-caramel-macchiato', name: 'Caramel macchiato', category: 'Espresso', price: 180, allowsShot: true,
      recipe: [
        { ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true },
        { ingredientId: 'ing-caramel', qty: 20, scales: true }, { ingredientId: 'ing-cup', qty: 1 },
      ],
    },
    {
      id: 'item-matcha-latte', name: 'Matcha latte', category: 'Non-coffee', price: 170, allowsShot: false,
      recipe: [{ ingredientId: 'ing-matcha', qty: 5 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-chocolate', name: 'Chocolate', category: 'Non-coffee', price: 150, allowsShot: false,
      recipe: [{ ingredientId: 'ing-choco', qty: 25 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    { id: 'item-croissant', name: 'Croissant', category: 'Pastry', price: 95, allowsShot: false, recipe: [{ ingredientId: 'ing-croissant', qty: 1 }] },
    { id: 'item-ensaymada', name: 'Ensaymada', category: 'Pastry', price: 85, allowsShot: false, recipe: [{ ingredientId: 'ing-ensaymada', qty: 1 }] },
  ],
}
