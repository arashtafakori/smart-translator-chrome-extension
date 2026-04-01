let floatingButton = null;
let currentSelection = "";
let languages = null;
let sourceLang = 'auto';
let targetLang = 'en';

async function loadLanguages() {
    if (languages) return languages;
    try {
        const response = await fetch(chrome.runtime.getURL('languages.json'));
        languages = await response.json();

        // Load saved defaults from storage
        const items = await chrome.storage.sync.get({
            sourceLang: 'auto',
            targetLang: 'en'
        });
        sourceLang = items.sourceLang;
        targetLang = items.targetLang;

        return languages;
    } catch (error) {
        console.error('Error loading languages:', error);
        return { "auto": "Detected Language", "en": "English" };
    }
}

document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousedown', handleMouseDown);

function handleMouseDown(e) {
    // If clicking outside the button, remove it
    if (floatingButton && !floatingButton.contains(e.target)) {
        removeFloatingButton();
    }
}

function handleMouseUp(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText) {
        return;
    }

    // Validation: at most 2 paragraphs and less than 200 words
    const paragraphs = selectedText.split(/\n\s*\n/);
    const words = selectedText.split(/\s+/);

    if (paragraphs.length <= 2 && words.length < 200) {
        currentSelection = selectedText;
        showFloatingButton(e, selection);
    }
}

function showFloatingButton(e, selection) {
    removeFloatingButton();

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    floatingButton = document.createElement('button');
    floatingButton.className = 'gt-floating-button';
    
    // Using a simple SVG for the Google Translate icon look
    floatingButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="white" d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
        </svg>
    `;

    // Position the button at the bottom right of the selection
    const top = rect.bottom + window.scrollY + 5;
    const left = rect.right + window.scrollX - 32;

    floatingButton.style.top = `${top}px`;
    floatingButton.style.left = `${left}px`;

    floatingButton.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });

    floatingButton.addEventListener('mouseup', (e) => {
        e.stopPropagation();
    });

    floatingButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openTranslateDialog(currentSelection);
        removeFloatingButton();
    };

    document.body.appendChild(floatingButton);
}

function removeFloatingButton() {
    if (floatingButton) {
        floatingButton.remove();
        floatingButton = null;
    }
}

async function openTranslateDialog(text) {
    await loadLanguages();
    translateText(text, sourceLang, targetLang);
}

async function translateText(text, sl, tl) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const translatedText = data[0].map(item => item[0]).join('');
        showTranslationPopup(text, translatedText, sl, tl);
    } catch (error) {
        console.error('Translation error:', error);
    }
}

function showTranslationPopup(originalText, translatedText, currentSl, currentTl) {
    // Remove any existing dialog
    const existingDialog = document.querySelector('.gt-dialog-overlay');
    if (existingDialog) existingDialog.remove();

    const overlay = document.createElement('div');
    overlay.className = 'gt-dialog-overlay';

    let slOptions = '';
    let tlOptions = '';

    overlay.innerHTML = `
        <div class="gt-dialog">
            <div class="gt-dialog-header">
                <span class="gt-dialog-title">Translation</span>
                <button class="gt-close-button">&times;</button>
            </div>
            <div class="gt-language-selectors">
                <div class="gt-searchable-select" id="gt-sl-container">
                    <input type="text" class="gt-search-input" id="gt-sl-search" placeholder="Source...">
                    <div class="gt-options-list" id="gt-sl-options"></div>
                </div>
                <span class="gt-lang-arrow">→</span>
                <div class="gt-searchable-select" id="gt-tl-container">
                    <input type="text" class="gt-search-input" id="gt-tl-search" placeholder="Target...">
                    <div class="gt-options-list" id="gt-tl-options"></div>
                </div>
            </div>
            <div class="gt-translation-content">
                <div class="gt-section">
                    <div class="gt-section-label">Original</div>
                    <div class="gt-text-container" id="gt-original-text">${originalText}</div>
                </div>
                <div class="gt-section">
                    <div class="gt-section-label">Translated</div>
                    <div class="gt-text-container" id="gt-translated-text">${translatedText}</div>
                </div>
            </div>
        </div>
    `;

    overlay.querySelector('.gt-close-button').onclick = () => overlay.remove();
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };

    setupSearchableDropdown(overlay, 'sl', originalText, true);
    setupSearchableDropdown(overlay, 'tl', originalText, false);

    document.body.appendChild(overlay);
}

function setupSearchableDropdown(overlay, type, originalText, includeAuto) {
    const searchInput = overlay.querySelector(`#gt-${type}-search`);
    const optionsList = overlay.querySelector(`#gt-${type}-options`);
    const currentLang = type === 'sl' ? sourceLang : targetLang;

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
            item.className = 'gt-option-item' + (code === (type === 'sl' ? sourceLang : targetLang) ? ' selected' : '');
            item.textContent = name;
            item.onclick = (e) => {
                e.stopPropagation();
                searchInput.value = name;
                if (type === 'sl') sourceLang = code;
                else targetLang = code;
                optionsList.style.display = 'none';
                translateText(originalText, sourceLang, targetLang);
                updateOptions(); // Refresh selected state
            };
            optionsList.appendChild(item);
        });
    };

    searchInput.onfocus = () => {
        optionsList.style.display = 'block';
        updateOptions('');
    };

    searchInput.oninput = () => {
        updateOptions(searchInput.value);
    };

    searchInput.onclick = (e) => e.stopPropagation();

    document.addEventListener('click', function closeDropdown(e) {
        if (!overlay.contains(e.target) || !e.target.closest(`#gt-${type}-container`)) {
            optionsList.style.display = 'none';
            const currentName = languages[type === 'sl' ? sourceLang : targetLang];
            if (searchInput.value !== currentName) {
                searchInput.value = currentName;
            }
            if (!overlay.isConnected) {
                document.removeEventListener('click', closeDropdown);
            }
        }
    });
}
