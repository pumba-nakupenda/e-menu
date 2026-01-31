export default {
    name: 'notification',
    title: 'Appels Serveur',
    type: 'document',
    fields: [
        {
            name: 'tableNumber',
            title: 'Numéro de Table',
            type: 'string',
            readOnly: true,
        },
        {
            name: 'status',
            title: 'Statut',
            type: 'string',
            options: {
                list: [
                    { title: 'En attente 🔴', value: 'pending' },
                    { title: 'En cours 🟡', value: 'processing' },
                    { title: 'Terminé ✅', value: 'done' },
                ],
                layout: 'radio'
            },
            initialValue: 'pending'
        },
        {
            name: 'type',
            title: 'Type d\'appel',
            type: 'string',
            options: {
                list: [
                    { title: 'Appel Serveur', value: 'waiter' },
                    { title: 'Demande Addition', value: 'bill' }
                ]
            }
        }
    ],
    preview: {
        select: {
            title: 'tableNumber',
            subtitle: 'status',
        },
        prepare({ title, subtitle }: any) {
            return {
                title: `Table ${title}`,
                subtitle: subtitle === 'pending' ? '🔴 Besoins d\'aide' : '✅ Pris en charge'
            }
        }
    }
}

