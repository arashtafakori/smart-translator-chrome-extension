chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

// The openTranslate logic is now handled in content.js directly via fetch and HTML injection.
// This background script remains for future background tasks or options management.
