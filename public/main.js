//callback function after page is loaded

window.onload = insertElemsAndEves;
//DOM Elements
const dateEntry = document.getElementById('dateEntry');
const cover = document.getElementById("cover");
const navChild = document.getElementsByTagName('nav')[0].getElementsByTagName('div');

//Variables Declaration
let upcomingList = [];
const TICK = 'fa-check-circle';
const UNTICK = 'fa-circle-thin';
const CROSSED = 'line-through';
const UPARROW = 'fa-chevron-up';
const DOWNARROW = 'fa-chevron-down';
const WITHLINE = 'line-through';
const NOLINE   = 'no-line';

// Display Today Date
const today = new Date();
const date = today.getFullYear() + "-" + ("0"+(today.getMonth()+1)).slice(-2) +"-"+("0" + today.getDate()).slice(-2);

function dateConverter(arg){
  let options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  let date = new Date(arg);
  return date.toLocaleDateString('en-UK', options);
}

function getAllTodo(){
  document.getElementById('loader').style.display = 'block';
  fetch('http://localhost:9000/list')
  .then(response => response.json())
  .then(response => displayTodayTodo(response));      
    
}
function assignValue(DATE) {
  let data = {listItem: [], exist: false}
  upcomingList.forEach(element => {
   if (element.date === DATE) {
    data.listItem = JSON.parse(element.todoList); 
    data.exist = true;
  }
   
 })
 return data;
 
}
function countTotalItem(LISTITEM){
  let num = LISTITEM.length;
  LISTITEM.forEach(element => {
    if(element.bin || element.done){
      num--;
    }
  });
  return num;
}

/*Total no. of tasks */
function insertSpanValue(TASKLIST, NUM){
  let spanElem = TASKLIST.parentNode.previousElementSibling.getElementsByTagName('span')[0];
  let spanElemValue = Number(spanElem.innerHTML);
  spanElem.innerHTML = spanElemValue + NUM;
}

function checkKey(event){
  event.preventDefault();
 if (event.keyCode === 13) {
   event.target.nextElementSibling.click();
 }
}
function addItem(DATE){
  let TASK = event.target.parentNode.querySelector('.task');
  if(!TASK.value){return;}
  let DATA = assignValue(DATE);
  let LISTITEM = DATA.listItem;
  let NUM = LISTITEM.length;
  let item = {
    'id': NUM,
    'task': TASK.value,
    'done': false,
    'line': false,
    'bin': false
  };
  TASK.value="";
  LISTITEM.push(item);
  let TASKLIST = event.target.parentNode.parentNode.querySelector('.taskList');
  if (TASKLIST.firstElementChild.tagName === 'DIV') {TASKLIST.innerHTML = ''};
  insertSpanValue(TASKLIST, 1);
  showList(item.task,item.id, UNTICK, NOLINE, TASKLIST, DATE);
  DATA.exist?  updateRequest(DATE,LISTITEM):postRequest(DATE,LISTITEM);
}
      
// Display items when added or page is loaded
function showList(TODO, ID ,STATUS, STATUS1, TASKLIST, DATE){
 const position = 'beforeend';
 let text = `<li class="item">
                          
                             <i class="fa ${STATUS} co" onclick="change('${DATE}')" id=${ID} job="check"></i>
                            
                             <p class="text ${STATUS1}">${TODO}</p> 
                             <div class="actions">
                               
                                 <i title="EDIT" class="fa fa-pencil ed" id=${ID} onclick="change('${DATE}')" job="amend"></i>                 
                                 <i title="DELETE" class="fa fa-trash-o de" id=${ID} onclick="change('${DATE}')" job="delete"></i>
                              
                             </div>
            </li>`;
 TASKLIST.insertAdjacentHTML(position, text);

}

