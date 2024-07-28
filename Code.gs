function doGet(e) {
  //e = e || {};
  //let page = e.parameter && e.parameter.mode ? e.parameter.mode : "main_page"; //code to resolve the error when running
  let page = e.parameter.mode || "main_page";
  let template = HtmlService.createTemplateFromFile(page);
  let htmlOutput = template.evaluate();

  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  htmlOutput.setContent(htmlOutput.getContent().replace("{{NAVBAR}}", getNavbar(page)));
  
  return htmlOutput;
}

function getNavbar(activePage) {
  var scriptURLHome = getScriptURL();
  var scriptURLEmployeeManagement = getScriptURL("mode=employee_management");
  var scriptURLLeaveManagement = getScriptURL("mode=leave_management");
  var scriptURLReport = getScriptURL("mode=report");

  var navbar =
    `<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
        
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link ${activePage === 'main_page' ? 'active' : ''}" href="${scriptURLHome}">
                        <span class="title">login name</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${activePage === 'main_page' ? 'active' : ''}" href="${scriptURLHome}">
                        <span class="icon">
                            <ion-icon name="home"></ion-icon>
                        </span>
                        <span class="title">Home</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${activePage === 'employee_management' ? 'active' : ''}" href="${scriptURLEmployeeManagement}">
                        <span class="icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </span>
                        <span class="title">Employee Management</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${activePage === 'leave_management' ? 'active' : ''}" href="${scriptURLLeaveManagement}">
                        <span class="icon">
                            <ion-icon name="calendar-outline"></ion-icon>
                        </span>
                        <span class="title">Leave Management</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${activePage === 'report' ? 'active' : ''}" href="${scriptURLReport}">
                        <span class="icon">
                            <ion-icon name="file-tray-full-outline"></ion-icon>
                        </span>
                        <span class="title">Report</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>`;
  return navbar;
}

function getScriptURL(qs = null) {
  var url = ScriptApp.getService().getUrl();
  if (qs) {
    if (qs.indexOf("?") === -1) {
      qs = "?" + qs;
    }
    url = url + qs;
  }
  return url;
}

function importEmployeesFromFolder() {
  var folderId = '1aoUkaPUrTJrujmRyeO_NVSmLnMNCuSeN'; // Replace with your folder ID
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);

  var employeeData = [];

  while (files.hasNext()) {
    var file = files.next();
    Logger.log("Processing file: " + file.getName());

    var spreadsheet = SpreadsheetApp.open(file);
    var sheet = spreadsheet.getActiveSheet();
    var data = sheet.getDataRange().getValues();

    // Assuming the first row is headers and skipping it
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var employee = {
        name: row[0], // Assuming first column is employee name
        department: row[1], // Second column for department
        position: row[2] // Third column for position
        // Add more fields as necessary
      };
      employeeData.push(employee);
    }
  }

  // Now employeeData contains all the employees' details from all sheets
  Logger.log(employeeData);
  // Further processing, like saving to a database or another sheet, can be done here.
}


function getLeaveData() {
  var sheet = SpreadsheetApp.openById('1qQFFj7iRi4AFJsOKc1xpKbrenitmPD4Evi-cvgmm3UA').getSheetByName('Sheet2');
  var data = sheet.getDataRange().getValues();
  Logger.log(data); // Log the data to check if it's being fetched correctly
  data.shift(); // Remove the header row
  return data;
}

function updateLeaveStatus(rowIndex, status) {
  var sheet = SpreadsheetApp.openById('1qQFFj7iRi4AFJsOKc1xpKbrenitmPD4Evi-cvgmm3UA').getSheetByName('Sheet2'); // Replace with your sheet name
  var rowToUpdate = rowIndex + 2; // Adjust for header row
  var statusColumn = 8; // Assuming status is in the 8th column (H)
  
  // Update the status in the sheet
  sheet.getRange(rowToUpdate, statusColumn).setValue(status);
  Logger.log("Row Index: " + rowIndex);
}

function globalVariables(){ 
  var varArray = {
    spreadsheetId   : '1qQFFj7iRi4AFJsOKc1xpKbrenitmPD4Evi-cvgmm3UA', //** CHANGE !!!
    dataRage        : 'Data!A2:N',                                    //** CHANGE !!!
    idRange         : 'Data!A2:A',                                    //** CHANGE !!!
    lastCol         : 'N',                                            //** CHANGE !!!
    insertRange     : 'Data!A1:N1',                                   //** CHANGE !!!
    sheetID         : '0'                                             //** CHANGE !!! 
  };
  return varArray;
}

