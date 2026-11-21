// Everything a re-skin for a new client touches: name, colours, fonts, photos, menu and ingredients.

// free Unsplash photos (Unsplash licence), linked from Unsplash's image CDN at the size each place shows them
const photo = (id, width = 640) => `https://images.unsplash.com/${id}?w=${width}&q=70&auto=format&fit=crop`

export const shopConfig = {
  name: 'Kanto Coffee',
  tagline: 'Orders, barista queue and ingredient stock for your coffee shop, in one place.',
  logoText: 'KC',
  heroImage: photo('photo-1572982270699-473dfa34d7e7', 1600),
  locale: 'en-PH',
  currency: 'PHP',
  staff: { ownerName: 'Bea Santos', baristaName: 'Migo Reyes' },
  // text colours here keep at least 4.5:1 contrast on page, surface and soft (shop.config.test.js checks it); the brown accent takes white text (onAccent)
  theme: {
    rail: '#3B2A20',
    railInk: '#F5EDE1',
    railActive: '#4A372B',
    page: '#F7F1E8',
    surface: '#FFFCF7',
    line: '#E4D8C7',
    rule: '#5A4334',
    soft: '#EFE5D6',
    text: '#2E2119',
    muted: '#6B5648',
    accent: '#7A4E2D',
    onAccent: '#FFFFFF',
    accentInk: '#7A4E2D',
    highlight: '#E3C9A2',
    warnBg: '#F7E6CC',
    warnText: '#6B3A06',
    successBg: '#E6EEDC',
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
      id: 'item-americano', name: 'Americano', category: 'Espresso', price: 120, allowsShot: true, image: photo('photo-1579992357154-faf4bde95b3d'),
      recipe: [{ ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-water', qty: 200, scales: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-latte', name: 'Latte', category: 'Espresso', price: 150, allowsShot: true, image: photo('photo-1760163178873-7644a924519e'),
      recipe: [{ ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-iced-latte', name: 'Iced latte', category: 'Espresso', price: 160, allowsShot: true, image: photo('photo-1578314675249-a6910f80cc4e'),
      recipe: [{ ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-cappuccino', name: 'Cappuccino', category: 'Espresso', price: 150, allowsShot: true, image: photo('photo-1761783768352-e7f42bfa9988'),
      recipe: [{ ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 150, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-spanish-latte', name: 'Spanish latte', category: 'Espresso', price: 170, allowsShot: true, image: photo('photo-1609595428024-d5eec1a1af06'),
      recipe: [
        { ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 180, scales: true, milk: true },
        { ingredientId: 'ing-condensed', qty: 30, scales: true }, { ingredientId: 'ing-cup', qty: 1 },
      ],
    },
    {
      id: 'item-caramel-macchiato', name: 'Caramel macchiato', category: 'Espresso', price: 180, allowsShot: true, image: photo('photo-1570517130750-10c67ffdde09'),
      recipe: [
        { ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true },
        { ingredientId: 'ing-caramel', qty: 20, scales: true }, { ingredientId: 'ing-cup', qty: 1 },
      ],
    },
    {
      id: 'item-matcha-latte', name: 'Matcha latte', category: 'Non-coffee', price: 170, allowsShot: false, image: photo('photo-1515823064-d6e0c04616a7'),
      recipe: [{ ingredientId: 'ing-matcha', qty: 5 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    {
      id: 'item-chocolate', name: 'Chocolate', category: 'Non-coffee', price: 150, allowsShot: false, image: photo('photo-1517578239113-b03992dcdd25'),
      recipe: [{ ingredientId: 'ing-choco', qty: 25 }, { ingredientId: 'ing-whole-milk', qty: 200, scales: true, milk: true }, { ingredientId: 'ing-cup', qty: 1 }],
    },
    { id: 'item-croissant', name: 'Croissant', category: 'Pastry', price: 95, allowsShot: false, image: photo('photo-1763207291761-e27bb059d851'), recipe: [{ ingredientId: 'ing-croissant', qty: 1 }] },
    { id: 'item-ensaymada', name: 'Ensaymada', category: 'Pastry', price: 85, allowsShot: false, image: photo('photo-1688084436286-8f0ca14e9390'), recipe: [{ ingredientId: 'ing-ensaymada', qty: 1 }] },
  ],
}
