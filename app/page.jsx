"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as XLSX from "xlsx";
import arrayShiftFunction from "../components/arrayShiftFunction";
import { modifyArrayFunction } from "../components/modifyArrayFunction";
import createBatch from "../components/createBatch";
import tableGenerator from "../components/tableGenerator";
const page = () => {
  const formik = useFormik({
    initialValues: {
      semester: "",
      year: "",
      file: "",
      batch_size: "",
      practicalPerDay: "",
      totalPracticals: "",
    },
  });
  const [excelFile, setExcelFile] = useState(null);
  const [excelFileErr, setExcelFileErr] = useState(null);
  const [fileData, setFileData] = useState(null);

  const fileType = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  const [displayTable, setDisplayTable] = useState(null);
  useEffect(() => {
    
    console.log(displayTable);
  }, [displayTable]);

  useEffect(() => {
    if (!excelFile) setFileData(null);
    else {
      const workBook = XLSX.read(excelFile, { type: "buffer" });
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const data = XLSX.utils.sheet_to_json(workSheet);
      setFileData(data);
    }
  }, [excelFile]);
  // useEffect(()=>{
  //   const DIS=(displayTable.map = (item) => {
  //     return (
  //       <div className="flex gap-2">
  //         <h4>Day</h4>:<h4>{item.Day}</h4>
  //         <h4>Slot</h4>:<h4>{item.Slot}</h4>
  //         <h5>From</h5>:<h5>{item.Batch.startRollNo}</h5>
  //         <h5>To</h5>:<h5>{item.Batch.endRollNo}</h5>
  //       </div>
  //     );
  //   })
  // },[displayTable])
  // const handleFile = (e) => {
  //   let selectedFile = e.target.files[0];
  //   if (selectedFile) {
  //     // console.log(selectedFile.type)
  //     if (fileType.includes(selectedFile.type)) {
  //       let reader = new FileReader();
  //       reader.readAsArrayBuffer(selectedFile);
  //       reader.onload = (e) => {
  //         setExcelFileErr(null);
  //         setExcelFile(e.target.result);
  //       };
  //     } else {
  //       setExcelFileErr("Type Err");
  //       setExcelFile(null);
  //     }
  //   } else {
  //     console.log("no file");
  //   }
  // };
  const generateCLicked = (e) => {
    e.preventDefault();
    var newBatchDividedArray = createBatch(fileData, batch_size.value);
    var finalBatchArray = modifyArrayFunction(
      newBatchDividedArray,
      totalPracticals.value
    );

    var newArray = [...finalBatchArray];
    for (var i = 1; i <= totalPracticals.value - 1; i++) {
      finalBatchArray = arrayShiftFunction(finalBatchArray);
      newArray = [...newArray, ...finalBatchArray];
    }
    setDisplayTable(tableGenerator(newArray, +totalPracticals.value));
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h4>Practical Schedular</h4>
      <div className="grid gap-4 grid-cols-2">
        <label htmlFor="semester">Enter Semester</label>
        <input
          id="semester"
          name="semester"
          label="semester"
          onChange={formik.handleChange}
          value={formik.values.name}
          type="text"
        />
        <label htmlFor="year">Enter Year</label>
        <input
          id="year"
          label="year"
          name="year"
          onChange={formik.handleChange}
          value={formik.values.name}
          type="text"
        />
        <label htmlFor="totalPracticals">Total Subjects</label>
        <input
          id="totalPracticals"
          name="totalPracticals"
          label="totalPracticals"
          onChange={formik.handleChange}
          value={formik.values.name}
          type="number"
        />
        <label htmlFor="file" className="justify-cente flex items-center">
          Upload Student File
        </label>
        <input
          type="file"
          id="file"
          name="file"
          onChange={(e) => {
            let selectedFile = e.target.files[0];
            if (selectedFile) {
              // console.log(selectedFile.type)
              if (fileType.includes(selectedFile.type)) {
                let reader = new FileReader();
                reader.readAsArrayBuffer(selectedFile);
                reader.onload = (e) => {
                  setExcelFileErr(null);
                  setExcelFile(e.target.result);
                };
              } else {
                setExcelFileErr("Type Err");
                setExcelFile(null);
              }
            } else {
              alert("No File Detected.");
            }
          }}
        />
        <label htmlFor="batch_size" className="justify-cente flex items-center">
          Enter Students in each Batch
        </label>
        <input
          className="border-gray-900 px-1 py-3 rounded-sm border-[.5px]"
          placeholder="Batch Size"
          type="number"
          name="batch_size"
          id="batch_size"
          label="batch_size"
          onChange={formik.handleChange}
        />
        <label className="justify-cente flex items-center">
          Number of practicals per day
        </label>
        <input
          id="practicalPerDay"
          name="practicalPerDay"
          label="practicalPerDay"
          type="number"
          onChange={formik.handleChange}
          value={formik.values.name}
        />
        <button onClick={generateCLicked}>Generate Schedule</button>
      </div>
      <h2>Schedule</h2>
      <div className="flex gap-[14rem] ">
        <div>Subject 1</div>
        <div>Subject 2</div>
        <div>Subject 3</div>
        <div>Subject 4</div>
      </div>
      <div className={`grid grid-cols-4 gap-2`}>
        {displayTable &&
          displayTable.map((item) => {
            console.log(totalPracticals.value);
            return (
              <div className="flex flex-col gap-2">
                <div className="flex gap-1">Day-{item.Day} Batch-{item.Slot}</div>
                <div className="flex gap-1"> {item.Batch.startRollNo}-{item.Batch.endRollNo}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default page;
