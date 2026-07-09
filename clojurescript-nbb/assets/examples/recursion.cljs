(ns recursion)

(defn scheme-sum [vals]
  (loop [xs vals
         acc 0]
    (if (empty? xs)
      acc
      (recur (rest xs) (+ acc (first xs))))))
