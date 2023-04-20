import React from "react";
function arrayShiftFunction(arr) {
  if (!arr) return null;
  let temp = arr[arr.length - 1];
  for (let i = arr.length - 1; i >= 1; i--) {
    arr[i] = arr[i - 1];
  }
  arr[0] = temp;
  return arr;
}
export default arrayShiftFunction;
