import { getCliClient } from 'sanity/cli'

const client = getCliClient({apiVersion: '2023-05-03'})

const CATEGORIES = [
  { _id: 'cat_entrees', title: 'Entrées', titleEn: 'Starters', order: 1 },
  { _id: 'cat_plats', title: 'Plats', titleEn: 'Mains', order: 2 },
  { _id: 'cat_desserts', title: 'Desserts', titleEn: 'Desserts', order: 3 },
  { _id: 'cat_vins', title: 'La Cave', titleEn: 'Wine Cellar', order: 4 },
  { _id: 'cat_bar', title: 'Le Bar', titleEn: 'The Bar', order: 5 },
]

const BADGES = [
  { _id: 'badge_chef', title: 'Signature', titleEn: 'Signature', category: 'DIET', iconType: 'lucide', lucideIcon: 'ChefHat', color: '#D4AF37', isOutline: false },
  { _id: 'badge_spicy', title: 'Épicé', titleEn: 'Spicy', category: 'DIET', iconType: 'emoji', emoji: '🌶️', color: '#EF4444', isOutline: false },
  { _id: 'badge_vegan', title: 'Vegan', titleEn: 'Vegan', category: 'DIET', iconType: 'lucide', lucideIcon: 'Leaf', color: '#4ADE80', isOutline: true },
  { _id: 'badge_gluten', title: 'Sans Gluten', titleEn: 'Gluten Free', category: 'DIET', iconType: 'lucide', lucideIcon: 'Wheat', color: '#FACC15', isOutline: true },
  { _id: 'badge_viande', title: 'Viande', titleEn: 'Meat', category: 'INGREDIENT', iconType: 'lucide', lucideIcon: 'Beef', color: '#F87171', isOutline: false },
  { _id: 'badge_poisson', title: 'Mer', titleEn: 'Sea', category: 'INGREDIENT', iconType: 'lucide', lucideIcon: 'Fish', color: '#60A5FA', isOutline: false },
  { _id: 'badge_sucre', title: 'Douceur', titleEn: 'Sweet', category: 'DESSERT', iconType: 'lucide', lucideIcon: 'Candy', color: '#F472B6', isOutline: false },
  { _id: 'badge_rouge', title: 'Rouge', titleEn: 'Red', category: 'DRINK', iconType: 'lucide', lucideIcon: 'Wine', color: '#9F1239', isOutline: false },
  { _id: 'badge_blanc', title: 'Blanc', titleEn: 'White', category: 'DRINK', iconType: 'lucide', lucideIcon: 'Wine', color: '#FDE047', isOutline: true },
  { _id: 'badge_bulle', title: 'Pétillant', titleEn: 'Sparkling', category: 'DRINK', iconType: 'lucide', lucideIcon: 'Sparkles', color: '#FCD34D', isOutline: false },
  { _id: 'badge_cocktail', title: 'Création', titleEn: 'Creation', category: 'DRINK', iconType: 'lucide', lucideIcon: 'Martini', color: '#A78BFA', isOutline: false },
]

const getRandomRating = () => parseFloat((Math.random() * (5.0 - 4.2) + 4.2).toFixed(1));

