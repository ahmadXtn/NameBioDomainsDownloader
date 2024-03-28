// Open or create a database
var request = indexedDB.open('tableDataDB', 1);
var db;

request.onerror = function(event) {
    console.error("Database error: " + event.target.errorCode);
};

request.onsuccess = function(event) {
    db = event.target.result;
};

request.onupgradeneeded = function(event) {
    db = event.target.result;

    // Create an object store to store the data
    var objectStore = db.createObjectStore("tableData", { keyPath: "id", autoIncrement: true });

    // Define the structure of the data
    objectStore.createIndex("domain", "domain", { unique: false });
    objectStore.createIndex("date", "date", { unique: false });
    objectStore.createIndex("venue", "venue", { unique: false });
};

// Function to store table data including headers
function storeTableData() {
    // Start a new transaction
    var transaction = db.transaction(["tableData"], "readwrite");
    var objectStore = transaction.objectStore("tableData");

    // Get table data rows
    var rows = document.querySelectorAll("table tbody tr");
    rows.forEach(function(row) {
        var rowData = {
            domain: row.cells[0].innerText.trim(),
            date: row.cells[2].innerText.trim(),
            venue: row.cells[3].innerText.trim()
        };
        objectStore.add(rowData);
    });
}

// Function to delete all records from the object store
function clearStoredData() {
    var transaction = db.transaction(["tableData"], "readwrite");
    var objectStore = transaction.objectStore("tableData");
    var clearRequest = objectStore.clear();

    clearRequest.onsuccess = function(event) {
        console.log("Stored data cleared successfully");
    };

    clearRequest.onerror = function(event) {
        console.error("Error clearing stored data");
    };
}

// Function to download all stored data as a CSV file
function downloadAllStoredDataAsCSV() {
    var csv = '';

    // Start a new transaction
    var transaction = db.transaction(["tableData"], "readonly");
    var objectStore = transaction.objectStore("tableData");

    // Add headers to CSV
    var headers = ["Domain", "Date", "Venue"];
    csv += headers.join(',') + '\n';

    // Iterate through stored data and append to CSV
    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            csv += '"' + cursor.value.domain + '","' + cursor.value.date + '","' + cursor.value.venue + '"\n';
            cursor.continue();
        } else {
            // Download the CSV file
            var filename = 'all_stored_data.csv';
            downloadCSV(csv, filename);
            // Clear stored data after download
            clearStoredData();
        }
    };
}

// Function to download CSV file
function downloadCSV(csv, filename) {
    var csvFile = new Blob([csv], { type: "text/csv" });
    var downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

// Function to handle messages from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'storeTableData') {
        storeTableData();
        sendResponse({ status: 'success', message: 'Table data stored successfully' });
    } else if (request.action === 'downloadAllStoredData') {
        downloadAllStoredDataAsCSV();
        sendResponse({ status: 'success', message: 'All stored data downloaded successfully' });
    }
});