/**  PROCESS FORM */
function processForm(formObject){  

  /**--Execute if form passes an ID and if is an existing ID */
  if(formObject.RecId && checkID(formObject.RecId)){

    /**--Update Data */
    updateData(getFormValues(formObject),globalVariables().spreadsheetId,getRangeByID(formObject.RecId));
  }else{ 

    /**--Execute if form does not pass an ID
     **--Append Form Data */
    appendData(getFormValues(formObject),globalVariables().spreadsheetId,globalVariables().insertRange); 
  }
  
  return getAllData();
}


/**  GET FORM VALUES AS AN ARRAY */
function getFormValues(formObject){

/**  ADD OR REMOVE VARIABLES ACCORDING TO YOUR FORM */
  if(formObject.RecId && checkID(formObject.RecId)){
    var values = [[formObject.RecId.toString(),
                  formObject.name,
                  formObject.department,
                  formObject.data2,
                  formObject.ic,
                  formObject.nationality,
                  formObject.dob,
                  formObject.address,
                  formObject.age,
                  formObject.gender,
                  formObject.qualification,
                  formObject.date,
                  formObject.date1,
                  formObject.remarks]];
  }else{

    /** Reference https://webapps.stackexchange.com/a/51012/244121 */
    var values = [[new Date().getTime().toString(),
                  formObject.name,
                  formObject.department,
                  formObject.data2,
                  formObject.ic,
                  formObject.nationality,
                  formObject.dob,
                  formObject.address,
                  formObject.age,
                  formObject.gender,
                  formObject.qualification,
                  formObject.date,
                  formObject.date1,
                  formObject.remarks]];
  }
  return values;
}

/**  CREATE/ APPEND DATA */
function appendData(values, spreadsheetId,range){
  var valueRange = Sheets.newRowData();
  valueRange.values = values;
  var appendRequest = Sheets.newAppendCellsRequest();
  appendRequest.sheetID = spreadsheetId;
  appendRequest.rows = valueRange;
  var results = Sheets.Spreadsheets.Values.append(valueRange, spreadsheetId, range,{valueInputOption: "RAW"});
}


/**  READ DATA */
function readData(spreadsheetId,range){
  var result = Sheets.Spreadsheets.Values.get(spreadsheetId, range);
  return result.values;
}


/**  UPDATE DATA */
function updateData(values,spreadsheetId,range){
  var valueRange = Sheets.newValueRange();
  valueRange.values = values;
  var result = Sheets.Spreadsheets.Values.update(valueRange, spreadsheetId, range, {
  valueInputOption: "RAW"});
}


/** DELETE DATA */
function deleteData(ID){ 
  var startIndex = getRowIndexByID(ID);
  
  var deleteRange = {
                      "sheetId"     : globalVariables().sheetID,
                      "dimension"   : "ROWS",
                      "startIndex"  : startIndex,
                      "endIndex"    : startIndex+1
                    }
  
  var deleteRequest= [{"deleteDimension":{"range":deleteRange}}];
  Sheets.Spreadsheets.batchUpdate({"requests": deleteRequest}, globalVariables().spreadsheetId);
  
  return getAllData();
}


/** 
## HELPER FUNCTIONS FOR CRUD OPERATIONS --------------------------------------------------------------
*/ 


/**  CHECK FOR EXISTING ID, RETURN BOOLEAN */
function checkID(ID){
  var idList = readData(globalVariables()
  .spreadsheetId,globalVariables().idRange,)
  .reduce(function(a,b){
    return a.concat(b);
    });
  return idList.includes(ID);
}


/**  GET DATA RANGE A1 NOTATION FOR GIVEN ID */
function getRangeByID(id){
  if(id){
    var idList = readData(globalVariables().spreadsheetId,globalVariables().idRange);
    for(var i=0;i<idList.length;i++){
      if(id==idList[i][0]){
        return 'Data!A'+(i+2)+':'+globalVariables().lastCol+(i+2);
      }
    }
  }
}


/**  GET RECORD BY ID */
function getRecordById(id){
  if(id && checkID(id)){
    var result = readData(globalVariables().spreadsheetId,getRangeByID(id));
    return result;
  }
}


/**  GET ROW NUMBER FOR GIVEN ID */
function getRowIndexByID(id){
  if(id){
    var idList = readData(globalVariables().spreadsheetId,globalVariables().idRange);
    for(var i=0;i<idList.length;i++){
      if(id==idList[i][0]){
        var rowIndex = parseInt(i+1);
        return rowIndex;
      }
    }
  }
}


/**  GET ALL RECORDS */
// function getAllData(){
//   var data = readData(globalVariables().spreadsheetId,globalVariables().dataRage);
 //  return data;
//}

