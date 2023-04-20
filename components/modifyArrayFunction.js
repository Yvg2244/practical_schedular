import React from "react";

export const modifyArrayFunction = (arr, subject) => {
  while (arr.length % subject != 0)
    arr.push({
      batchName: null,
      startRollNo: null,
      endRollNo: null,
    });
  return arr;
};
