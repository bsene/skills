---
name: monoids
description: Recognize and apply the monoid abstraction (binary associative operation + neutral element) in TypeScript and Clojure/ClojureScript code. Use whenever the user is combining, aggregating, merging, or reducing data — shopping carts, permissions/roles, metrics and counters, event logs, config objects, or any `reduce`/`fold`/`merge-with` over a collection — even if they don't use the word "monoid". Also use when reviewing code that special-cases empty lists/collections, when discussing Map-Reduce or parallel aggregation (including `pmap`-based reduction), or when designing a generic `combine`/`merge`/`empty` API instead of ad hoc merge logic. Trigger this for "how do I merge these two X" or "what's a clean way to aggregate Y" style questions in either language, not just explicit monoid/algebra questions.
---

# Monoïdes

Un monoïde est une structure minimaliste : un ensemble de valeurs + une opération binaire **associative** (`combine`) + un **élément neutre** (`empty`). Rien de plus. Reconnaître cette structure dans du code métier permet de remplacer une logique de fusion ad hoc — source fréquente de bugs sur les cas limites — par une API générique et testée une fois pour toutes.

Cette skill couvre TypeScript et Clojure/ClojureScript. Le concept est identique dans les deux langages ; seule l'idiomatique change (réification explicite d'une interface `Monoid<T>` en TS, vs fonctions variadiques déjà associatives en Clojure — `merge-with`, `into`, `+`).

