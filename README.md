# Quick Google Translator & Smart Word Repository

A Chrome extension that provides instant Google Translate access for selected text and serves as a smart repository for saving words and expressions for future practice.

## Features

- **Instant Translation**: Select any text on a webpage and click the floating Google Translate icon to get an immediate translation.
- **Smart Repository**: Save words and expressions you encounter to your personal repository.
- **Word Practicing**: Use your saved collection as a study tool to practice and reinforce new vocabulary.
- **Lightweight & Fast**: Minimal impact on browser performance.

## Installation

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the extension folder.

## How to Use

1. **Translate**: Highlight any text (up to 2 paragraphs or 200 words) on any website. A floating Google Translate icon will appear near your selection. Click it to open the translation.
2. **Save & Practice**: (Coming Soon) Use the extension popup to manage your saved words and start practice sessions.

## Project Structure

- `manifest.json`: Extension configuration and permissions.
- `content.js`: Handles text selection, floating button logic, and translation triggers.
- `styles.css`: Styling for the floating button and UI elements.

## Future Roadmap

- [ ] Implementation of the local storage for saved words.
- [ ] Popup interface for viewing and managing the word repository.
- [ ] Flashcard-style practice mode for saved expressions.
- [ ] Support for multiple target languages.

## License

MIT
