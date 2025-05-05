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

## Étape 4 : Ajout d’une sphère

* **Intersection sphère**  
   - fonction `hitSphere(center, radius, ray)`  
   - résout a·t² + b·t + c = 0  
   - discriminant > 0 → intersection  

* **Mise à jour de `color(r)`**  
   - si `hitSphere(...)`, renvoyer rouge  
   - sinon gradient blanc→bleu (même code)  

* **Rendu final**  
   - boucle rayons par pixel  
   - test sphère avant gradient  
   - affichage via `putImageData`

## Étape 5 : Normales et plusieurs sphères

* **Hittable** (`src/hittable.js`)  
   - interface `hit(ray,tMin,tMax,rec)`

* **Sphere** (`src/sphere.js`)  
   - calcul racines quadratique  
   - remplir `rec.p`, `rec.normal`, `rec.t`

* **HittableList** (`src/hittableList.js`)  
   - tester tous objets  
   - garder intersection la plus proche

* **Color(r)** (`src/main.js`)  
   - si hit → ombrer par normale  
   - sinon → même dégradé de fond

* **Monde**  
   - sphère flottante (0,0,−1) rayon 0.5  
   - sol plan sphérique (0,−100.5,−1) rayon 100

## Étape 6 : Anticrénelage

* **randomDouble()**  
   - fonction → `Math.random()`

* **Camera** (`src/camera.js`)  
   - encapsule origine et axes  
   - `getRay(u,v)` renvoie `Ray`

* **Supersampling**  
   - `const ns = 100`  
   - lancer `ns` rayons par pixel  
   - `u=(i+rand)/nx`, `v=(j+rand)/ny`  
   - sommer `color(r)`, diviser par `ns`

* **Résultat**  
   - contours lissés  
   - moins d’aliasing

## Étape 7 : Matériaux diffus

* **randomInUnitSphere()**  
   - rejet dans sphère unité

* **color(r,world,depth)**  
   - rebond diffus récursif  
   - 50% d’énergie chaque rebond  
   - stop si `depth>=maxDepth`

* **gamma correction**  
   - appliquer `sqrt()` sur col

* **shadow acne fix**  
   - début tests `tMin = 0.001`

* **monde**  
   - sphère flottante et sol

## Étape 8 : Matériaux métalliques

* **Material** (`src/material.js`)  
   - interface `scatter(rayIn, rec)`

* **Lambertian** (`src/lambertian.js`)  
   - diffus lambertien via randomInUnitSphere  
   - attenuation = couleur intrinsèque

* **Metal** (`src/metal.js`)  
   - réflexion miroir (reflect)  
   - fuzzy metal via fuzz*sphère unité  
   - rejet rayons sous surface

* **Sphere** (`src/sphere.js`)  
   - stocke `material`  
   - rempli `rec.material`

* **Color** (`src/main.js`)  
   - appeler `material.scatter()`  
   - multiplier attenuation*coul récursive

* **Monde**  
   - sphères lambertian et metal variés

## Étape 9 : Diélectriques

* **utils**  
   - `refract()`, `schlick()`  

* **Dielectric** (`src/dielectric.js`)  
   - scatter réfraction ou réflexion  
   - aléa via `schlick()`  

* **monde**  
   - sphère verre creuse (rayons ±)  
   - deux Sphere avec Dielectric(1.5)

## Étape 10 : caméra positionnable

* **Camera** (`src/camera.js`)  
  - paramètres : lookfrom, lookat, vup  
  - champ de vision `vfov` en degrés  
  - aspect ratio `nx/ny`  
  - calcul base u,v,w et coin inférieur gauche

* **main.js**  
  - instancier `new Camera(...)`  
  - utilisez `cam.getRay(s,t)` comme avant

## Étape 11 : profondeur de champ (DOF)

* **randomInUnitDisk()** (`src/utils.js`)  
   - échantillon sur disque z=0

* **Camera** (`src/camera.js`)  
   - paramètres supplémentaires :  
     - `aperture` (ouverture)  
     - `focusDist` (plan net)  
   - origine des rayons décalée via disque

* **main.js**  
   - calculer `focusDist = |lookfrom - lookat|`
   - définir `aperture` (ex : 2.0)  
   - instancier caméra avec DOF  
   - utiliser `cam.getRay()` normalement

* **Résultat**  
   - objets hors du plan net floutés  
   - intensité du flou contrôlée par `aperture`

## Étape 12 : scène aléatoire

* **randomScene()** (`src/randomScene.js`)  
   - sol diffus large  
   - grille de petites sphères  
   - choix aléatoire de matériau  
   - évite zone trois sphères  

* **main.js**  
   - `import { randomScene }`  
   - `const world = randomScene()`

* **Résultat**  
   - des centaines d’objets  
   - variations de couleurs  
   - mélange diffuse / métal / verre

## Upscaling (mise à l’échelle)

   - Pour accélérer le rendu tout en gardant un grand affichage, on travaille en basse résolution interne puis on étire le `canvas`.

* **Upscaling** via CSS dans `src/style.css`

## Étape 13 : flou de mouvement

* **Ray** (`src/ray.js`)  
   - ajouter champ `time`

* **Camera** (`src/camera.js`)  
   - stocker `time0,time1`  
   - échantillonner temps aléatoire

* **MovingSphere** (`src/movingSphere.js`)  
   - centre(t) linéaire entre c0 → c1

* **Lambertian**  
   - scatter conserve `rayIn.time()`

* **main.js**  
   - instancier `Camera(..., time0, time1)`  
   - `cam.getRay()` génère rayons timés

* **Résultat**  
   - flou réaliste pour objets et cam

## Étape 14 : hiérarchie de volumes englobants (BVH)

* **AABB** (`src/aabb.js`)  
   - intersection rayon–AABB par méthode des slabs  
   - `hit(ray,tMin,tMax)` très rapide

* **Hittable** (`src/hittable.js`)  
   - nouvelle méthode `boundingBox(t0,t1)`

* **Sphere & MovingSphere**  
   - implémentent `boundingBox()`  
   - `MovingSphere` encadre positions à t0/t1

* **HittableList** (`src/hittableList.js`)  
   - combine récursivement toutes les `boundingBox`

* **BVHNode** (`src/bvhNode.js`)  
   - construction récursive en deux sous-listes  
   - `hit()` teste d’abord la box, puis enfants

* **main.js**  
   - remplacer `new HittableList(...)` par  
     `new BVHNode(objects, time0, time1)`  
   - accélération sous-linéaire des intersections

## Étape 15 : textures procédurales

* **Texture** (`src/texture.js`)  
   - interface `value(u,v,p)`

* **ConstantTexture** (`src/constantTexture.js`)  
   - couleur RGB constante

* **CheckerTexture** (`src/checkerTexture.js`)  
   - damier 3D via sin(x)·sin(y)·sin(z)

* **Lambertian** (`src/lambertian.js`)  
   - prend un `Texture` en paramètre  
   - `attenuation = albedo.value(0,0,p)`

* **scenes** (`src/scenes.js`)  
   - fonction `twoSpheres()`  
   - applique damier à deux sphères

* **main.js**  
   - remplacer `randomScene()` par `twoSpheres()`
   - extraire `sceneList.objects` avant BVH


## Installation

git clone https://github.com/TorbosylGit/canvas-pathtracer-js
cd canvas-pathtracer-js

//---
