import React from "react";

function tableGenerator(arr, subjects) {
  const totalBatches = arr.length / subjects;
  var day = 1,
    slot = 0;
  var finalArr = [];
  for (var i = 0; i < arr.length; i++) {
    if (i % subjects == 0) slot++;
    if (slot > 3) {
      day++;
      slot = 1;
    }
    finalArr = [...finalArr, ...[{ Day: day, Slot: slot, Batch: arr[i] }]];
  }
  return finalArr;
}

export default tableGenerator;
