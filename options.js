let languages = {};
let currentSourceLang = 'auto';
let currentTargetLang = 'en';

// Load languages and settings
async function initOptions() {
    try {
        const response = await fetch(chrome.runtime.getURL('languages.json'));
        languages = await response.json();
        
        // Restore saved settings
        const items = await chrome.storage.sync.get({
            sourceLang: 'auto',
            targetLang: 'en'
        });
        
        currentSourceLang = items.sourceLang;
        currentTargetLang = items.targetLang;

        setupSearchableDropdown('source', true);
        setupSearchableDropdown('target', false);

    } catch (error) {
        console.error('Error initializing options:', error);
    }
}

function setupSearchableDropdown(type, includeAuto) {
    const searchInput = document.getElementById(`${type}-search`);
    const optionsList = document.getElementById(`${type}-options`);
    const currentLang = type === 'source' ? currentSourceLang : currentTargetLang;

    // Set initial value
    searchInput.value = languages[currentLang] || '';

    const updateOptions = (filter = '') => {
        optionsList.innerHTML = '';
        const lowerFilter = filter.toLowerCase();
        const filtered = Object.entries(languages).filter(([code, name]) => {
            if (!includeAuto && code === 'auto') return false;
            return name.toLowerCase().includes(lowerFilter);
        });

        filtered.forEach(([code, name]) => {
            const item = document.createElement('div');
            item.className = 'gt-option-item' + (code === (type === 'source' ? currentSourceLang : currentTargetLang) ? ' selected' : '');
            item.textContent = name;
            item.onclick = () => {
                searchInput.value = name;
                if (type === 'source') currentSourceLang = code;
                else currentTargetLang = code;
                optionsList.style.display = 'none';
                saveOptions();
                updateOptions(); // Refresh selected state
            };
            optionsList.appendChild(item);
        });
    };

    searchInput.onfocus = () => {
        optionsList.style.display = 'block';
        updateOptions(searchInput.value === languages[type === 'source' ? currentSourceLang : currentTargetLang] ? '' : searchInput.value);
    };

    searchInput.oninput = () => {
        updateOptions(searchInput.value);
    };

    document.addEventListener('click', (e) => {
        if (!e.target.closest(`#${type}-lang-container`)) {
            optionsList.style.display = 'none';
            // Reset to current selection if input is empty or invalid
            const currentName = languages[type === 'source' ? currentSourceLang : currentTargetLang];
            if (searchInput.value !== currentName) {
                searchInput.value = currentName;
            }
        }
    });
}

// Save settings to chrome.storage
function saveOptions() {
    chrome.storage.sync.set({
        sourceLang: currentSourceLang,
        targetLang: currentTargetLang
    }, () => {
        const status = document.getElementById('status');
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 1500);
    });
}

document.addEventListener('DOMContentLoaded', initOptions);