// Check or uncheck task or delete jobs
function change(DATE){
  let LISTITEM = assignValue(DATE).listItem;
  if(event.target.getAttribute('job') === 'check') {
    event.target.classList.toggle(UNTICK);
    event.target.classList.toggle(TICK);
    if(event.target.classList.contains('fa-check-circle')){
      insertSpanValue(event.target.parentNode.parentNode, -1);
    } else {
      insertSpanValue(event.target.parentNode.parentNode, 1);
    }
    event.target.parentNode.querySelector('.text').classList.toggle(WITHLINE);
    event.target.parentNode.querySelector('.text').classList.toggle(NOLINE);
    changeState(LISTITEM, DATE, event.target.id,'done');

  } else if (event.target.getAttribute('job') === 'delete') {
    if(!event.target.parentNode.parentNode.firstElementChild.classList.contains('fa-check-circle')){
      insertSpanValue(event.target.parentNode.parentNode.parentNode, -1);
    } 
    event.target.parentNode.parentNode.style.display = 'none';
    changeState(LISTITEM, DATE, event.target.id,'bin');
  } else if(event.target.getAttribute('job') === 'amend') {
    let element = event.target.parentNode.parentNode.querySelector('.text');
    let presentVal = element.innerText;
    element.innerHTML = `<input type="text" id="newValue" onkeyup="checkKey(event)" value='${presentVal}' autofocus> <button onclick="saveChanges('${DATE}','${event.target.id}')">Save</button> <button onclick="saveChanges()">Cancel</button>`;
  }
}  
// Function Edit 
  function saveChanges(DATE,ID){
    let element = event.target.parentNode;
    let newValue = document.getElementById('newValue').value;
    element.innerHTML = newValue;
    let LISTITEM = assignValue(DATE).listItem;
    LISTITEM.forEach(element => {
      if(element.id == ID) {
        element.task = newValue; 
      }
     });
   updateRequest(DATE,LISTITEM);
  }
// Change status of Done and Bin true to false of vice versa  
   function changeState(LISTITEM,DATE,ID, PROP){
      LISTITEM.forEach(element => {
           if(element.id == ID) {
             let STATE = element[PROP]? false:true;
             element[PROP] = STATE; 
             if(PROP === 'done'){
              let STATE = element.line? false:true;
             element['line'] = STATE;
             }
           }
          });
        updateRequest(DATE,LISTITEM);
        } 
                  
// Function to make GET REQUEST
function insertElemsAndEves(){
  let content = `<div class="header">
                   <div class="header1">
                     <h2><i class="fa fa-star"></i> TODAY</h2>
                    <div>
                      <i title="RESET" class="fa fa-refresh fa-2x"  onclick="reset('${date}')"></i>
                     </div>
                   </div>
                  <div class="dateDisplay">${dateConverter(date)} <span class="totalItem">0</span></div>  
                 </div>
                <div class="content">
                   <ul class="taskList"></ul>
                   <div class="add-item">
                      <input type="text" class='task' onkeyup="checkKey(event)" placeholder="----- Add a Todo! -----">
                      <i class="fa fa-plus-circle fa-lg" time="today"  onclick="addItem('${date}')"></i>
                      <div id="menu">
                      
                                     <div class='dropdown-content'>
                                     <a onclick="showAllTodo()">Upcoming</a>
                                     <a onclick="showItems('GROCERY','Groceries','Shopping item/s')">Grocery</a>
                                     <a onclick="showItems('MOVIES','Movies','must see Movies!')">Movies</a>
                                     <a onclick="showDateEntryForm()">Add a NewTask</a>
                                     </div> 
                                     <button><i class="fa fa-bars fa-2x"></i></button>          
                      </div>
                   </div>
                </div>`;
  document.getElementsByTagName('section')[0].insertAdjacentHTML('beforeend', content);
                    for (let i = 1; i < navChild.length-1; i++) {
                      navChild[i].addEventListener("mouseover", function(){
                        navChild[i].style.backgroundColor = "lightblue";
                        navChild[i].getElementsByTagName('i')[0].style.backgroundColor = "lightblue";
                     });
                     navChild[i].addEventListener("mouseout", function(){
                      navChild[i].style.backgroundColor = "";
                      navChild[i].getElementsByTagName('i')[0].style.backgroundColor = "";
                   });
                    }
  
                    getAllTodo();
 }
//function to display data from mongodb
function displayTodayTodo(TODAYTODO){
  document.getElementById('loader').style.display = 'none';
  upcomingList = TODAYTODO;
  let otherDayTodos = 0;
  let TASKLIST = document.getElementsByTagName('section')[0].querySelector('.content').querySelector('.taskList');
  if(upcomingList.length === 0){
     TASKLIST.insertAdjacentHTML('beforeEnd','<div class="emptyDiv">Taskbox is Empty!!</div>');
     
  } else {
    upcomingList.forEach(element => {
     if (element.date === date) {
       TASKLIST.innerHTML = '';
        secondStep(element,TASKLIST, date);
     } else if(element.date === 'GROCERY') {
      document.getElementById('grocery').querySelector('.totalItem').innerHTML = countTotalItem(JSON.parse(element.todoList)) ;
     } else if(element.date === 'MOVIES'){
      document.getElementById('movie').querySelector('.totalItem').innerHTML = countTotalItem(JSON.parse(element.todoList));
     } else {
       otherDayTodos++;
     }
    })
    if(TASKLIST.innerHTML === '') {
      TASKLIST.insertAdjacentHTML('beforeEnd','<div class="emptyDiv">TaskBox is empty!!</div>');
    };
  }
  document.getElementById('upcoming').querySelector('.totalItem').innerHTML = otherDayTodos;
}


