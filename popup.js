document.getElementById('extractButton').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'storeTableData' }, function(response) {
          console.log(response);
      });
  });
});

document.getElementById('downloadButton').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'downloadAllStoredData' }, function(response) {
          console.log(response);
      });
  });
});
