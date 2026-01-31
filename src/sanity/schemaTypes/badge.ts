export default {
    name: 'badge',
    title: 'Indicateurs (Badges)',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Titre (FR)',
            type: 'string',
            description: 'Ex: Vegan, Sans Gluten, Viande Rouge...',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'titleEn',
            title: 'Titre (EN)',
            type: 'string',
            description: 'Ex: Vegan, Gluten Free, Red Meat...',
        },
        {
            name: 'category',
            title: 'Catégorie du Badge',
            type: 'string',
            options: {
                list: [
                    { title: '🌱 Régimes & Préférences', value: 'DIET' },
                    { title: '🥩 Ingrédients & Protéines', value: 'INGREDIENT' },
                    { title: '🍰 Desserts', value: 'DESSERT' },
                    { title: '🍷 Boissons & Vins', value: 'DRINK' },
                ],
            },
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'iconType',
            title: 'Type d\'icône',
            type: 'string',
            options: {
                list: [
                    { title: 'Emoji (Standard)', value: 'emoji' },
                    { title: 'Icône Outline (Lucide)', value: 'lucide' },
                    { title: 'Image / SVG (Perso)', value: 'image' },
                ],
                layout: 'radio'
            },
            initialValue: 'emoji'
        },
        {
            name: 'emoji',
            title: 'Emoji',
            type: 'string',
            description: 'Ex: 🌱, 🥩',
            hidden: ({ parent }: any) => parent?.iconType !== 'emoji'
        },
        {
            name: 'lucideIcon',
            title: 'Nom de l\'icône Lucide',
            type: 'string',
            description: 'Tapez le nom d\'une icône Lucide (ex: Leaf, Flame, Wine, Coffee, Utensils). Voir lucide.dev',
            hidden: ({ parent }: any) => parent?.iconType !== 'lucide'
        },
        {
            name: 'isOutline',
            title: 'Style Contour (Outline)',
            type: 'boolean',
            description: 'Si activé, l\'émoji ou l\'icône n\'aura que le contour.',
            initialValue: false,
            hidden: ({ parent }: any) => parent?.iconType === 'image'
        },
        {
            name: 'icon',
            title: 'Image de l\'icône',
            type: 'image',
            options: { hotspot: true },
            hidden: ({ parent }: any) => parent?.iconType !== 'image'
        },
        {
            name: 'color',
            title: 'Couleur de l\'icône (Optionnel)',
            type: 'string',
            description: 'Code couleur ex: #FFD700 pour de l\'or',
        }
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'category',
            emoji: 'emoji',
            media: 'icon',
            iconType: 'iconType'
        },
        prepare(selection: any) {
            const { title, subtitle, emoji, media, iconType } = selection;
            return {
                title: title,
                subtitle: subtitle,
                // Affiche l\'emoji comme icône dans Sanity si c\'est le type choisi
                media: iconType === 'emoji' ? null : media,
                // Note: Sanity ne supporte pas directement l\'affichage d\'un emoji en media via prepare 
                // mais on peut tricher en le mettant dans le titre si besoin.
            }
        }
    },
}