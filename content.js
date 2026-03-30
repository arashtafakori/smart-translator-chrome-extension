let floatingButton = null;
let currentSelection = "";

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

function openTranslateDialog(text) {
    const encodedText = encodeURIComponent(text);
    const translateUrl = `https://translate.google.com/?sl=auto&tl=en&text=${encodedText}&op=translate`;
    window.open(translateUrl, 'GoogleTranslate', 'width=800,height=600,top=100,left=100');
}
