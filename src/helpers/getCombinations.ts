// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
// from https://github.com/simple-statistics/simple-statistics/blob/main/src/combinations.js

/**
 * Implementation of Combinations
 * Combinations are unique subsets of a collection - in this case, k x from a collection at a time.
 * https://en.wikipedia.org/wiki/Combination
 * @param {Array} x any type of data
 * @param {int} k the number of objects in each group (without replacement)
 * @returns {Array<Array>} array of permutations
 * @example
 * combinations([1, 2, 3], 2); // => [[1,2], [1,3], [2,3]]
 */

function getCombinations(x, k) {
    let i
    let subI
    const combinationList = []
    let subsetCombinations
    let next

    for (i = 0; i < x.length; i++) {
        if (k === 1) {
            combinationList.push([x[i]])
        } else {
            subsetCombinations = getCombinations(
                x.slice(i + 1, x.length),
                k - 1
            )
            for (subI = 0; subI < subsetCombinations.length; subI++) {
                next = subsetCombinations[subI]
                next.unshift(x[i])
                combinationList.push(next)
            }
        }
    }
    return combinationList
}

export default getCombinations