function secondStep(ELEMENT, TASKLIST, DATE){
  let LISTITEM = JSON.parse(ELEMENT.todoList);
  let totalItem = countTotalItem(LISTITEM);
  TASKLIST.parentNode.parentNode.querySelector('.dateDisplay').querySelector('.totalItem').innerHTML=totalItem;
  let num = LISTITEM.length;
   if(num === 0) {
    TASKLIST.insertAdjacentHTML('beforeEnd','<div class="emptyDiv">TaskBox is Empty!!</div>');
    } else {
    LISTITEM.forEach(element => {
      if(element.bin) {return;}
        let DONE = element.done? TICK:UNTICK;
        let LINE = element.line? WITHLINE:NOLINE;
        showList(element.task,element.id,DONE,LINE,TASKLIST,DATE);
    })
    }
     
}

// Function to make POST request
function postRequest(DATE,LISTITEM){

  let task1 = JSON.stringify(LISTITEM);

  fetch('http://localhost:9000/add',{
     method: 'POST',
     headers: {"Content-Type": "application/json"},
     body: JSON.stringify({'date': DATE, 'todoList': task1})
   })
   .then(response => response.json())
   .then(response => {
     console.log(response)
     getAllTodo();
    }); 
  
}
// function to make UPDATE request
function updateRequest(DATE,LISTITEM){
                                     let task1 = JSON.stringify(LISTITEM);
                                     fetch('http://localhost:9000/change',{
                                     method: 'PUT',
                                     headers: {"Content-Type": "application/json"},
                                     body: JSON.stringify({'date': DATE, 'todoList': task1})
                                          }).then(res => {
                                                          if (res.ok) return res.json()
                                                          })
                                                            .then(response => {
                                                             console.log(response);
                                                             getAllTodo(); 
                                                          });
                                                      
}

// Function to Create Upcoming TODOs
function showDateEntryForm() {
                     cover.innerHTML = '';
                     cover.style.display = 'block';
                     let text = `<div class="clearfix"> <i class="fa fa-close fa-2x" style="float:right" onclick="cancel('addlist')" ></i><h3 style="text-align:center">SELECT A DATE</h3></div>`;
                     cover.insertAdjacentHTML('afterbegin',text);
                     dateEntry.style.display = 'block';
                    }
function showTaskEntryForm(){
  event.preventDefault();
  let date1 = document.getElementById('date').value;
  let dateSet = date1.split('-')[0] + ',' + (date1.split('-')[1]) + ',' + date1.split('-')[2];
  document.getElementById('date').value = "";
  dateEntry.style.display = 'none';
  cover.innerHTML = '';
  cover.style.display = 'block';
  let text = `<div class="clearfix"> <i class="fa fa-close fa-2x" style="float:right" onclick="cancel('addlist')" ></i><h3 style="text-align:center">ADD TASK/s</h3></div>`;
  cover.insertAdjacentHTML('afterbegin',text);
  let content = contentHTML(date1,dateConverter(dateSet),'Task/s');
  cover.insertAdjacentHTML('beforeend',content);          
                
                }

// NAV UPCOMING FIRST STAGE  
function showAllTodo() { 
  cover.style.display = 'block';
  cover.innerHTML = '';
  let text = `<div class="clearfix"><i class="fa fa-close fa-2x" style="float:right" onclick="cancel('showlist')" ></i><h3 style="text-align:center">UPCOMING</h3></div>`;
  cover.insertAdjacentHTML('afterbegin',text);
  if(upcomingList.length === 0 || document.getElementById('upcoming').querySelector('.totalItem').innerHTML == 0){
    cover.insertAdjacentHTML('beforeend','<div class="emptyDiv">No Upcoming ToDos</div>');
  } else {
   upcomingList.forEach((element,INDEX) => {
     if(element.date != date && element.date != 'GROCERY' && element.date != 'MOVIES') {
       displayUpcoming(INDEX,element.date);
     } 
  })
 }
}
function displayUpcoming(INDEX,DATE){
  let LISTITEM = JSON.parse(upcomingList[INDEX].todoList);
  let NUM = countTotalItem(LISTITEM);
  let DATE1 = dateConverter(DATE);
  const position = 'beforeend';
  let CONTENT = `<div class="taskEntry">
                     <div class="header header1">
                        <div class='dateDisplay'>${DATE1} <span class="totalItem">${NUM}</span></div>  
                        <div>
                             <i class="fa fa-chevron-down" onclick="showTask(${INDEX},'${DATE}')"></i>
                             <i class="fa fa-trash-o" onclick="erase(${INDEX},'${DATE}')"></i>
                             <i title="RESET" class="fa fa-refresh fa-2x"  onclick="reset('${DATE}')"></i>
                        </div>
                     </div>
                     <div class="content" style="display:none"> 
                         <ul class="taskList"></ul>
                         <div class="add-item">
                          <input type="text" class='task' onkeyup="checkKey(event)" placeholder="Add a Todo!">
                           <i class="fa fa-plus-circle fa-lg" time="future" onclick="addItem('${DATE}')"></i>
    
                         </div>
                     </div>
                
                 </div>`;

   cover.insertAdjacentHTML(position, CONTENT);
  };
