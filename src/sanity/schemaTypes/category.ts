export default {
    name: 'category',
    title: 'Catégories',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Nom (FR)',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'titleEn',
            title: 'Nom (EN)',
            type: 'string',
        },
        {
            name: 'order',
            title: 'Ordre d\'affichage',
            type: 'number',
        }
    ],
}
