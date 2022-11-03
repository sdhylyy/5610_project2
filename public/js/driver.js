//const deployURL="http://localhost:3000/";
const deployURL="https://intense-lowlands-69751.herokuapp.com/";

//I really like your naming conventions with the variables
const rowSelectColor = '#F5F5F5';
const rowClearColor = 'white';
const getByNameURL = deployURL+'api/getByName/';
const uploadURL=deployURL+'api/upload/';
const downloadURL=deployURL+'api/download';
const logoutURL=deployURL+'api/logout';

let selectedRowIx;
let prevSelection;
let table;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

function checkMsg(){
    let msg=urlParams.get("msg");
    if(msg){
        alert(msg);
    }
}

/* Functions */

window.onload = () => {
  checkMsg();
  document.getElementById('status').innerHTML = 'Fetching data...';
  table = document.getElementById('data-table');
  loadData();
};

/*
 * Routine to get all the database rows and populate the HTML table.
 * Makes the get request using the fetch API.
 * The response from the fetch has the data.
 */
function loadData() {
  fetch(getByNameURL,{redirect: 'follow'})
  .then((res) => {
    console.log(res);
    if(res.redirected){
      window.location.href=res.url;
    }else if (res.ok) {
      return res.json();
    } else {
      return res.text().then((text) => {
        throw new Error(text);
      });
    }
  })
  .then((docs) => {
    buildTable(docs);
    return docs.length;
  })
  .then((n) => {
    document.getElementById('status').innerHTML = 'Loaded ' + n + ' row(s)!';
  }).catch((error) => {
    console.error(error);
    const msg =
      'Error: ' +
      error.message +
      '. ' +
      'The web server or database may not have started. ' +
      "See browser's console for more details.";
    document.getElementById('status').innerHTML = msg;
  });
}

function buildTable(data) {
    console.log(data);
    data.forEach((doc) => addToTable(doc));
  }
  
  function addToTable(doc) {
    selectedRowIx = table.rows.length;
    const row = table.insertRow(selectedRowIx);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    const cell5 = row.insertCell(3);
    const cell4 = row.insertCell(4);
  
    cell1.innerHTML = doc.name;
    cell2.innerHTML = doc.trackingid;
  
    if(doc.bol&&doc.bol!=""){
        cell3.innerHTML="<img src='./style/images/download.png' class='download-icon' onclick='download(\""+doc.bol+"\")'/>";
    }
    cell4.innerHTML = "<input type='hidden' value=" + doc._id + '>';
    cell5.innerHTML =
      "<input type='radio' name='select' onclick='selectRow(this)' checked>";
    cell5.className = 'tradio';
  }
  
  function selectRow(obj) {
    const row = obj
      ? obj.parentElement.parentElement
      : table.rows[table.rows.length - 1];
    selectedRowIx = row.rowIndex;
  
    if (obj) {
      document.getElementById('status').innerHTML =
        'Selected row ' + selectedRowIx;
    }
  
    setSelection(row);
  }
  
  function setSelection(row) {
    document.getElementById('name').value = row.cells.item(0).innerHTML;
    document.getElementById('trackingid').value = row.cells.item(1).innerHTML;
    row.style.backgroundColor = rowSelectColor;
  
    if (prevSelection && prevSelection !== selectedRowIx) {
      table.rows[prevSelection].style.backgroundColor = rowClearColor;
    }
  
    prevSelection = selectedRowIx;
  }
  
  function scrollToSelection() {
    const ele = document.getElementById('table-wrapper');
    const bucketHt = ele.clientHeight;
    const itemHt = ele.scrollHeight / table.rows.length;
    const noItemsInBucket = parseInt(bucketHt / itemHt);
    const targetBucket = (selectedRowIx + 1) / noItemsInBucket;
    const scrollPos = bucketHt * (targetBucket - 1) + bucketHt / 2;
    ele.scrollTop = Math.round(scrollPos);
  }
  
  /*
   * Routine for selecting the first or the last row of the HTML table
   * (depending upon the parameter "n" - the value 1 for selecting the first
   * row, otherwise the last one).
   */
  function selectTopOrBottomRow(n) {
    if (table.rows.length < 2) {
      document.getElementById('status').innerHTML = 'No data in table!';
      return;
    }
  
    selectedRowIx = n === 1 ? 1 : table.rows.length - 1;
  
    const row = table.rows[selectedRowIx];
    setSelection(row);
    document.getElementById('status').innerHTML = 'Selected row ' + selectedRowIx;
    row.cells[2].children[0].checked = true;
    scrollToSelection();
  }

  function checkUploadForm(){
    let id = table.rows[selectedRowIx].cells.item(4).firstChild.value;
    document.getElementById("upload-form").action =uploadURL+id;
    return true;
  }

  function download(path){
    console.log(path);
    fetch(downloadURL+"?fileName="+path)
    .then(res => res.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
    
        let a = document.createElement('a');
        a.download = path;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove(); // document.body.removeChild(a)
    })
    .catch((error) => {
      console.error(error);
      const msg =
        'Error: ' +
        error.message 
      document.getElementById('status').innerHTML = msg;
    });
  }
  
  function logout(){
    fetch(logoutURL,{redirect: 'follow'})
    .then((res) => {
      console.log(res);
      if(res.redirected){
        window.location.href=res.url;
      }
    })
    .catch((error) => {
      console.error(error);
      const msg =
        'Error: ' +
        error.message +
        '. ' +
        'The web server or database may not have started. ' +
        "See browser's console for more details.";
      document.getElementById('status').innerHTML = msg;
    });
  }
// Nice work, and nice error handling
