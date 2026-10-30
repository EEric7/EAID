# EAI Digital — Portfolio freelance C# / .NET

Site vitrine d’Eric ELEMBA ADI, développeur Backend freelance spécialisé en C#, .NET, API REST et intégration de solutions logicielles.

Le site est développé en HTML, CSS et JavaScript natif. Il ne nécessite ni framework frontend ni compilation pour fonctionner. Node.js est utilisé uniquement pour les tests automatisés.

## Fonctionnalités

- présentation des services, de la stack technique et des réalisations ;
- navigation desktop et mobile avec indication de la section active ;
- globe interactif Three.js avec fallback CSS ;
- carrousel de technologies contrôlable au clavier ;
- animation progressive de la section Contact ;
- ambiance sonore générée avec la Web Audio API et désactivée par défaut ;
- gestion du consentement aux cookies optionnels ;
- adaptation mobile et prise en charge de `prefers-reduced-motion`.

## Prérequis

- Python 3 pour servir rapidement le site en local ;
- Node.js 24 et npm pour exécuter les tests ;
- Docker, facultatif, pour tester l’image Nginx.

## Lancer le site localement

Depuis la racine du dépôt :

```bash
python3 -m http.server 8000 --directory source
```

Ouvrir ensuite [http://localhost:8000](http://localhost:8000).

Il est déconseillé d’ouvrir directement `source/index.html` avec le protocole `file://` : les modules JavaScript et certaines ressources externes peuvent alors être bloqués.

## Structure

```text
EAID/
├── .github/workflows/
│   ├── ci.yml
│   └── cd.yml
├── source/
│   ├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── ambient.js
│   │   ├── contact-animation.js
│   │   ├── cookies.js
│   │   ├── globe3d.js
│   │   ├── nav-context.js
│   │   └── tech-carousel.js
│   ├── _headers
│   ├── Dockerfile
│   ├── index.html
│   └── nginx.conf
├── tests/
│   ├── cookies.spec.js
│   ├── navigation-and-ui.spec.js
│   └── responsive-accessibility.spec.js
├── package.json
├── package-lock.json
└── playwright.config.js
```

### Rôle des scripts

| Fichier | Responsabilité |
| --- | --- |
| `ambient.js` | Génération, lecture et réglage de l’ambiance sonore |
| `contact-animation.js` | Animation de la section Contact lorsqu’elle devient visible |
| `cookies.js` | Consentement, activation et révocation des scripts optionnels |
| `globe3d.js` | Scène Three.js, interactions, redimensionnement et libération des ressources |
| `nav-context.js` | Navigation mobile et mise à jour de la section active |
| `tech-carousel.js` | Défilement continu et mise en pause du carrousel |

## Tests automatisés

Installer les dépendances et les navigateurs :

```bash
npm ci
npx playwright install
```

Lancer toute la suite :

```bash
npm test
```

Lancer uniquement Chromium :

```bash
npm run test:chromium
```

Afficher le dernier rapport HTML :

```bash
npm run test:report
```

La suite Playwright couvre notamment la navigation, le menu mobile, le carrousel, le consentement aux cookies, les liens externes, le responsive, la réduction des animations, les fallbacks et l’accessibilité avec axe-core.

## Docker

Construire l’image depuis la racine du dépôt :

```bash
docker build -t eaid-site source
```

Lancer le conteneur :

```bash
docker run --rm -p 8080:8080 eaid-site
```

Le site est alors disponible sur [http://localhost:8080](http://localhost:8080). L’image utilise Nginx, s’exécute avec un utilisateur non-root et expose un contrôle de santé.

## Intégration continue

Le workflow `.github/workflows/ci.yml` réalise :

- la validation syntaxique des fichiers JavaScript ;
- la vérification des fichiers indispensables ;
- les tests Playwright Chromium desktop et mobile lors d’un push sur `main` ;
- les tests Chromium, Firefox et WebKit pour les pull requests, les lancements manuels et l’audit hebdomadaire ;
- un audit CodeQL avec les requêtes `security-extended` ;
- la conservation des traces et rapports Playwright en cas d’échec.

Les navigateurs Playwright sont mis en cache séparément par moteur et par version du fichier `package-lock.json`.

## Déploiement Cloudflare Pages

Le workflow `.github/workflows/cd.yml` publie les fichiers statiques sur Cloudflare Pages après une CI réussie déclenchée par un push sur `main`. Il peut également être lancé manuellement depuis GitHub Actions.

Créer un projet Cloudflare Pages en mode **Direct Upload**, puis configurer l’environnement GitHub `production` avec :

| Type | Nom | Description |
| --- | --- | --- |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Identifiant du compte Cloudflare |
| Secret | `CLOUDFLARE_API_TOKEN` | Jeton limité à `Account → Cloudflare Pages → Edit` |
| Variable | `CLOUDFLARE_PROJECT_NAME` | Nom du projet Cloudflare Pages |
| Variable facultative | `PRODUCTION_URL` | Adresse publique du site |

Le workflow ne publie que `index.html`, `_headers`, `assets/`, `css/` et `js/`. Si la configuration Cloudflare est absente, le déploiement est ignoré et la liste des valeurs manquantes est inscrite dans le résumé du workflow.

Le fichier `source/_headers` applique sur Cloudflare Pages la politique CSP, les en-têtes de sécurité et les règles de cache qui correspondent à la configuration Nginx locale.

## Dépendances externes

Le navigateur charge directement :

- Three.js `0.180.0` et ses modules complémentaires via jsDelivr ;
- Devicon `v2.17.0` via jsDelivr ;
- Inter et Space Grotesk via Google Fonts.

Une connexion Internet est nécessaire pour ces ressources. Si Three.js, WebGL ou le CDN est indisponible, un globe CSS statique reste affiché.

## Accessibilité

Le site comprend notamment :

- un lien d’évitement vers le contenu principal ;
- une navigation sémantique avec synchronisation de `aria-current` et `aria-expanded` ;
- des commandes clavier pour le son et le carrousel ;
- un focus visible et des libellés accessibles ;
- un contenu de remplacement lorsque le globe WebGL ne peut pas être initialisé ;
- une réduction ou une désactivation des animations selon `prefers-reduced-motion`.

Après une modification d’interface, exécuter les tests Playwright et contrôler manuellement le parcours clavier, le zoom à 200 % et les principaux formats d’écran.

## Gestion des cookies

Le consentement est conservé pendant six mois dans le cookie nécessaire `eai_cookie_consent`, avec `SameSite=Lax`. L’attribut `Secure` est ajouté lorsque le site est servi en HTTPS.

Pour différer un script optionnel jusqu’au consentement :

```html
<script
  type="text/plain"
  data-cookie-category="analytics"
  src="chemin/analytics.js"
></script>
```

Les catégories disponibles sont `analytics` et `preferences`. Après chaque choix, le navigateur émet l’événement `cookieconsentchange`. Lorsqu’une catégorie est révoquée, les scripts concernés sont retirés puis la page est rechargée.