/**DataTable */
function getAllData() {
  var ss = SpreadsheetApp.openById('1qQFFj7iRi4AFJsOKc1xpKbrenitmPD4Evi-cvgmm3UA');
  var sheet = ss.getSheets()[0]
  var range = sheet.getDataRange()
  var values = range.getDisplayValues()
  Logger.log(values)
  return values
}
/**
## OTHER HELPERS FUNCTIONS ------------------------------------------------------------------------
*/


/** GET DROPDOWN LIST */
function getDropdownList(range){
  var list = readData(globalVariables().spreadsheetId,range);
  return list;
}

function getDepartments() {
  const spreadsheetId = '1qQFFj7iRi4AFJsOKc1xpKbrenitmPD4Evi-cvgmm3UA';
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('department');
  const data = sheet.getRange('A1:A').getValues();
  const departments = data.flat().filter(department => department);

  return departments;
}

function generateReport(reportType, department) {
  const spreadsheetId = '1qQFFj7iRi4AFJsOKc1xpKbrenitmPD4Evi-cvgmm3UA';
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Data');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  let filteredRows = rows;
  if (department !== 'all') {
    filteredRows = rows.filter(row => row[headers.indexOf('Department')] === department);
  }

  let reportData = { labels: [], values: [], label: '' };
  switch (reportType) {
    case 'employee_demographics':
      reportData = generateEmployeeDemographicsReport(filteredRows, headers);
      break;
    case 'departmental_headcount_turnover':
      reportData = generateDepartmentalHeadcountTurnoverReport(filteredRows, headers);
      break;
  }

  return reportData;
}

function generateEmployeeDemographicsReport(rows, headers) {
  const genderIndex = headers.indexOf('Gender');
  const ageIndex = headers.indexOf('Age');
  const nationalityIndex = headers.indexOf('Nationality');
  const educationIndex = headers.indexOf('Education Qualification');

  const demographics = {
    gender: { Male: 0, Female: 0 },
    age: {
      '<20': 0,
      '20-29': 0,
      '30-39': 0,
      '40-49': 0,
      '50-59': 0,
      '60+': 0
    },
    nationality: {},
    education: { Diploma: 0, Degree: 0, Masters: 0, PhD: 0 }
  };

  rows.forEach(row => {
    demographics.gender[row[genderIndex]]++;
    const age = row[ageIndex];
    if (age < 20) {
      demographics.age['<20']++;
    } else if (age < 30) {
      demographics.age['20-29']++;
    } else if (age < 40) {
      demographics.age['30-39']++;
    } else if (age < 50) {
      demographics.age['40-49']++;
    } else if (age < 60) {
      demographics.age['50-59']++;
    } else {
      demographics.age['60+']++;
    }
    const nationality = row[nationalityIndex];
    demographics.nationality[nationality] = (demographics.nationality[nationality] || 0) + 1;
    demographics.education[row[educationIndex]]++;
  });

  return {
    gender: {
      labels: Object.keys(demographics.gender),
      values: Object.values(demographics.gender),
      label: 'Gender Distribution'
    },
    age: {
      labels: Object.keys(demographics.age),
      values: Object.values(demographics.age),
      label: 'Age Distribution'
    },
    nationality: {
      labels: Object.keys(demographics.nationality),
      values: Object.values(demographics.nationality),
      label: 'Nationality Distribution'
    },
    education: {
      labels: Object.keys(demographics.education),
      values: Object.values(demographics.education),
      label: 'Education Qualification Distribution'
    }
  };
}

function generateDepartmentalHeadcountTurnoverReport(rows, headers) {
  const departmentIndex = headers.indexOf('Department');
  const leavingDateIndex = headers.indexOf('Leaving Date');
  const totalEmployees = rows.length;
  const turnoverCount = rows.filter(row => row[leavingDateIndex]).length;
  const turnoverRate = (turnoverCount / totalEmployees) * 100;
  const turnoverCategory = turnoverRate < 10 ? 'Low' : turnoverRate < 20 ? 'Medium' : 'High';

  return {
    turnover: {
      labels: ['Total Employees', 'Turnover Count', 'Turnover Rate (%)', 'Turnover Category'],
      values: [totalEmployees, turnoverCount, turnoverRate.toFixed(2), turnoverCategory],
      label: 'Departmental Headcount and Turnover'
    }
  };
}

function addNewEmployee(name, department, position) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Employees');
  sheet.appendRow([name, department, position]);
}

function addRecord(formData) {
  var sheetId = '1qQFFj7iRi4AFJsOKc1xpKbrenitmPD4Evi-cvgmm3UA';
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Data');
  sheet.appendRow([
    formData.empId,
    formData.name,
    formData.department,
    formData.designation,
    formData.nric,
    formData.nationality,
    formData.dob,
    formData.address,
    formData.age,
    formData.gender,
    formData.education,
    formData.joiningDate,
    formData.leavingDate,
    formData.remarks
  ]);
}
