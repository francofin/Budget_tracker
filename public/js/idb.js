const indexedDB = 
windows.indexedDB ||
window.mozIndexedDB ||
window.webkitIndexedDB ||
window.msIndexedDB ||
window.shimIndexedDB;


let db;
const request = indexedDB.open('budget', 1);


// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = ( { target }) => {
    // save a reference to the database 
    const db = target.result;
    db.createObjectStore("newitem", {autoIncrement: true});
};

request.onsuccess = ({target}) => {
        db = target.result;
    // check if app is online, if yes run checkDatabase function to send all local db data to api
    if(navigator.online) {
        verifyDatabase();
    }
};

request.onerror = function(event) {
    console.log("Sorry no page found "+ event.target.errorCode);
};




// This function will be executed if we attempt to submit a new item and there's no internet connection
function saveRecord(item) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(["newitem"], 'readwrite');

     // access the object store for `newitem`
    const itemObjectStore = transaction.objectStore('newitem');

     // add record to your store with add method
    itemObjectStore.add(item);

};

function verifyDatabase() {
    // open a transaction on your db
    const transaction = db.transaction(['newitem'], 'readwrite');

     // access the object store for `new_item`
     const itemObjectStore = transaction.objectStore('newitem');

     // get all records from store and set to a variable
     const getAll = itemObjectStore.getAll();

     getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
              method: 'POST',
              body: JSON.stringify(getAll.result),
              headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              }
            })
              .then(response => response.json())
              .then(serverResponse => {
                if (serverResponse.message) {
                  throw new Error(serverResponse);
                }
                // open one more transaction
                const transaction = db.transaction(['newitem'], 'readwrite');
                // access the new_pizza object store
                const itemObjectStore = transaction.objectStore('newitem');
                // clear all items in your store
                itemObjectStore.clear();
  
                alert('All saved budget items have been submitted!');
              })
              .catch(err => {
                console.log(err);
              });
          }
        };
};

// listen for app coming back online
window.addEventListener('online', verifyDatabase);