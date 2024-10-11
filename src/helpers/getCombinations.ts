// from https://github.com/simple-statistics/simple-statistics/blob/main/src/combinations.js

// @ts-ignore: Needs to be reworked.
function getCombinations(x, k) {
  let i;
  let subI;
  const combinationList = [];
  let subsetCombinations;
  let next;

  for (i = 0; i < x.length; i++) {
    if (k === 1) {
      combinationList.push([x[i]]);
    } else {
      subsetCombinations = getCombinations(
        x.slice(i + 1, x.length),
        k - 1,
      );
      for (subI = 0; subI < subsetCombinations.length; subI++) {
        next = subsetCombinations[subI];
        next.unshift(x[i]);
        combinationList.push(next);
      }
    }
  }
  return combinationList;
}

export default getCombinations;
