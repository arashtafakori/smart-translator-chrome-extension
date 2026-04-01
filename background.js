let translateWindowId = null;

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openTranslate') {
        handleOpenTranslate(request.url);
    }
});

// Also listen for window closure to reset translateWindowId
chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === translateWindowId) {
        translateWindowId = null;
    }
});

async function handleOpenTranslate(url) {
    const { popupBehavior = 'reuse' } = await chrome.storage.sync.get('popupBehavior');

    if (popupBehavior === 'reuse' && translateWindowId !== null) {
        try {
            // Check if window still exists
            const win = await chrome.windows.get(translateWindowId);
            if (win) {
                // Update the tab in that window
                const tabs = await chrome.tabs.query({ windowId: translateWindowId });
                if (tabs.length > 0) {
                    await chrome.tabs.update(tabs[0].id, { url: url, active: true });
                    await chrome.windows.update(translateWindowId, { focused: true });
                    return;
                }
            }
        } catch (e) {
            // Window doesn't exist anymore
            translateWindowId = null;
        }
    }

    // Create new window
    const window = await chrome.windows.create({
        url: url,
        type: 'popup',
        width: 800,
        height: 600,
        top: 100,
        left: 100
    });

    if (popupBehavior === 'reuse') {
        translateWindowId = window.id;
    }
}
