---
name: monoids
description: Recognize and apply the monoid abstraction (binary associative operation + neutral element) in Clojure/ClojureScript code. Use whenever the user is combining, aggregating, merging, or reducing data — metrics and counters, event logs, config objects, or any `reduce`/`fold`/`merge-with` over a collection — even if they don't use the word "monoid". Also use when reviewing code that special-cases empty lists/collections, when discussing Map-Reduce or parallel aggregation (including `pmap`-based reduction), or when designing a generic `combine`/`merge`/`empty` API instead of ad hoc merge logic. Trigger this for "how do I merge these two X" or "what's a clean way to aggregate Y" style questions, not just explicit monoid/algebra questions. For TypeScript idioms, route to the `typescript` skill instead.
---

# Monoïdes

Un monoïde est une structure minimaliste : un ensemble de valeurs + une opération binaire **associative** (`combine`) + un **élément neutre** (`empty`). Rien de plus. Reconnaître cette structure dans du code métier permet de remplacer une logique de fusion ad hoc — source fréquente de bugs sur les cas limites — par une API générique et testée une fois pour toutes.

Cette skill couvre Clojure/ClojureScript. Le concept est identique dans les deux langages ; seule l'idiomatique change. L'idiomatique TypeScript (interface `Monoid<T>`, folds, monoïdes métier) vit désormais dans le skill typescript → `../typescript/composition/references/monoids.md` ; routez les questions TS vers cette référence.

Source de référence : [Les monoïdes : une abstraction omniprésente (evryg)](https://kb.evryg.com/fr/ingenierie-logicielle-avancee/fondations/les-monoides-une-abstraction-omnipresente)

## Quand appliquer cette skill

Le signal à repérer, ce n'est pas le mot "monoïde" — c'est un des patterns suivants dans la demande ou le code :

- Une fonction `merge(a, b)`, `combine(a, b)` ou `add(a, b)` codée à la main pour un type précis
- Un `reduce`/`fold` sur une liste avec une valeur initiale arbitraire
- Un `if (list.length === 0) throw / return nil` avant un calcul d'agrégat
- L'envie de paralléliser un calcul d'agrégation (Map-Reduce, agrégation par partition Kafka, etc.)
- Une modélisation métier qui "s'additionne" naturellement : permissions, compteurs, logs, config

Si un de ces patterns apparaît, propose activement la structure monoïdale plutôt que d'attendre que l'utilisateur la nomme.

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

`pmap` distribue sur les cœurs disponibles ; l'associativité de `f` garantit que le regroupement en chunks n'affecte pas le résultat — c'est la même logique que le fold monoïdal distribué.

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

Ici le neutre est souvent déjà le comportement par défaut de la fonction à arité 0 — un signal que la fonction a été conçue avec l'algèbre en tête.

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
- Reste pragmatique : l'objectif est de remplacer du code ad hoc buggé par une API générique, pas d'imposer du vocabulaire fonctionnel pour faire savant. En Clojure, si `merge-with`/`reduce` avec une fonction core suffit, ne propose pas de réifier un `Monoid` inutilement.

---


## Benchmark

Scenario: `.benchmarks/scenarios/monoids-001-parallel-merge.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/monoids-001-parallel-merge.json`

| Model             | Without | With  | Delta |
| ----------------- | ------- | ----- | ----- |
| claude-opus-4-8   | 100%    | 100%    | +0%   |
| claude-sonnet-4-6 | 83%     | 100%    | +17%   |
| claude-haiku-4-5  | 100%    | 100%    | +0%   |

> **SOFT PASS (run 2026-08-31)**. Flat deltas are the expected finding: the French-language body (`# Monoïdes`) does not activate for English-prompted runs (audit Warning). Sonnet +17 (83→100); opus/haiku unchanged. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