Source de référence : [Les monoïdes : une abstraction omniprésente (evryg)](https://kb.evryg.com/fr/ingenierie-logicielle-avancee/fondations/les-monoides-une-abstraction-omnipresente)

## Quand appliquer cette skill

Le signal à repérer, ce n'est pas le mot "monoïde" — c'est un des patterns suivants dans la demande ou le code :

- Une fonction `merge(a, b)`, `combine(a, b)` ou `add(a, b)` codée à la main pour un type précis
- Un `reduce`/`fold` sur une liste avec une valeur initiale arbitraire
- Un `if (list.length === 0) throw / return null` avant un calcul d'agrégat
- L'envie de paralléliser un calcul d'agrégation (Map-Reduce, agrégation par partition Kafka, etc.)
- Une modélisation métier qui "s'additionne" naturellement : panier, permissions, compteurs, logs, config

Si un de ces patterns apparaît, propose activement la structure monoïdale plutôt que d'attendre que l'utilisateur la nomme.

---

## TypeScript

### L'interface de base

```typescript
interface Monoid<T> {
  empty: T;
  combine: (a: T, b: T) => T;
}
```

Deux lois doivent tenir — les rappeler quand tu proposes un monoïde custom, car ce sont elles qui justifient qu'on puisse paralléliser et court-circuiter les cas vides :

- **Associativité** : `combine(combine(a, b), c) === combine(a, combine(b, c))`
- **Neutralité** : `combine(a, empty) === a` et `combine(empty, a) === a`

Un `fold` générique marche pour n'importe quel monoïde :

```typescript
function fold<T>(monoid: Monoid<T>, items: T[]): T {
  return items.reduce(monoid.combine, monoid.empty);
}
```

### Monoïdes de base

```typescript
const numberSum: Monoid<number> = { empty: 0, combine: (a, b) => a + b };

const stringConcat: Monoid<string> = { empty: "", combine: (a, b) => a + b };

const arrayConcat = <T>(): Monoid<T[]> => ({
  empty: [],
  combine: (a, b) => [...a, ...b],
});

const boolAnd: Monoid<boolean> = { empty: true, combine: (a, b) => a && b };
const boolOr: Monoid<boolean> = { empty: false, combine: (a, b) => a || b };

// Fonctions A -> A avec la composition
const endoCompose = <A>(): Monoid<(a: A) => A> => ({
  empty: (a) => a,
  combine: (f, g) => (a) => g(f(a)),
});
```

### Associativité → parallélisation

L'associativité garantit que l'ordre de regroupement n'importe pas — d'où la parallélisation type Map-Reduce : découper, réduire chaque segment indépendamment, combiner les résultats partiels.

```typescript
function parallelFold<T>(monoid: Monoid<T>, items: T[], chunks = 4): T {
  const size = Math.ceil(items.length / chunks);
  const partials = Array.from({ length: chunks }, (_, i) =>
    fold(monoid, items.slice(i * size, (i + 1) * size))
  );
  return fold(monoid, partials);
}
```

Cas d'usage typique : agréger des métriques par partition Kafka, puis combiner les agrégats partiels — un `reduce` distribué est un fold monoïdal.

### Modélisation métier

Cas récurrents où repérer un monoïde évite de la logique ad hoc :

```typescript
// Panier d'achat — le panier vide est le neutre
interface Cart {
  items: Map<string, number>;
}

const cartMonoid: Monoid<Cart> = {
  empty: { items: new Map() },
  combine: (a, b) => {
    const items = new Map(a.items);
    for (const [id, qty] of b.items) {
      items.set(id, (items.get(id) ?? 0) + qty);
    }
    return { items };
  },
};

// Permissions — l'absence de permission est le neutre
type Permissions = Set<string>;

const permissionsMonoid: Monoid<Permissions> = {
  empty: new Set(),
  combine: (a, b) => new Set([...a, ...b]),
};

// Logs / événements — concaténation temporelle
type EventLog<E> = E[];
const eventLogMonoid = <E>(): Monoid<EventLog<E>> => arrayConcat<E>();
```

Autres domaines à reconnaître : métriques et compteurs (additifs), moyennes pondérées (monoïde produit somme+poids), config objects fusionnés couche par couche.

### Élément neutre → robustesse

L'élément neutre élimine la branche spéciale pour le cas vide :

```typescript
// Sans monoïde : cas particulier à gérer
function sumUnsafe(nums: number[]): number {
  if (nums.length === 0) throw new Error("empty list");
  return nums.reduce((a, b) => a + b);
}

// Avec monoïde : le neutre gère naturellement le cas vide
function sumSafe(nums: number[]): number {
  return fold(numberSum, nums); // [] -> 0, sans exception ni Option
}
```

Quand tu vois une API qui retourne `Option<Result>` ou lève une exception juste pour le cas "liste vide", propose de vérifier si le domaine a un neutre naturel plutôt que d'ajouter une branche de gestion d'erreur.

### Composabilité

Trois patterns de composition à réutiliser plutôt que réinventer :

```typescript
// 1. Produit de monoïdes — combine composante par composante
function productMonoid<A, B>(ma: Monoid<A>, mb: Monoid<B>): Monoid<[A, B]> {
  return {
    empty: [ma.empty, mb.empty],
    combine: ([a1, b1], [a2, b2]) => [ma.combine(a1, a2), mb.combine(b1, b2)],
  };
}
// Utile pour agréger plusieurs métriques d'un coup : fold(productMonoid(count, sum), ...)

// 2. Fonctions X -> M vers un monoïde
function functionMonoid<X, M>(m: Monoid<M>): Monoid<(x: X) => M> {
  return {
    empty: () => m.empty,
    combine: (f, g) => (x) => m.combine(f(x), g(x)),
  };
}

// 3. Map<K, V> où V est un monoïde — fusion par clé
function mapMonoid<K, V>(mv: Monoid<V>): Monoid<Map<K, V>> {
  return {
    empty: new Map(),
    combine: (a, b) => {
      const result = new Map(a);
      for (const [k, v] of b) {
        result.set(k, result.has(k) ? mv.combine(result.get(k)!, v) : v);
      }
      return result;
    },
  };
}
// Ex : compteurs d'événements par type/topic Kafka : mapMonoid<string, number>(numberSum)
```

---

## Clojure / ClojureScript

En Clojure, l'abstraction est souvent implicite : le langage encourage `reduce` sur des fonctions déjà associatives avec un neutre naturel, plutôt que de réifier une interface `Monoid`. Beaucoup de fonctions core (`+`, `*`, `str`, `into`, `merge-with`, `concat`, `clojure.set/union`) *sont déjà* le monoïde — leur arité 0 encode directement le neutre.

### L'interface (si besoin de la réifier explicitement)

```clojure
(defrecord Monoid [empty combine])

(defn fold [{:keys [empty combine]} items]
  (reduce combine empty items))
```

En pratique, préfère les fonctions core ci-dessous plutôt que réifier — c'est plus idiomatique et le neutre vient gratuitement.

### Monoïdes de base

```clojure
;; Somme — (+) => 0, le neutre est intégré à l'arité 0
(reduce + [1 2 3])              ;; => 6

;; Concaténation de string
(apply str ["a" "b" "c"])       ;; => "abc"

;; Concaténation de collections
(reduce into [] [[1 2] [3 4]])  ;; => [1 2 3 4]

;; Booléens
(every? true? [true true false])  ;; and — neutre true
(some true? [false false true])   ;; or — neutre false

;; Composition de fonctions — (comp) => identity
(comp inc #(* % 2))
```

### Associativité → parallélisation

```clojure
(defn parallel-fold [f init coll chunks]
  (->> (partition-all (/ (count coll) chunks) coll)
       (pmap #(reduce f init %))
       (reduce f init)))

(parallel-fold + 0 (range 1000000) 4)
```

`pmap` distribue sur les cœurs disponibles ; l'associativité de `f` garantit que le regroupement en chunks n'affecte pas le résultat — même logique que le Map-Reduce Kafka évoqué côté TypeScript.

### Modélisation métier

```clojure
;; Panier — merge-with est LE combinateur idiomatique pour les maps
(merge-with + {:apple 2 :banana 1} {:apple 1 :cherry 3})
;; => {:apple 3, :banana 1, :cherry 3}

;; Permissions — clojure.set/union est associatif, #{} est le neutre
(require '[clojure.set :as set])
(apply set/union [#{:read} #{:write} #{:read :admin}])
;; => #{:read :write :admin}

;; Event log — simple concaténation, [] est le neutre
(apply concat [[:e1 :e2] [:e3] [:e4 :e5]])
;; => (:e1 :e2 :e3 :e4 :e5)
```

### Élément neutre → robustesse

Les fonctions variadiques encodent le neutre nativement — le cas "collection vide" ne casse jamais, sans branche spéciale :

```clojure
(reduce + [])       ;; => 0, pas d'exception
(apply str [])       ;; => ""
(merge-with + {})    ;; => {}
```

Contrairement à TS où il faut construire explicitement `numberSum.empty`, ici le neutre est souvent déjà le comportement par défaut de la fonction à arité 0 — un signal que la fonction a été conçue avec l'algèbre en tête.

### Composabilité

```clojure
;; 1. "Produit de monoïdes" — juxt applique plusieurs fonctions et combine leurs résultats
(defn count-and-sum [coll]
  ((juxt count (partial reduce +)) coll))
(count-and-sum [10 20 30])  ;; => [3 60]

;; 2. Fonctions X -> M — combiner ponctuellement deux fonctions vers un monoïde
(defn combine-fns [f g combine]
  (fn [x] (combine (f x) (g x))))

;; 3. Map<K, monoïde> — merge-with généralise à n'importe quel combine
(merge-with into
            {:errors [] :warnings [:w1]}
            {:errors [:e1] :warnings [:w2]})
;; => {:errors [:e1], :warnings [:w1 :w2]}

;; Compteurs d'événements par type — pattern fréquent en event-driven
(defn count-events [events]
  (reduce (fn [acc e] (merge-with + acc {(:type e) 1}))
          {}
          events))
```

### Piège spécifique à Clojure

`(reduce f coll)` sans `init` fonctionne même sans neutre explicite — le premier élément sert d'accumulateur initial. C'est pratique mais ça peut masquer l'absence réelle de neutre : si le domaine n'en a pas naturellement, c'est un semigroupe, pas un monoïde, et paralléliser ou traiter le cas vide devient plus risqué qu'il n'y paraît.

---

## Garde-fous

- Ne force pas l'abstraction si l'opération n'est pas vraiment associative (ex : soustraction, division) — vérifie la loi avant de la proposer, un contre-exemple rapide suffit.
- S'il n'existe pas de neutre naturel dans le domaine, ce n'est peut-être pas un monoïde mais un semigroupe (associatif sans neutre) — le signaler plutôt que d'inventer une valeur neutre artificielle.
- Reste pragmatique : l'objectif est de remplacer du code ad hoc buggé par une API générique, pas d'imposer du vocabulaire fonctionnel pour faire savant. En TS, si `Array.prototype.reduce` suffit et que le code est déjà clair, ne propose pas de sur-architecturer. En Clojure, si `merge-with`/`reduce` avec une fonction core suffit, ne propose pas de réifier un `Monoid` inutilement.
