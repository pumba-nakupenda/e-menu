import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schema } from './src/sanity/schemaTypes'
import { projectId, dataset } from './src/sanity/env'
import { myStructure, getDefaultDocumentNode } from './src/sanity/deskStructure'

export default defineConfig({
    basePath: '/admin',
    projectId,
    dataset,
    plugins: [
        deskTool({
            structure: myStructure,
            defaultDocumentNode: getDefaultDocumentNode,
        }),
        visionTool()
    ],
    schema: schema,
})
