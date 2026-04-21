# Rapport SEO — NOVO. (audit & optimisations)

**Date :** 2026-04-17  
**Domaine canonique retenu :** `https://novodesign.ch`  
**Contrainte respectée :** aucune modification CSS, couleurs, classes, layout, typographie, animations ou composants visuels.

---

## 1. Audit initial

### Pages et fichiers concernés

| Fichier | Rôle |
|--------|------|
| `index.html` | Accueil |
| `services.html` | Offres & tarifs (+ FAQ visible) |
| `realisations.html` | Portfolio |
| `a-propos.html` | À propos |
| `contact.html` | Contact & formulaire |
| `design-test.html` | Page technique interne |
| `components/theme-switch-markup.html` | Fragment (non indexé comme page) |
| `sitemap.xml`, `robots.txt` | Racine du déploiement |
| `public/sitemap.xml`, `public/robots.txt` | Copie pour hébergeurs qui publient le dossier `public/` à la racine |

### Problèmes SEO identifiés (avant intervention)

- (Historique) Variante avec ou sans `www` à harmoniser avec le déploiement DNS.
- `meta robots` avec directives étendues ; la spec demandait `index, follow` explicite sur les pages publiques.
- Pas de **`meta geo.region` / `geo.placename`** pour le référencement local Vaud.
- Pas de **`twitter:image`** systématique sur toutes les pages.
- Pas de **`dns-prefetch`** complémentaire pour domaines tiers (Calendly, Picsum sur pages concernées).
- **`hreflang` `x-default`** absent sur les pages principales.
- Images portfolio / footer : `alt` vides ou décoratives sans `aria-hidden` sur les icônes dupliquant le lien.
- **`design-test.html`** : indexable par défaut (risque de contenu dupliqué / bruit).
- Pas de **`public/sitemap.xml`** et **`public/robots.txt`** dédiés alors que demandé.

### Structure des titres (h1)

- **Une seule balise `<h1>` par page** sur les pages marketing (`index`, `services`, `realisations`, `a-propos`, `contact`).  
- `design-test.html` contient aussi un `<h1>` (page `noindex`).

**Aucune modification de structure de titres** (pas de changement de niveaux h1–h6 pour préserver le rendu).

---

## 2. Modifications par fichier

### `index.html`

- Titres et descriptions revus avec mots-clés géolocalisés (Lausanne, Vaud, agence web, site vitrine, SEO) dans les limites de longueur.
- `meta name="robots" content="index, follow"`.
- `meta geo.region` = `CH-VD`, `geo.placename` = `Vaud, Suisse`.
- `link rel="alternate" hreflang="x-default"`.
- Toutes les URLs absolues en **`https://novodesign.ch`** (canonical, OG, Twitter, JSON-LD).
- `twitter:image` ajouté.
- JSON-LD : `WebSite` (description alignée brief), `Organization` (zones Vaud + Suisse romande), **`LocalBusiness`** (adresse régionale CH-VD, `priceRange` CHF), `ProfessionalService` (+ SEO dans `serviceType`), `potentialAction.target` → `/contact`.
- `dns-prefetch` : Fontshare, CDNJS, Calendly, Picsum.
- Images portfolio : `alt` descriptifs ; **`fetchpriority="high"`** sur la première image du bloc portfolio (candidat LCP).
- Icônes footer : `aria-hidden="true"` sur les `<img>` décoratifs (le lien conserve `aria-label`).

### `contact.html`

- Meta title / description / OG / Twitter alignés Lausanne, Vaud, SEO, devis.
- `robots`, `geo`, `x-default`, `twitter:image`, `dns-prefetch`.
- JSON-LD : ajout **`LocalBusiness`** (priceRange CHF, adresse Vaud, `knowsLanguage` / `availableLanguage`), conservation `ContactPage`, `BreadcrumbList`, `WebSite`, `Organization`.

### `services.html`

- Meta et réseaux sociaux alignés mots-clés (création site internet Lausanne, Vaud, SEO).
- `robots`, `geo`, `x-default`, `twitter:image`, `dns-prefetch`.
- JSON-LD : ajout type **`Service`** (offres CHF dès 890, `serviceType` incluant SEO Lausanne), conservation `FAQPage`, `WebPage`, `BreadcrumbList`.
- Footer : `aria-hidden` sur icônes mail / Instagram.

