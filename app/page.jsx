"use client";
import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as XLSX from "xlsx";
import axios from "axios";
import ReactToPrint from "react-to-print";
const Homepage = () => {
  const shortenArr = (arr) => {
    var modifiedArr = "";
    var count = 1;
 
    modifiedArr += arr[0]?.toString();
    while (count < arr.length - 1) {
      if (arr[count + 1] == arr[count] + 1) {
        count += 1;
        continue;
      } else {
        modifiedArr +=
          "-" + arr[count].toString() + "," + arr[count + 1].toString();
      }
      count += 1;
    }
    if (arr[count] == arr[count - 1] + 1)
      modifiedArr += "-" + arr[count]?.toString();
    else {
      modifiedArr += "," + arr[count]?.toString();
    }
    return modifiedArr;
  };
  const validate = (values) => {
    const errors = {};
    if (!values.uploadsemester) errors.uploadsemester = "Required";
    if (!values.semester) errors.semester = "Required";
    if (!values.date) errors.date = "Required";
    if (!values.subject) errors.subject = "Required";
    if (!values.externalId) errors.externalId = "Required";
    if (!values.batch_size) errors.batch_size = "Required";
    if (!values.get_schedule_sem) errors.get_schedule_sem = "Required";
    if (!values.reset_schedule_sem) errors.reset_schedule_sem = "Required";
    return errors;
  };
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
      reset_schedule_sem: "",
    },
    validate,
  });
  var prevSub = "";
  var showSub = "";
  var prevDate = "";
  var showDate = "";
  var prevInvig = "";
  var showInvig = "";
  const componentRef = useRef();
  const componentRef2 = useRef();
  const [c,setC]=useState(1);
  const [createScheduleErr, setCreateScheduleErr] = useState(false);
  const [getScheduleErr, setGetScheduleErr] = useState(false);
  const [resetScheduleErr, setResetScheduleErr] = useState(false);
  const [createScheduleMsg, setCreateScheduleMsg] = useState("");
  const [getScheduleMsg, setGetScheduleMsg] = useState("");
  const [resetScheduleMsg, setResetScheduleMsg] = useState("");
  const [studentLeft, setStudentLeft] = useState(0);
  const [excelFile, setExcelFile] = useState(null);
  const [excelFileErr, setExcelFileErr] = useState(null);
  const [fileData, setFileData] = useState(null);
  const fileType = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  const [displayTable, setDisplayTable] = useState(null);
  useEffect(() => {
    // console.log(displayTable);
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

  useEffect(() => {
    console.log(createScheduleErr, getScheduleErr, resetScheduleErr);
    console.log(formik.errors);
    if (
      formik.errors.hasOwnProperty("semester") ||
      formik.errors.hasOwnProperty("date") ||
      formik.errors.hasOwnProperty("subject") ||
      formik.errors.hasOwnProperty("externalId") ||
      formik.errors.hasOwnProperty("batch_size")
    )
      setCreateScheduleErr(true);
    else setCreateScheduleErr(false);
    if (formik.errors.hasOwnProperty("get_schedule_sem"))
      setGetScheduleErr(true);
    else setGetScheduleErr(false);
    if (formik.errors.hasOwnProperty("reset_schedule_sem"))
      setResetScheduleErr(true);
    else setResetScheduleErr(false);
  }, [formik.errors,createScheduleErr, getScheduleErr, resetScheduleErr]);
  const generateCLicked = (e) => {
    setGetScheduleMsg("Getting Schedule");
    axios
      .post("https://scheduler-b3ns.onrender.com/get", {
        sem: formik.values.get_schedule_sem,
      })
      .then((res) => {
        console.log(res);
        if (res.status != 200) setGetScheduleMsg("Error getting schedule");
        else setGetScheduleMsg("");
        setDisplayTable(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const createCLicked = (e) => {
    console.log(formik.values);
    setCreateScheduleMsg("Creating Schedule");
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
        if (res.data?.msg == "done") {
          setCreateScheduleMsg("Schedule Created Successfully");
          setStudentLeft(res.data.totalStudentsLeft);
        } else setCreateScheduleMsg("Error in creating Schedule");
      })
      .catch((err) => {
        console.log(err);
        setCreateScheduleMsg("Error in creating Schedule");
      });
  };
  const resetCLicked = (e) => {
    setResetScheduleMsg("Reseting Schedule");

    axios
      .post("https://scheduler-b3ns.onrender.com/reset", {
        sem: formik.values.reset_schedule_sem,
      })
      .then((res) => {
        if (res?.data == "done") {
          setResetScheduleMsg("Schedule Reset Successfully");
        } else setResetScheduleMsg("Error in creating Schedule");
        console.log(res);
      })
      .catch((err) => {
        setResetScheduleMsg("Error in creating Schedule");
        console.log(err);
      });
  };

  return (
    <div className="w-full h-full px-4 my-[1rem] flex flex-col items-center justify-center">
      <h4 className="mb-[3rem] mt-[1rem] text-2xl font-extrabold ">
        Practical Schedular
      </h4>
      <div className="grid gap-4 px-4 grid-cols-2">
        <h4 className="col-span-2 text-xl font-semibold text-center">
          Upload student data
        </h4>

        <label htmlFor="uploadsemester">Enter semester of data</label>
        <input
          onChange={formik.handleChange}
          value={formik.values.name}
          type="number"
          name="uploadsemester"
          id="uploadsemester"
          label="uploadsemester"
          placeholder="Enter semsester"
          onBlur={formik.handleBlur}
        />
        <div></div>
        <div>
          {formik.touched.uploadsemester && formik.errors.uploadsemester ? (
            <div className="text-red-600 text-md">
              {formik.errors.uploadsemester}
            </div>
          ) : null}
        </div>
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
        <div className="w-full h-1 border-b-gray-700 my-1 border-[1px] col-span-2"></div>
        <h4 className="col-span-2 text-xl font-semibold text-center">
          Create Schedule
        </h4>

        <label htmlFor="semester">Enter Semester</label>
        <input
          id="semester"
          name="semester"
          label="semester"
          onChange={formik.handleChange}
          value={formik.values.name}
          type="text"
          onBlur={formik.handleBlur}
        />
        <div></div>
        <div>
          {formik.touched.semester && formik.errors.semester ? (
            <div className="text-red-600 text-md">{formik.errors.semester}</div>
          ) : null}
        </div>
        <label htmlFor="date">Enter Date</label>
        <input
          id="date"
          label="date"
          name="date"
          placeholder="DD-MM-YYYY"
          onChange={formik.handleChange}
          value={formik.values.name}
          type="text"
          onBlur={formik.handleBlur}
        />
        <div></div>
        <div>
          {formik.touched.date && formik.errors.date ? (
            <div className="text-red-600 text-md">{formik.errors.date}</div>
          ) : null}
        </div>
        <label htmlFor="subject">Enter Subject</label>
        <input
          id="subject"
          name="subject"
          label="subject"
          onChange={formik.handleChange}
          value={formik.values.name}
          type="text"
          onBlur={formik.handleBlur}
        />
        <div></div>
        <div>
          {formik.touched.subject && formik.errors.subject ? (
            <div className="text-red-600 text-md">{formik.errors.subject}</div>
          ) : null}
        </div>
        <label className="justify-cente flex items-center">Inviglator Id</label>
        <input
          id="externalId"
          name="externalId"
          label="externalId"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.name}
          onBlur={formik.handleBlur}
        />
        <div></div>
        <div>
          {formik.touched.externalId && formik.errors.externalId ? (
            <div className="text-red-600 text-md">
              {formik.errors.externalId}
            </div>
          ) : null}
        </div>
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
          onBlur={formik.handleBlur}
        />
        <div className="w-full text-green-500">{createScheduleMsg}</div>
        <div className="w-full text-green-500">{`${studentLeft} students left`}</div>
        <div></div>
        <div>
          {formik.touched.batch_size && formik.errors.batch_size ? (
            <div className="text-red-600 text-md">
              {formik.errors.batch_size}
            </div>
          ) : null}
        </div>
        <button
          className="col-span-2 w-[15rem] items-center rounded-md p-2 font-semibold tracking-wider"
          onClick={createCLicked}
          disabled={createScheduleErr}
        >
          Create Schedule
        </button>
        <div className="w-full h-1 border-b-gray-700 my-1 border-[1px] col-span-2"></div>
        <h4 className="col-span-2 text-xl font-semibold text-center">
          Get Schedule
        </h4>

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
          onBlur={formik.handleBlur}
        />
        <div className="w-full text-green-500">{getScheduleMsg}</div>
        <div className="w-full text-green-500"></div>
        <div></div>
        <div>
          {formik.touched.get_schedule_sem && formik.errors.get_schedule_sem ? (
            <div className="text-red-600 text-md">
              {formik.errors.get_schedule_sem}
            </div>
          ) : null}
        </div>
        <button
          className="col-span-2 w-[15rem] items-center rounded-md p-2 font-semibold tracking-wider"
          onClick={generateCLicked}
          disabled={getScheduleErr}
        >
          Get Schedule
        </button>
        <ReactToPrint
          trigger={() => {
            return (
              <button className="col-span-2 w-[15rem] items-center rounded-md p-2 font-semibold tracking-wider">
                Print
              </button>
            );
          }}
          content={() => componentRef.current}
          pageStyle="print"
        />
        <div
          ref={componentRef}
          className="flex flex-col w-[95vw] text-center justify-center items-center px-[2rem]"
        >
          <div className="flex w-full">
            <span className="p-[1rem] w-[10rem] border-[1px] border-black text-xl font-bold">
              Subject
            </span>
            <span className="p-[1rem] w-[10rem] border-[1px] border-black">
              Date
            </span>
            <span className="p-[1rem] w-[10rem] border-[1px] border-black">
              Invig.
            </span>
            <span className="p-[1rem] w-[10rem] border-[1px] border-black">
              Batch
            </span>
            <span className="p-[1rem] w-[30rem] overflow-none border-[1px] border-black">
              Students
            </span>
            <span className="p-[1rem] w-[10rem] border-[1px] border-black">
              Lab
            </span>
            <span className="p-[1rem] w-[8rem] border-[1px] border-black">
              Internal Invig.
            </span>
          </div>

          {displayTable ? (
            Object.keys(displayTable).map((item) => {
              var subject = item;
              var curSub = subject;
              var subjectData = displayTable[item];
              return Object.keys(subjectData).map((key) => {
                var subjectDate = key;
                var subjectDatePracticals = subjectData[subjectDate];
                var curDate = subjectDate;
                return Object.keys(subjectDatePracticals).map((key) => {
                  var inviglatorId = key;
                  var studentsOnInviglator =
                    subjectDatePracticals[inviglatorId];
                  var curInvig = inviglatorId;
                  return Object.keys(studentsOnInviglator).map((key) => {
                    var batch = key;
                    var studentInBatch = studentsOnInviglator[key];
                    var arrOfStudents = shortenArr(studentInBatch);
                   
                    if (curSub != prevSub) {
                      showSub = curSub;
                      prevSub = curSub;
                    } else {
                      showSub = "";
                    }
                    if (curDate != prevDate) {
                      showDate = curDate;
                      prevDate = curDate;
                    } else {
                      showDate = "";
                    }
                    if (curInvig != prevInvig) {
                      showInvig = curInvig;
                      prevInvig = curInvig;
                    } else {
                      showInvig = "";
                    }
                    return (
                      <div key="1" className="flex w-full">
                        <span className="p-[1rem] w-[10rem] border-[1px] border-black text-xl font-bold">
                          {subject}
                        </span>
                        <span className="p-[1rem] w-[10rem] border-[1px] border-black">
                          {subjectDate}
                        </span>
                        <span className="p-[1rem] w-[10rem] border-[1px] border-black">
                          {inviglatorId}
                        </span>
                        <span className="p-[1rem] w-[10rem] border-[1px] border-black">
                          {batch}
                        </span>
                        <span className="p-[1rem] w-[30rem] text-start overflow-none border-[1px] border-black">
                          {arrOfStudents}
                        </span>
                        <span className="p-[1rem] w-[10rem] border-[1px] border-black">
                          
                        </span>
                        <span className="p-[1rem] w-[8rem] border-[1px] border-black">
                         
                        </span>
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
        <div className="w-full h-1 border-b-gray-700 my-1 border-[1px] col-span-2"></div>

        <ReactToPrint
          trigger={() => {
            return (
              <button className="col-span-2 w-[15rem] items-center rounded-md p-2 font-semibold tracking-wider">
                Print for students
              </button>
            );
          }}
          content={() => componentRef2.current}
          pageStyle="print"
        />
        <div
          ref={componentRef2}
          className="flex flex-col w-[95vw] text-center justify-center items-center px-[2rem]"
        >
          <div className="flex w-full">
            <span className="p-[1rem] w-[10rem] border-[1px] border-black text-xl font-bold">
              Subject
            </span>
            <span className="p-[1rem] w-[10rem] border-[1px] border-black">
              Date
            </span>
            <span className="p-[1rem] w-[10rem] border-[1px] border-black">
              Batch
            </span>
            <span className="p-[1rem] w-[30rem] overflow-none border-[1px] border-black">
              Students
            </span>
            <span className="p-[1rem] w-[10rem] border-[1px] border-black">
              Lab
            </span>
            <span className="p-[1rem] w-[8rem] border-[1px] border-black">
              Internal Invig.
            </span>
          </div>

          {displayTable ? (
            Object.keys(displayTable).map((item) => {
              var subject = item;
              var curSub = subject;
              var subjectData = displayTable[item];
              return Object.keys(subjectData).map((key) => {
                var subjectDate = key;
                var subjectDatePracticals = subjectData[subjectDate];
                var curDate = subjectDate;
                return Object.keys(subjectDatePracticals).map((key) => {
                  var inviglatorId = key;
                  var studentsOnInviglator =
                    subjectDatePracticals[inviglatorId];
                  var curInvig = inviglatorId;
                  return Object.keys(studentsOnInviglator).map((key) => {
                    var batch = key;
                    var studentInBatch = studentsOnInviglator[key];
                    var arrOfStudents = shortenArr(studentInBatch);
                   
                    if (curSub != prevSub) {
                      showSub = curSub;
                      prevSub = curSub;
                    } else {
                      showSub = "";
                    }
                    if (curDate != prevDate) {
                      showDate = curDate;
                      prevDate = curDate;
                    } else {
                      showDate = "";
                    }
                    if (curInvig != prevInvig) {
                      showInvig = curInvig;
                      prevInvig = curInvig;
                    } else {
                      showInvig = "";
                    }
                    return (
                      <div key="1" className="flex w-full">
                        <span className="p-[1rem] w-[10rem] border-[1px] border-black text-xl font-bold">
                          {subject}
                        </span>
                        <span className="p-[1rem] w-[10rem] border-[1px] border-black">
                          {subjectDate}
                        </span>
                        <span className="p-[1rem] w-[10rem] border-[1px] border-black">
                          {batch}
                        </span>
                        <span className="p-[1rem] w-[30rem] text-start overflow-none border-[1px] border-black">
                          {arrOfStudents}
                        </span>
                        <span className="p-[1rem] w-[10rem] border-[1px] border-black">
                          
                        </span>
                        <span className="p-[1rem] w-[8rem] border-[1px] border-black">
                         
                        </span>
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
        <div className="w-full h-1 border-b-gray-700 my-1 border-[1px] col-span-2"></div>

        <h4 className="col-span-2 text-xl font-semibold text-center">
          Reset Schedule
        </h4>
        <label className="justify-cente flex items-center">
          Enter Semester
        </label>
        <input
          id="reset_schedule_sem"
          name="reset_schedule_sem"
          label="reset_schedule_sem"
          type="number"
          onChange={formik.handleChange}
          value={formik.values.name}
          onBlur={formik.handleBlur}
        />
        <div className="w-full text-green-500">{resetScheduleMsg}</div>
        <div className="w-full text-green-500"></div>
        <button
          className="col-span-2 w-[15rem] items-center rounded-md p-2 font-semibold tracking-wider"
          onClick={resetCLicked}
          disabled={resetScheduleErr}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Homepage;