//CHEVRON-DOWN/UP NAV UPCOMING SECOND STATE
const showTask = (function(){
  let DISPLAYLIST, TARGET, DISPLAYCONTENT;
  return function(INDEX,DATE){
         if(DISPLAYLIST){
             DISPLAYCONTENT.style.display = 'none';
             TARGET.classList.toggle(DOWNARROW);
             TARGET.classList.toggle(UPARROW);
             DISPLAYLIST.innerHTML ='';
       }
       if(TARGET === event.target) {
          TARGET = '';
          DISPLAYLIST = '';
          return;
       }
       DISPLAYCONTENT = event.target.parentNode.parentNode.parentNode.querySelector('.content');
       DISPLAYLIST = event.target.parentNode.parentNode.nextElementSibling.querySelector('.taskList');
       TARGET = event.target;
       TARGET.classList.toggle(DOWNARROW);
       TARGET.classList.toggle(UPARROW);
       
       DISPLAYCONTENT.style.display = 'block';
       secondStep(upcomingList[INDEX], DISPLAYLIST, DATE);
       if(DISPLAYLIST.innerHTML === '') {
        DISPLAYLIST.insertAdjacentHTML('beforeEnd','<div class="emptyDiv">TaskBox is Empty!!</div>');
      }


  }
})();

// Function to reset main screen for today
function reset(DATE){
  let TASKLIST = (DATE === date)? event.target.parentNode.parentNode.parentNode.nextElementSibling.querySelector('.taskList'):event.target.parentNode.parentNode.nextElementSibling.querySelector('.taskList')
  TASKLIST.innerHTML = '<div class="emptyDiv">TaskBox is Empty!!</div>';
  TASKLIST.parentNode.previousElementSibling.getElementsByTagName('span')[0].innerHTML = 0;
  let LISTITEM = [];
  updateRequest(DATE,LISTITEM);
}
// Delete upcoming Task
function erase(INDEX,DATE){
  upcomingList.splice(INDEX,1);
 
    fetch('http://localhost:9000/remove',{
      method: 'DELETE',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({'date': DATE})
    }).then(res => {
      if (res.ok) return res.json()
    })
    .then(response => {
      console.log(response);
      getAllTodo();
    });
    
    showAllTodo();
}
//Function to close Dialogue Box after adding task, cancel, close 
function cancel(para){
  if(!para){
    document.getElementById('date').value = '';
  }
  cover.innerHTML = '';
  dateEntry.style.display = 'none';
  cover.style.display = 'none';
}


function showItems(TERM,TERM1,ITEM){
  cover.innerHTML = '';
  cover.style.display = 'block';
  let text = `<div class="clearfix"> <i class="fa fa-close fa-2x" style="float:right" onclick="cancel('addlist')" ></i><h3 style="text-align:center">ADD ${TERM}/s</h3></div>`;
  cover.insertAdjacentHTML('afterbegin',text);
  let content = contentHTML(TERM,TERM1,ITEM);
  cover.insertAdjacentHTML('beforeend',content);
  let TASKLIST = cover.querySelector('.taskList');
  upcomingList.forEach(element => {
    if(element.date === TERM) {
      TASKLIST.innerHTML='';
      secondStep(element,TASKLIST,TERM)
    }
  })
}

function contentHTML(TERM,TERM1,ITEM){
  return `<div class='taskEntry'>
  <div class="header header1">
    <div class="dateDisplay"><b>${TERM1}</b> <span class="totalItem">0</span></div>
    <div><i title="RESET" class="fa fa-refresh fa-2x"  onclick="reset('${TERM}')"></i></div>
  </div>
  <div class="content">
  <ul class="taskList">
    <div class="emptyDiv">Add ${ITEM}</div>
  </ul>
  <div class="add-item">
     <input type="text" class='task' onkeyup="checkKey(event)" placeholder="Add ${ITEM}!">
     <i class="fa fa-plus-circle fa-lg" onclick="addItem('${TERM}')"></i>
  </div>
  </div>`
}