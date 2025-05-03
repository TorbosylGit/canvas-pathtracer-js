er-js

Moteur de path-tracing minimal en JavaScript (sans WebGL), rendu via `<canvas>`.

## Étape 1 : Gradient de test

* **Structure du projet**

  * `index.html` : page HTML avec `<canvas>`
  * `src/style.css` : centrage du canvas via Flexbox
  * `src/main.js` : script initial générant le gradient
* **Implémentation du gradient**

  1. Création d’un `ImageData` de taille 200×100
  2. Double boucle (`j` pour lignes, `i` pour colonnes)
  3. Calcul des composantes :

     * `r = i/nx`
     * `g = (ny-1-j)/ny`
     * `b = 0.2`
  4. Conversion en entier : `Math.floor(255.99 * composante)`
  5. Stockage des canaux RGBA dans `imageData.data`
  6. Rendu final avec `ctx.putImageData`

## Étape 2 : Refactorisation avec Vec3

* **Classe `Vec3` (`src/vec3.js`)**

  * Constructeur et accès auxiliaires (`x()`, `r()`, etc.)
  * Opérations vecteur/vecteur : `add`, `subtract`, `multiply`, `divide`
  * Opérations vecteur/scalaire : `multiplyScalar`, `divideScalar`
  * Fonctions géométriques : `dot`, `cross`, `length`, `normalize`
  * Export ES6 pour réutilisation
* **Mise à jour de `src/main.js`**

  1. Import `Vec3` via module ES6 (`type="module"`)
  2. Génération de la couleur : `new Vec3(r, g, b)`
  3. Extractions des canaux avec `col.r()`, `col.g()`, `col.b()`
  4. Stockage RGBA et rendu final inchangé
  5. Ajout de commentaires courts (4–5 mots) pour chaque étape
* **Organisation**

  * Fichiers séparés : HTML, CSS, JS, classe Vec3
  * Chargement par modules pour clarté

## Étape 3 : Rayons, caméra et arrière-plan

* **Classe `Ray` (`src/ray.js`)**  
  - Propriétés : `A` origine, `B` direction  
  - Méthode `pointAtParameter(t)` pour p(t)=A+tB  
* **Fonction `color(r)`**  
  1. Normalisation de la direction  
  2. t = 0.5 * (y+1) pour gradient vertical  
  3. lerp entre blanc et bleu clair  
* **Caméra simple**  
  - `origin` = (0,0,0)  
  - `lowerLeftCorner` = (−2,−1,−1)  
  - `horizontal` = (4,0,0), `vertical` = (0,2,0)  
* **Boucle de rendu**  
  1. u = i/nx, v = j/ny  
  2. rayon r = Ray(origin, lowerLeft + u·horizontal + v·vertical)  
  3. couleur = color(r)  
  4. conversion en RGBA et stockage  
  5. affichage via putImageData  





## Installation

git clone https://github.com/TorbosylGit/canvas-pathtracer-js
cd canvas-pathtracer-js

//---
