import React from "react";

export default function createBatch(data, batch_size) {
  var newArr = [],
    c = 0,
    startingIndex = 0,
    endingIndex,
    l = data.length;
  // for(var i=0;i<data.length;i+=batch_size)
  // {
  //     newArr=[...newArr,{'batchName':`Batch${++c}`,'startRollNo':data[0].CollegeId,'endRollNo':data[i+batch_size-1].CollegeId}]
  // }
  while (startingIndex < l) {
    endingIndex = Math.min(+batch_size - 1 + startingIndex, l - 1);
    // console.log(startingIndex,data[startingIndex].CollegeId,endingIndex,data[endingIndex].CollegeId)
    newArr = [
      ...newArr,
      {
        batchName: `Batch ${++c}`,
        startRollNo: data[startingIndex].CollegeId,
        endRollNo: data[endingIndex].CollegeId,
      }
    ];
    startingIndex = endingIndex + 1;
  }
  return newArr;
}