const DISHES = [
  // --- ENTRÉES (8) ---
  {
    title: "Foie Gras Poêlé", enTitle: "Pan-Seared Foie Gras",
    description: "Escalope de foie gras chaud, chutney de mangue et pain d'épices maison.",
    enDescription: "Warm foie gras escalope, mango chutney and homemade gingerbread.",
    price: 18000, category: "cat_entrees", badges: ["badge_chef", "badge_viande"], isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1628682736481-6701469e38f1?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Carpaccio de Saint-Jacques", enTitle: "Scallop Carpaccio",
    description: "Fines tranches de Saint-Jacques, huile de truffe blanche, zestes de citron vert.",
    enDescription: "Thinly sliced scallops, white truffle oil, lime zest.",
    price: 16000, category: "cat_entrees", badges: ["badge_poisson", "badge_gluten"],
    imageUrl: "https://images.unsplash.com/photo-1629385737023-01181827d7f3?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Velouté de Potimarron", enTitle: "Pumpkin Cream Soup",
    description: "Crème onctueuse, éclats de châtaignes torréfiées et huile de courge.",
    enDescription: "Smooth cream soup, roasted chestnut pieces and pumpkin oil.",
    price: 12000, category: "cat_entrees", badges: ["badge_vegan"],
    imageUrl: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Escargots de Bourgogne", enTitle: "Burgundy Snails",
    description: "Douzaine d'escargots Label Rouge, beurre persillé à l'ail doux.",
    enDescription: "Dozen Label Rouge snails, parsley butter with sweet garlic.",
    price: 14000, category: "cat_entrees", badges: ["badge_viande"],
    imageUrl: "https://images.unsplash.com/photo-1596464716127-7e36a3700000?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Saumon Gravlax", enTitle: "Salmon Gravlax",
    description: "Mariné à l'aneth et baies roses, crème aigrelette au citron.",
    enDescription: "Marinated with dill and pink peppercorns, lemon sour cream.",
    price: 15000, category: "cat_entrees", badges: ["badge_poisson", "badge_gluten"],
    imageUrl: "https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Tartare de Thon Rouge", enTitle: "Bluefin Tuna Tartare",
    description: "Avocat, mangue, sésame grillé et sauce ponzu.",
    enDescription: "Avocado, mango, toasted sesame and ponzu sauce.",
    price: 17000, category: "cat_entrees", badges: ["badge_poisson"],
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Œuf Parfait Bio", enTitle: "Bio Perfect Egg",
    description: "Crème de champignons des bois, mouillettes au beurre salé.",
    enDescription: "Wild mushroom cream, salted butter soldiers.",
    price: 13000, category: "cat_entrees", badges: [],
    imageUrl: "https://images.unsplash.com/photo-1595232750942-0c679a957262?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Burrata des Pouilles", enTitle: "Puglia Burrata",
    description: "300g, tomates anciennes, pesto alla genovese maison.",
    enDescription: "300g, heirloom tomatoes, homemade pesto alla genovese.",
    price: 16000, category: "cat_entrees", badges: ["badge_gluten"],
    imageUrl: "https://images.unsplash.com/photo-1529312266912-b33cf6252e2f?q=80&w=800&auto=format&fit=crop"
  },

  // --- PLATS (12) ---
  {
    title: "Filet de Bœuf Rossini", enTitle: "Rossini Beef Fillet",
    description: "Le classique : Tournedos, foie gras, sauce périgueux et pommes sarladaises.",
    enDescription: "The classic: Tournedos, foie gras, Perigueux sauce and Sarladaise potatoes.",
    price: 32000, category: "cat_plats", badges: ["badge_viande", "badge_chef"], isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Dos de Cabillaud Skrei", enTitle: "Skrei Cod Fillet",
    description: "Rôti sur peau, mousseline de panais et beurre blanc au yuzu.",
    enDescription: "Roasted on skin, parsnip mousseline and yuzu beurre blanc.",
    price: 24000, category: "cat_plats", badges: ["badge_poisson", "badge_gluten"],
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Risotto à la Truffe Noire", enTitle: "Black Truffle Risotto",
    description: "Riz Carnaroli, parmesan 24 mois et copeaux de truffe fraîche.",
    enDescription: "Carnaroli rice, 24-month aged parmesan and fresh truffle shavings.",
    price: 26000, category: "cat_plats", badges: ["badge_vegan"],
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5ec371?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Carré d'Agneau en Croûte", enTitle: "Crusted Rack of Lamb",
    description: "Herbes de Provence, ail confit et légumes glacés.",
    enDescription: "Provence herbs, confit garlic and glazed vegetables.",
    price: 29000, category: "cat_plats", badges: ["badge_viande"],
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76697766541?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Magret de Canard", enTitle: "Duck Breast",
    description: "Sauce au miel et épices, purée de patates douces.",
    enDescription: "Honey and spice sauce, sweet potato puree.",
    price: 23000, category: "cat_plats", badges: ["badge_viande"],
    imageUrl: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Homard Bleu Grillé", enTitle: "Grilled Blue Lobster",
    description: "Entier, beurre maître d'hôtel, servi avec frites maison.",
    enDescription: "Whole, maitre d'hotel butter, served with homemade fries.",
    price: 45000, category: "cat_plats", badges: ["badge_poisson", "badge_chef"],
    imageUrl: "https://images.unsplash.com/photo-1559740038-191cc8282828?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Burger Signature", enTitle: "Signature Burger",
    description: "Bœuf Wagyu, cheddar affiné, oignons caramélisés, sauce truffe.",
    enDescription: "Wagyu beef, aged cheddar, caramelized onions, truffle sauce.",
    price: 22000, category: "cat_plats", badges: ["badge_viande"],
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Poulpe Grillé", enTitle: "Grilled Octopus",
    description: "Tentacule de poulpe de roche, houmous, piment d'Espelette.",
    enDescription: "Rock octopus tentacle, hummus, Espelette pepper.",
    price: 25000, category: "cat_plats", badges: ["badge_poisson", "badge_spicy"],
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Suprême de Volaille Jaune", enTitle: "Yellow Poultry Supreme",
    description: "Cuit basse température, sauce morilles, gratin dauphinois.",
    enDescription: "Slow-cooked, morel sauce, dauphinois gratin.",
    price: 21000, category: "cat_plats", badges: ["badge_viande"],
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Linguine Vongole", enTitle: "Vongole Linguine",
    description: "Palourdes fraîches, vin blanc, ail, persil et piment.",
    enDescription: "Fresh clams, white wine, garlic, parsley and chili.",
    price: 19000, category: "cat_plats", badges: ["badge_poisson"],
    imageUrl: "https://images.unsplash.com/photo-1563379926898-0f5a3a3a3a3a?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Curry Vert Végétal", enTitle: "Vegetable Green Curry",
    description: "Lait de coco, légumes croquants, tofu fumé, riz jasmin.",
    enDescription: "Coconut milk, crunchy vegetables, smoked tofu, jasmine rice.",
    price: 18000, category: "cat_plats", badges: ["badge_vegan", "badge_spicy"],
    imageUrl: "https://images.unsplash.com/photo-1626804475297-411dbe62c358?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Tartare de Bœuf au Couteau", enTitle: "Hand-Cut Beef Tartare",
    description: "Préparé devant vous, frites maison, salade verte.",
    enDescription: "Prepared at your table, homemade fries, green salad.",
    price: 20000, category: "cat_plats", badges: ["badge_viande"],
    imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop"
  },

  // --- DESSERTS (8) ---
  {
    title: "Sphère Chocolat Or", enTitle: "Gold Chocolate Sphere",
    description: "Coque chocolat noir, mousse praliné, insert fruit de la passion.",
    enDescription: "Dark chocolate shell, praline mousse, passion fruit insert.",
    price: 14000, category: "cat_desserts", badges: ["badge_sucre", "badge_chef"], isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Tarte Citron Revisitée", enTitle: "Revisited Lemon Tart",
    description: "Sablé breton, crémeux citron jaune, meringue italienne brûlée.",
    enDescription: "Breton shortbread, yellow lemon cream, burnt Italian meringue.",
    price: 11000, category: "cat_desserts", badges: ["badge_sucre"],
    imageUrl: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Pavlova Fruits Rouges", enTitle: "Red Berries Pavlova",
    description: "Meringue croquante, chantilly mascarpone et fruits frais.",
    enDescription: "Crunchy meringue, mascarpone whipped cream and fresh fruit.",
    price: 12000, category: "cat_desserts", badges: ["badge_gluten", "badge_sucre"],
    imageUrl: "https://images.unsplash.com/photo-1488477181946-64280a0291777?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Profiteroles Géantes", enTitle: "Giant Profiteroles",
    description: "Choux craquelin, glace vanille bourbon, chocolat chaud.",
    enDescription: "Crackling choux, bourbon vanilla ice cream, hot chocolate.",
    price: 11000, category: "cat_desserts", badges: ["badge_sucre"],
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Baba au Rhum", enTitle: "Rum Baba",
    description: "Imbibé au Rhum Vieux, crème légère vanillée.",
    enDescription: "Soaked in Aged Rum, light vanilla cream.",
    price: 13000, category: "cat_desserts", badges: ["badge_sucre"],
    imageUrl: "https://images.unsplash.com/photo-1579372786545-7a7a7a7a7a7a?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Café Gourmand", enTitle: "Gourmet Coffee",
    description: "Assortiment de 4 mignardises du Chef pâtissier.",
    enDescription: "Assortment of 4 delicacies from the pastry chef.",
    price: 9500, category: "cat_desserts", badges: [],
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Crème Brûlée", enTitle: "Crème Brûlée",
    description: "À la vanille de Madagascar, cassonade caramélisée.",
    enDescription: "With Madagascar vanilla, caramelized brown sugar.",
    price: 9000, category: "cat_desserts", badges: ["badge_gluten"],
    imageUrl: "https://images.unsplash.com/photo-1470124113093-4e68e0797371?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Assiette de Fromages", enTitle: "Cheese Plate",
    description: "Sélection de nos régions, confiture de cerises noires.",
    enDescription: "Regional selection, black cherry jam.",
    price: 14000, category: "cat_desserts", badges: [],
    imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=800&auto=format&fit=crop"
  },

  // --- CAVE (8) ---
  {
    title: "Château Margaux 2015", enTitle: "Chateau Margaux 2015",
    description: "Premier Grand Cru Classé. Notes de cassis, truffe et violette.",
    enDescription: "First Growth Classé. Notes of blackcurrant, truffle and violet.",
    price: 450000, category: "cat_vins", badges: ["badge_rouge", "badge_chef"], isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Chablis Grand Cru", enTitle: "Chablis Grand Cru",
    description: "Minéral, tendu, une élégance rare pour accompagner les fruits de mer.",
    enDescription: "Mineral, sharp, a rare elegance to accompany seafood.",
    price: 85000, category: "cat_vins", badges: ["badge_blanc"],
    imageUrl: "https://images.unsplash.com/photo-1584916201218-7a7a7a7a7a7a?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Côte Rôtie - Guigal", enTitle: "Côte Rôtie - Guigal",
    description: "Vallée du Rhône. Syrah puissante et épicée.",
    enDescription: "Rhone Valley. Powerful and spicy Syrah.",
    price: 95000, category: "cat_vins", badges: ["badge_rouge"],
    imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Meursault 1er Cru", enTitle: "Meursault 1er Cru",
    description: "Bourgogne blanc. Gras, beurré, noisette grillée.",
    enDescription: "White Burgundy. Full-bodied, buttery, roasted hazelnut.",
    price: 120000, category: "cat_vins", badges: ["badge_blanc"],
    imageUrl: "https://images.unsplash.com/photo-1566417713940-0a0a0a0a0a0a?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Champagne Ruinart", enTitle: "Ruinart Champagne",
    description: "Blanc de Blancs. Finesse et fraîcheur aromatique.",
    enDescription: "Blanc de Blancs. Finesse and aromatic freshness.",
    price: 110000, category: "cat_vins", badges: ["badge_bulle"],
    imageUrl: "https://images.unsplash.com/photo-1598155523122-38423bb4d6c1?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Sancerre Rosé", enTitle: "Sancerre Rosé",
    description: "Pinot Noir. Léger, fruité, parfait pour l'apéritif.",
    enDescription: "Pinot Noir. Light, fruity, perfect for aperitif.",
    price: 45000, category: "cat_vins", badges: [],
    imageUrl: "https://images.unsplash.com/photo-1572569998638-7a7a7a7a7a7a?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Saint-Emilion Grand Cru", enTitle: "Saint-Emilion Grand Cru",
    description: "Bordeaux. Merlot dominant, souple et rond.",
    enDescription: "Bordeaux. Dominant Merlot, supple and round.",
    price: 65000, category: "cat_vins", badges: ["badge_rouge"],
    imageUrl: "https://images.unsplash.com/photo-1553361371-9bb220269711?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Pouilly-Fumé", enTitle: "Pouilly-Fumé",
    description: "Sauvignon blanc. Notes de pierre à fusil.",
    enDescription: "Sauvignon blanc. Flinty notes.",
    price: 48000, category: "cat_vins", badges: ["badge_blanc"],
    imageUrl: "https://images.unsplash.com/photo-1585553616435-7a7a7a7a7a7a?q=80&w=800&auto=format&fit=crop"
  },

  // --- BAR (6) ---
  {
    title: "Signature Gold Cocktail", enTitle: "Signature Gold Cocktail",
    description: "Gin, liqueur de sureau, concombre, menthe et poudre d'or.",
    enDescription: "Gin, elderflower liqueur, cucumber, mint and gold dust.",
    price: 18000, category: "cat_bar", badges: ["badge_cocktail", "badge_chef"], isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Smoked Old Fashioned", enTitle: "Smoked Old Fashioned",
    description: "Bourbon, Angostura Bitters, sucre de canne, fumé au bois de hêtre.",
    enDescription: "Bourbon, Angostura Bitters, cane sugar, beechwood smoked.",
    price: 16000, category: "cat_bar", badges: ["badge_cocktail"],
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Espresso Martini", enTitle: "Espresso Martini",
    description: "Vodka, Liqueur de café, Espresso frais, grains de café.",
    enDescription: "Vodka, coffee liqueur, fresh espresso, coffee beans.",
    price: 15000, category: "cat_bar", badges: ["badge_cocktail"],
    imageUrl: "https://images.unsplash.com/photo-1629247656209-4089c8a03225?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Mojito Royal", enTitle: "Royal Mojito",
    description: "Le classique revisité au Champagne brut.",
    enDescription: "The classic revisited with Brut Champagne.",
    price: 17000, category: "cat_bar", badges: ["badge_cocktail", "badge_bulle"],
    imageUrl: "https://images.unsplash.com/photo-1513558161293-4a4a4a4a4a4a?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Virgin Colada", enTitle: "Virgin Colada",
    description: "Ananas frais, crème de coco, citron vert. Sans alcool.",
    enDescription: "Fresh pineapple, coconut cream, lime. Non-alcoholic.",
    price: 12000, category: "cat_bar", badges: [],
    imageUrl: "https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Whisky Japonais Nikka", enTitle: "Nikka Japanese Whisky",
    description: "From the Barrel. Servi sec ou sur glace.",
    enDescription: "From the Barrel. Served neat or on the rocks.",
    price: 19000, category: "cat_bar", badges: [],
    imageUrl: "https://images.unsplash.com/photo-1527281400683-1aed5705f577?q=80&w=800&auto=format&fit=crop"
  }
]

