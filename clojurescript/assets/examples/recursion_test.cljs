(ns recursion-test
  (:require [recursion :refer [scheme-sum]]
            [cljs.test :as t :refer [is testing deftest]]))

(deftest scheme-sum-test
  (testing "1+2+3=6"
    (is (= (scheme-sum [1 2 3]) 6)))

  (testing "5+6+7=18"
    (is (= (scheme-sum [5 6 7]) 18)))

  (testing "empty list = 0"
    (is (= (scheme-sum []) 0))))

(cljs.test/run-tests)
