# EAI Digital — Portfolio freelance C# / .NET

Site vitrine d’Eric ELEMBA ADI, développeur Backend freelance spécialisé en C#, .NET, API REST et intégration de solutions logicielles.

Le projet est un site statique responsive en HTML, CSS et JavaScript natif. Il ne nécessite ni framework frontend, ni gestionnaire de paquets, ni étape de compilation.

## Fonctionnalités

- présentation des services, de la stack technique et des réalisations ;
- navigation contextuelle indiquant la section actuellement consultée ;
- globe holographique interactif en Three.js avec fallback CSS ;
- carrousel de technologies contrôlable au clavier ;
- animation progressive de la section Contact et localisation de Strasbourg ;
- ambiance sonore générée avec la Web Audio API, activée uniquement par l’utilisateur ;
- centre de préférences pour les cookies optionnels ;
- adaptation aux écrans mobiles et à `prefers-reduced-motion`.

## Lancer le projet localement

Depuis la racine du projet :

```bash
python3 -m http.server 8000
```

Ouvrir ensuite [http://localhost:8000](http://localhost:8000) dans un navigateur récent.

Il est déconseillé d’ouvrir directement `index.html` avec le protocole `file://` : les modules JavaScript et certaines ressources externes peuvent alors être bloqués par le navigateur.

## Structure

```text
EAID/
├── assets/
│   └── masthead.jpg
├── css/
│   └── styles.css
├── js/
│   ├── ambient.js
│   ├── contact-animation.js
│   ├── cookies.js
│   ├── globe3d.js
│   ├── nav-context.js
│   └── tech-carousel.js
├── index.html
└── README.md
```

### Rôle des scripts

| Fichier | Responsabilité |
| --- | --- |
| `ambient.js` | Génération, lecture et réglage de l’ambiance sonore |
| `contact-animation.js` | Déclenchement de l’animation Contact lorsqu’elle entre dans la fenêtre |
| `cookies.js` | Consentement, activation et révocation des scripts optionnels |
| `globe3d.js` | Scène Three.js, interactions et libellés projetés autour du globe |
| `nav-context.js` | Mise à jour de la page courante dans les menus desktop et mobile |
| `tech-carousel.js` | Duplication contrôlée, animation et mise en pause du carrousel |

## Dépendances externes

Les dépendances sont chargées directement depuis des CDN :

- Three.js `0.180.0` et OrbitControls via jsDelivr ;
- Devicon `v2.17.0` pour les icônes de technologies ;
- Inter et Space Grotesk via Google Fonts.

Une connexion Internet est nécessaire pour charger ces ressources. Si Three.js, le CDN ou WebGL est indisponible, un globe CSS statique reste affiché.

Les versions des ressources JavaScript et des icônes sont verrouillées afin d’éviter une mise à jour implicite. Lors d’une montée de version, vérifier le globe, ses contrôles et les chemins des icônes.

## Accessibilité

Le site comprend notamment :

- un lien d’évitement vers le contenu principal ;
- une navigation sémantique avec `aria-current="location"` ;
- des commandes accessibles au clavier pour le son et le carrousel ;
- des états ARIA synchronisés avec les commandes interactives ;
- un contenu de remplacement lorsque le globe WebGL ne peut pas être initialisé ;
- une réduction ou une désactivation des animations lorsque l’utilisateur demande moins de mouvements.

Après une modification d’interface, vérifier au minimum la navigation au clavier, le focus visible, les menus mobile et desktop ainsi que le rendu avec la réduction des mouvements activée.

## Gestion des cookies

Le consentement est conservé pendant six mois dans le cookie nécessaire `eai_cookie_consent`, avec `SameSite=Lax`. L’attribut `Secure` est ajouté lorsque le site est servi en HTTPS.

Le lien **Gérer mes cookies** du pied de page permet à l’utilisateur de modifier son choix à tout moment.

Pour différer un script optionnel jusqu’au consentement, utiliser `type="text/plain"` et déclarer sa catégorie :

```html
<script
  type="text/plain"
  data-cookie-category="analytics"
  src="chemin/analytics.js"
></script>
```

Les catégories prises en charge sont :

- `analytics` pour la mesure d’audience ;
- `preferences` pour la personnalisation facultative.

Après chaque choix, le navigateur émet l’événement `cookieconsentchange`. `event.detail.revokedCategories` contient les catégories venant d’être révoquées.

Lors d’une révocation, les scripts injectés par le gestionnaire sont supprimés, puis la page est rechargée après sauvegarde du nouveau consentement. Ce rechargement arrête également les écouteurs, minuteries et traitements qui auraient déjà été initialisés par ces scripts.

## Vérifications avant publication

Le projet ne possède pas encore de suite de tests automatisés. Effectuer les contrôles suivants avant la mise en ligne :

1. lancer le site depuis un serveur HTTP local ;
2. vérifier l’absence d’erreurs dans la console du navigateur ;
3. tester les formats desktop, tablette et mobile ;
4. parcourir toutes les sections au clavier ;
5. mettre en pause puis relancer le carrousel ;
6. tester le globe à la souris et au toucher, puis son fallback sans WebGL ;
7. accepter, refuser et révoquer chaque catégorie de cookies ;
8. activer `prefers-reduced-motion` et contrôler que le contenu reste visible ;
9. vérifier les liens LinkedIn, Malt et OpenStreetMap.

Une vérification syntaxique rapide des scripts peut être lancée avec :

```bash
for file in js/*.js; do node --check "$file" || exit 1; done
```

## Déploiement

Le contenu peut être publié sur tout hébergement de fichiers statiques. Déployer `index.html` avec les dossiers `assets/`, `css/` et `js/` en conservant leur arborescence relative.

Servir le site en HTTPS est recommandé, notamment pour sécuriser le cookie de consentement et éviter le blocage de contenu par les navigateurs.