async function uploadImage(url: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status} pour ${url}`)
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const asset = await client.assets.upload('image', buffer, {
      filename: url.split('/').pop()?.split('?')[0] || 'image.jpg',
      contentType: contentType
    })
    return asset._id
  } catch (err) {
    console.error(`Erreur upload image ${url}:`, err)
    return null
  }
}

async function main() {
  console.log('🚀 Démarrage de l\'importation COMPLETE (42 articles)...')
  await client.delete({query: '*[_type in ["category", "badge", "dish"]]'})

  for (const cat of CATEGORIES) {
    await client.createOrReplace({ _type: 'category', ...cat })
  }

  for (const badge of BADGES) {
    await client.createOrReplace({ _type: 'badge', ...badge })
  }

  for (const dish of DISHES) {
    console.log(`   > Traitement de : ${dish.title}`)
    const imageAssetId = await uploadImage(dish.imageUrl)

    const doc: any = {
      _type: 'dish',
      title: dish.title,
      description: dish.description,
      price: dish.price,
      rating: getRandomRating(),
      category: { _type: 'reference', _ref: dish.category },
      isFeatured: dish.isFeatured || false,
      en: {
        title: dish.enTitle,
        description: dish.enDescription
      }
    }

    if (imageAssetId) {
      doc.image = { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId } }
    }

    if (dish.badges) {
      doc.dietaryBadges = dish.badges
        .filter(b => BADGES.find(bg => bg._id === b && bg.category === 'DIET'))
        .map(ref => ({ _type: 'reference', _ref: ref, _key: ref }))
      doc.ingredientBadges = dish.badges
        .filter(b => BADGES.find(bg => bg._id === b && bg.category === 'INGREDIENT'))
        .map(ref => ({ _type: 'reference', _ref: ref, _key: ref }))
      doc.dessertBadges = dish.badges
        .filter(b => BADGES.find(bg => bg._id === b && bg.category === 'DESSERT'))
        .map(ref => ({ _type: 'reference', _ref: ref, _key: ref }))
      doc.drinkBadges = dish.badges
        .filter(b => BADGES.find(bg => bg._id === b && bg.category === 'DRINK'))
        .map(ref => ({ _type: 'reference', _ref: ref, _key: ref }))
    }

    await client.create(doc)
  }
  console.log('✅ Terminé ! Le restaurant est maintenant complet, bilingue et noté.')
}

main().catch(err => {
  console.error('Erreur fatale:', err)
  process.exit(1)
})