### `realisations.html`

- Meta portfolio / web design Lausanne & Vaud.
- `robots`, `geo`, `x-default`, `twitter:image`, `dns-prefetch` (+ Picsum).
- Images portfolio : `alt` descriptifs par projet ; **`fetchpriority="high"`** sur la première image.
- Footer : `aria-hidden` sur icônes.

### `a-propos.html`

- Meta agence web Lausanne & Vaud, équipe, méthode.
- `robots`, `geo`, `x-default`, `twitter:image`, `dns-prefetch`.
- Footer : `aria-hidden` sur icônes.

### `design-test.html`

- `lang="fr-CH"` (alignement avec le reste du site).
- `meta name="robots" content="noindex, nofollow"`.
- `link rel="canonical"` vers la page d’accueil `https://novodesign.ch/`.

### `sitemap.xml` (racine)

- Déjà à jour avec **`www`** et URLs propres (`/services`, `/contact`, etc.).

### `robots.txt` (racine)

- `Sitemap: https://novodesign.ch/sitemap.xml`.
- **`Disallow: /design-test.html`** et **`Disallow: /components/`** (fragments techniques).

### `public/sitemap.xml` et `public/robots.txt`

- Duplicatas des fichiers racine pour les workflows qui servent le contenu de **`public/`** à la racine du site.

---

## 3. Éléments non modifiés (intervention manuelle ou hors périmètre)

| Sujet | Raison |
|-------|--------|
| **Maillage interne dans les paragraphes** | Insérer des liens `<a>` dans le corps de texte modifierait l’apparence (soulignement / couleur des liens définie en CSS) — **interdit par la contrainte « aucun impact visuel »**. |
| **Texte visible des boutons / liens** | Consigne : ne pas modifier sans confirmation. |
| **NAP complet** | Aucun **téléphone** ni **adresse postale précise** dans le HTML actuel — seul `info@novodesign.ch` est exploitable. Les schémas `LocalBusiness` utilisent **région Vaud / CH** sans rue (cohérent avec les données disponibles). Pour le SEO local avancé : ajouter une adresse et un `+41` quand vous les publiez. |
| **`/admin`, `/merci`, `/404`** | Ces chemins **n’existent pas** dans ce dépôt statique — rien à `Disallow` de plus ; à ajouter dans `robots.txt` si vous créez ces routes plus tard. |
| **`font-display`** | Les feuilles Fontshare sont chargées avec **`&display=swap`** dans l’URL — pas d’action dans les fichiers CSS (non modifiés). |
| **Image Open Graph dédiée 1200×630** | Toujours **`favicon.svg`** — pour de meilleurs aperçus sociaux, ajouter un fichier image (JPG/PNG) et mettre à jour uniquement les **`meta og:image` / `twitter:image`** (sans toucher au design de la page). |

---

## 4. Recommandations supplémentaires

1. **Search Console** : propriété sur `https://novodesign.ch`, envoi du sitemap, vérification du domaine avec **redirection 301** cohérente (apex ↔ sous-domaine si besoin).
2. **Cohérence des liens internes** : quand vous accepterez d’éventuels styles de liens dans les paragraphes, ajouter des ancres contextuelles vers `services.html`, `contact.html`, `realisations.html`.
3. **Données structurées** : après ajout d’un numéro de téléphone réel, compléter `LocalBusiness` avec `telephone` et `streetAddress` si applicable.
4. **`design-test.html`** : ne pas lier depuis le site en production ; la page est `noindex` + `Disallow`.

---

## 5. Pages modifiées (récapitulatif)

- `index.html`
- `contact.html`
- `services.html`
- `realisations.html`
- `a-propos.html`
- `design-test.html`
- `robots.txt`
- `public/robots.txt` (nouveau)
- `public/sitemap.xml` (nouveau)
- `SEO-REPORT.md` (ce fichier)

Les fichiers `sitemap.xml` à la racine ont été conservés alignés sur **`www`** (déjà le cas avant cette passe finale sur `robots` / `public`).
