import { StructureBuilder } from 'sanity/desk'
import { UtensilsCrossed, Tag, Settings, Wine, ChefHat, LayoutGrid, BellRing } from 'lucide-react'
import { Iframe } from 'sanity-plugin-iframe-pane'
import type { DefaultDocumentNodeResolver } from 'sanity/desk'

// --- CONFIGURATION DE LA PRÉVISUALISATION ---
export const getDefaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  if (schemaType === 'dish') {
    return S.document().views([
      S.view.form(), // Vue 1 : Le formulaire d'édition
      S.view
        .component(Iframe)
        .options({
          // URL de votre site (en dev ou prod)
          url: 'http://localhost:3000', // À changer par votre URL Vercel en prod
          reload: {
            button: true, // Bouton pour recharger manuellement
          },
          attributes: {
            allow: 'fullscreen', // Permet le plein écran
          }
        })
        .title('Aperçu Live') // Titre de l'onglet
    ])
  }
  return S.document().views([S.view.form()])
}
// ---------------------------------------------

export const myStructure = (S: StructureBuilder) =>
  S.list()
    .title('E-MENU Admin')
    .items([
      // 1. Section SERVICE (Pour les serveurs)
      S.listItem()
        .title('Service en Salle')
        .icon(BellRing)
        .child(
          S.documentList()
            .title('Appels Serveur')
            .filter('_type == "notification" && status != "done"')
        ),

      S.divider(),

      // 2. Section CARTE DU RESTAURANT (Dynamique)
      S.listItem()
        .title('La Carte')
        .icon(UtensilsCrossed)
        .child(
          S.list()
            .title('Organisation de la Carte')
            .items([
              // LISTE DYNAMIQUE DES CATÉGORIES
              S.listItem()
                .title('Articles par Catégorie')
                .icon(LayoutGrid)
                .child(
                  S.documentTypeList('category')
                    .title('Choisir une catégorie')
                    .child(categoryId =>
                      S.documentList()
                        .title('Plats dans cette catégorie')
                        .filter('_type == "dish" && references($categoryId)')
                        .params({ categoryId })
                    )
                ),
              
              S.divider(),

              // ACCÈS DIRECT À TOUS LES PLATS
              S.listItem()
                .title('Tous les articles (Liste à plat)')
                .icon(ChefHat)
                .child(S.documentTypeList('dish').title('Tous les articles')),

              S.divider(),

              // GESTION DES CATÉGORIES (Déplacé ici pour plus de logique)
              S.listItem()
                .title('Modifier les Catégories')
                .icon(Settings)
                .child(S.documentTypeList('category').title('Liste des Catégories')),
            ])
        ),
      
      S.divider(),

      // 3. Section BADGES & INDICATEURS
      S.listItem()
        .title('Indicateurs (Badges)')
        .icon(Tag)
        .child(
            S.list()
            .title('Par Type')
            .items([
                S.listItem()
                    .title('🌱 Régimes & Préférences')
                    .child(
                        S.documentList()
                        .title('Régimes')
                        .filter('_type == "badge" && category == "DIET"')
                    ),
                S.listItem()
                    .title('🥩 Ingrédients')
                    .child(
                        S.documentList()
                        .title('Ingrédients')
                        .filter('_type == "badge" && category == "INGREDIENT"')
                    ),
                S.listItem()
                    .title('🍷 Boissons')
                    .child(
                        S.documentList()
                        .title('Boissons')
                        .filter('_type == "badge" && category == "DRINK"')
                    ),
                S.divider(),
                S.listItem()
                    .title('Tous les badges')
                    .child(S.documentTypeList('badge').title('Tous les badges')),
            ])
        ),

      S.divider(),

      // 4. MAINTENANCE
      // L'outil Vision est déjà accessible via les onglets du haut par défaut
    ])