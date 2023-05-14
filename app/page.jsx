"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as XLSX from "xlsx";
import arrayShiftFunction from "../components/arrayShiftFunction";
import { modifyArrayFunction } from "../components/modifyArrayFunction";
import createBatch from "../components/createBatch";
import tableGenerator from "../components/tableGenerator";
import axios from "axios";

const page = () => {
  function objectMap(object, mapFn) {
    return Object.keys(object).reduce(function (result, key) {
      result[key] = mapFn(object[key]);
      return result;
    }, {});
  }
  const shortenArr=(arr)=>{
    var modifiedArr="";
    var count=1
    modifiedArr+=arr[0].toString()
    while(count<arr.length-1)
    {
        
        if(arr[count+1]==arr[count]+1)
        {
            count+=1
        continue;
        }
        else{
        modifiedArr+="-"+arr[count].toString()+","+arr[count+1].toString();
        
        }
        count+=1;
    }
        if(arr[count]==arr[count-1]+1)
        modifiedArr+="-"+arr[count].toString()
        else
        {
        modifiedArr+=","+arr[count].toString()
        }
      return modifiedArr

    }
  const formik = useFormik({
    initialValues: {
      uploadsemester: "",
      semester: "",
      date: "",
      file: "",
      batch_size: "",
      externalId: "",
      subject: "",
      get_schedule_sem: "",
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

    // if (displayTable) {
    //   Object.keys(displayTable).forEach((key) => {
    //     var subject = key;
    //     var subjectData = displayTable[key];
    //     console.log(subject);
    //     Object.keys(subjectData).forEach((key) => {
    //       var subjectDate = key;
    //       console.log(subjectDate);
    //       var subjectDatePracticals = subjectData[subjectDate];
    //       Object.keys(subjectDatePracticals).forEach((key) => {
    //         var inviglatorId = key;
    //         console.log(inviglatorId);
    //         var studentsOnInviglator = subjectDatePracticals[inviglatorId];

    //         Object.keys(studentsOnInviglator).forEach((key) => {
    //           var batch = key;
    //           console.log(batch);
    //           var studentInBatch = studentsOnInviglator[key];
    //           studentInBatch.map((item) => {
    //             console.log(item);
    //           });
    //         });
    //       });
    //     });
    //   });
    // }
  }, [displayTable]);

  useEffect(() => {
    if (!excelFile) setFileData(null);
    else {
      const workBook = XLSX.read(excelFile, { type: "buffer" });
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const data = XLSX.utils.sheet_to_json(workSheet);
      console.log(data);
      data.forEach((element) => {
        var studentRollNo = element.CollegeId;
        var studentSub = element.Subject.split(",");
        console.log(studentRollNo, studentSub);
        axios
          .post("https://scheduler-b3ns.onrender.com/uploadStudent", {
            rollNo: studentRollNo,
            sem: Number(formik.values.uploadsemester),
            sub: studentSub,
          })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.log(err);
          });
      });

      setFileData(data);
    }
  }, [excelFile]);

  const generateCLicked = (e) => {
    // console.log(formik.values);
    axios
      .post("https://scheduler-b3ns.onrender.com/get", {})
      .then((res) => {
        console.log(res.data)
        setDisplayTable(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const createCLicked = (e) => {
    console.log(formik.values);
    axios
      .post("https://scheduler-b3ns.onrender.com/schedule", {
        date: formik.values.date,
        sem: Number(formik.values.semester),
        sub: formik.values.subject,
        totalStudents: formik.values.batch_size,
        invigilator: formik.values.externalId,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const resetCLicked = (e) => {
    axios
      .post("https://scheduler-b3ns.onrender.com/reset", {
        sem: 6,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="w-full h-full my-[1rem] flex flex-col items-center justify-center">
      <h4 className="my-[3rem]">Practical Schedular</h4>
      <div className="grid gap-4 grid-cols-2">
        <label htmlFor="uploadsemester">Enter semester of data</label>
        <input
          onChange={formik.handleChange}
          value={formik.values.name}
          type="number"
          name="uploadsemester"
          id="uploadsemester"
          label="uploadsemester"
          placeholder="Enter semsester"
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
        <h4 className="col-span-2 text-center">Create Schedule</h4>

        <label htmlFor="semester">Enter Semester</label>
        <input
          id="semester"
          name="semester"
          label="semester"
          onChange={formik.handleChange}
          value={formik.values.name}
          type="text"
        />
        <label htmlFor="date">Enter Date</label>
        <input
          id="date"
          label="date"
          name="date"
          placeholder="DDMMYYYY"
          onChange={formik.handleChange}
          value={formik.values.name}
          type="text"
        />
        <label htmlFor="subject">Enter Subject</label>
        <input
          id="subject"
          name="subject"
          label="subject"
          onChange={formik.handleChange}
          value={formik.values.name}
          type="text"
        />

        <label className="justify-cente flex items-center">Inviglator Id</label>
        <input
          id="externalId"
          name="externalId"
          label="externalId"
          type="number"
          onChange={formik.handleChange}
          value={formik.values.name}
        />
        <label htmlFor="batch_size" className="justify-cente flex items-center">
          Students under external
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
        <button className="col-span-2" onClick={createCLicked}>
          Create Schedule
        </button>
        <h4 className="col-span-2 text-center">Get Schedule</h4>

        <label className="justify-cente flex items-center">
          Enter Semester
        </label>
        <input
          id="get_schedule_sem"
          name="get_schedule_sem"
          label="get_schedule_sem"
          type="number"
          onChange={formik.handleChange}
          value={formik.values.name}
        />
        <button className="col-span-2" onClick={generateCLicked}>
          Get Schedule
        </button>
        {/* <div className="grid grid-cols-5 w-[100vw] items-center gap-4 px-5">
          <p>Subject Code</p>
          <p>Date</p>
          <p>Inviglator Id</p>
          <p>Slot</p>
          <p>Students</p>
        </div> */}
        <div className="flex flex-col w-[80vw] justify-center items-center gap-[2rem]">
          {displayTable ? (
            Object.keys(displayTable).map((item) => {
              var subject = item;
              var subjectData = displayTable[item];
              // return <span>{subject}</span>;
              return Object.keys(subjectData).map((key) => {
                var subjectDate = key;
                var subjectDatePracticals = subjectData[subjectDate];
                // console.log(subjectDate);
                return Object.keys(subjectDatePracticals).map((key) => {
                  var inviglatorId = key;

                  var studentsOnInviglator =
                    subjectDatePracticals[inviglatorId];
                  // console.log(inviglatorId);
                  // counter
                  return Object.keys(studentsOnInviglator).map((key) => {
                    var batch = key;
                    var studentInBatch = studentsOnInviglator[key];
                    var arrOfStudents = shortenArr(studentInBatch);

                    return (
                      <div className=" flex justify-around gap-[4rem]">
                        <span>{subject}</span>
                        <span>{subjectDate}</span>
                        <span>{inviglatorId}</span>
                        <span>{batch}</span>
                        <span className="w-[10rem]">{arrOfStudents}</span>
                      </div>
                    );
                  });
                });
              });
            })
          ) : (
            <></>
          )}
        </div>

        <button className="col-span-2" onClick={resetCLicked}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default page;
