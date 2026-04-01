// Load languages and settings
async function initOptions() {
    try {
        const response = await fetch(chrome.runtime.getURL('languages.json'));
        const languages = await response.json();
        
        const sourceSelect = document.getElementById('default-source-lang');
        const targetSelect = document.getElementById('default-target-lang');

        // Populate dropdowns
        for (const [code, name] of Object.entries(languages)) {
            const sourceOption = new Option(name, code);
            sourceSelect.add(sourceOption);

            if (code !== 'auto') {
                const targetOption = new Option(name, code);
                targetSelect.add(targetOption);
            }
        }

        // Restore saved settings
        chrome.storage.sync.get({
            sourceLang: 'auto',
            targetLang: 'en'
        }, (items) => {
            sourceSelect.value = items.sourceLang;
            targetSelect.value = items.targetLang;
        });

        // Add event listeners
        sourceSelect.addEventListener('change', saveOptions);
        targetSelect.addEventListener('change', saveOptions);

    } catch (error) {
        console.error('Error initializing options:', error);
    }
}

// Save settings to chrome.storage
function saveOptions() {
    const sourceLang = document.getElementById('default-source-lang').value;
    const targetLang = document.getElementById('default-target-lang').value;

    chrome.storage.sync.set({
        sourceLang: sourceLang,
        targetLang: targetLang
    }, () => {
        const status = document.getElementById('status');
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 1500);
    });
}

document.addEventListener('DOMContentLoaded', initOptions);
