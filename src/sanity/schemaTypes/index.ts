import { type SchemaTypeDefinition } from 'sanity'
import dish from './dish'
import category from './category'
import badge from './badge'
import notification from './notification'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [dish, category, badge, notification],
}
