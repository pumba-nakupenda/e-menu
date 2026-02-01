import { type SchemaTypeDefinition } from 'sanity'
import dish from './dish'
import category from './category'
import badge from './badge'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [dish, category, badge],
}