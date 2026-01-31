export default {
    name: 'dish',
    title: 'Plats',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Titre (FR)',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'description',
            title: 'Description (FR)',
            type: 'text',
            rows: 3,
        },
        {
            name: 'price',
            title: 'Prix (en F)',
            type: 'number',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'image',
            title: 'Image du plat',
            type: 'image',
            options: { hotspot: true },
        },
        {
            name: 'category',
            title: 'Catégorie',
            type: 'reference',
            to: [{ type: 'category' }],
        },
        // === GESTION DES BADGES SÉPARÉE PAR CATÉGORIE ===
        {
            name: 'dietaryBadges',
            title: 'Préférences Alimentaires',
            description: 'Vegan, Sans Gluten, Épicé...',
            type: 'array',
            of: [{ 
                type: 'reference', 
                to: [{ type: 'badge' }],
                options: {
                    filter: 'category == "DIET"'
                }
            }],
        },
        {
            name: 'ingredientBadges',
            title: 'Ingrédients Principaux',
            description: 'Viande, Poisson, Crustacés...',
            type: 'array',
            of: [{ 
                type: 'reference', 
                to: [{ type: 'badge' }],
                options: {
                    filter: 'category == "INGREDIENT"'
                }
            }],
            hidden: ({ document }: any) => {
                // Optionnel : masquer si on n'est pas sur un plat salé (nécessite de charger la catégorie parente, complexe en simple callback)
                return false 
            }
        },
        {
            name: 'dessertBadges',
            title: 'Type de Dessert',
            description: 'Chocolat, Fruits, Glace...',
            type: 'array',
            of: [{ 
                type: 'reference', 
                to: [{ type: 'badge' }],
                options: {
                    filter: 'category == "DESSERT"'
                }
            }],
        },
        {
            name: 'drinkBadges',
            title: 'Type de Boisson',
            description: 'Vin Rouge, Blanc, Cocktail...',
            type: 'array',
            of: [{ 
                type: 'reference', 
                to: [{ type: 'badge' }],
                options: {
                    filter: 'category == "DRINK"'
                }
            }],
        },
        // ===============================================
        {
            name: 'isFeatured',
            title: 'Coup de cœur du Chef',
            type: 'boolean',
            initialValue: false,
        },
        {
            name: 'isSoldOut',
            title: 'Épuisé (Sold Out)',
            type: 'boolean',
            initialValue: false,
        },
        {
            name: 'rating',
            title: 'Note (0-5)',
            type: 'number',
            description: 'Note moyenne des clients (ex: 4.8)',
            validation: (Rule: any) => Rule.min(0).max(5).precision(1),
        },
        {
            name: 'en',
            title: 'Traductions Anglaises',
            type: 'object',
            fields: [
                { name: 'title', title: 'Titre (EN)', type: 'string' },
                { name: 'description', title: 'Description (EN)', type: 'text', rows: 3 },
                { name: 'story', title: 'L\'Histoire du Plat (EN)', type: 'text' },
            ],
        },
        {
            name: 'storyFr',
            title: 'L\'Histoire du Plat (FR)',
            type: 'text',
        },
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'price',
            media: 'image',
        },
    },
}
