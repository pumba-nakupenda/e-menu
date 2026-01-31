import { createClient } from 'next-sanity'
import { projectId, dataset } from './env'

// Note: Ce script nécessite un Token avec les droits d'écriture
// Pour cet exercice, je vais générer le fichier JSON d'import ou simuler la structure
// Mais le plus simple est de vous donner un fichier que vous pouvez exécuter.

const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  token: 'VOTRE_TOKEN_ICI', // Il faudra un token Sanity Write
  apiVersion: '2023-05-03',
})

const seedData = async () => {
  console.log('Début du remplissage...')
  // ... logique de création
}
