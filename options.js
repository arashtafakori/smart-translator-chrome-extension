// Save settings to chrome.storage
function saveOptions() {
    const behavior = document.getElementById('popup-behavior').value;
    chrome.storage.sync.set({
        popupBehavior: behavior
    }, () => {
        const status = document.getElementById('status');
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 1500);
    });
}

// Restore settings from chrome.storage
function restoreOptions() {
    chrome.storage.sync.get({
        popupBehavior: 'reuse' // Default value
    }, (items) => {
        document.getElementById('popup-behavior').value = items.popupBehavior;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('popup-behavior').addEventListener('change', saveOptions);
