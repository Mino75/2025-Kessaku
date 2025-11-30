// styles.js - Mobile-first minimalist dark theme CSS
const styles = `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}

:root {
    --bg-primary: #0a0a0a;
    --bg-secondary: #151515;
    --bg-tertiary: #1f1f1f;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
    --accent: #667eea;
    --accent-hover: #5568d3;
    --border: #2a2a2a;
    --danger: #ff4444;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
}

#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
}

/* Header - Mobile First */
.header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
}

.header h1 {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.5px;
}

.canvas-info {
    padding: 8px 16px;
    background: var(--bg-tertiary);
    border-top: 1px solid var(--border);
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
    font-family: 'Courier New', monospace;
}

.menu-toggle {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-primary);
    width: 40px;
    height: 40px;
    border-radius: 8px;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
}

.menu-toggle:active {
    background: var(--bg-tertiary);
}

/* Mobile Menu */
.mobile-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
}

.mobile-menu.active {
    transform: translateX(0);
}

.menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--border);
}

.menu-header h2 {
    font-size: 18px;
    font-weight: 600;
}

.menu-close {
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 32px;
    cursor: pointer;
    width: 40px;
    height: 40px;
}

.menu-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Container */
.container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Canvas Area */
.canvas-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    padding: 16px;
    background: var(--bg-primary);
}

.canvas-wrapper {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    overflow: hidden;
}

#mainCanvas {
    display: block;
    background: white;
    max-width: 100%;
    height: auto;
    touch-action: none;
}

/* Controls - Bottom Panel */
.controls {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    overflow-y: auto;
    max-height: 50vh;
}

.control-section {
    padding: 16px;
    border-bottom: 1px solid var(--border);
}

.control-section:last-child {
    border-bottom: none;
}

.control-section h3 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    font-weight: 600;
}

/* Tool Grid */
.tool-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
}

.tool-btn {
    aspect-ratio: 1;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tool-btn:active {
    transform: scale(0.95);
}

.tool-btn.active {
    background: var(--accent);
    border-color: var(--accent);
}

/* Objects List */
.objects-list {
    max-height: 150px;
    overflow-y: auto;
    margin-bottom: 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-tertiary);
}

.object-item {
    padding: 10px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
}

.object-item:last-child {
    border-bottom: none;
}

.object-item:active {
    background: var(--bg-secondary);
}

.object-item.selected {
    background: var(--accent);
}

.object-item.hidden {
    opacity: 0.4;
}

.object-info {
    flex: 1;
    min-width: 0;
}

.object-name {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.object-details {
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 2px;
}

.object-controls {
    display: flex;
    gap: 6px;
}

.object-controls button {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 14px;
}

.object-controls .delete-btn {
    background: var(--danger);
    border-color: var(--danger);
}

/* Button Styles */
.btn {
    width: 100%;
    padding: 12px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn:active {
    background: var(--accent-hover);
    transform: scale(0.98);
}

.btn-secondary {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
}

.btn-small {
    padding: 8px 12px;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-small:active {
    background: var(--bg-secondary);
    transform: scale(0.98);
}

.button-row {
    display: flex;
    gap: 8px;
}

.button-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.effect-btn {
    padding: 8px;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.effect-btn:active {
    background: var(--bg-secondary);
}

/* Props Grid */
.props-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 12px;
}

.prop-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.prop-item label {
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.input-mini {
    width: 100%;
    padding: 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 12px;
}

.input-mini:focus {
    outline: none;
    border-color: var(--accent);
}

.input-mini:disabled {
    opacity: 0.5;
}

/* Style Grid */
.style-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.style-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.style-item label {
    font-size: 11px;
    color: var(--text-secondary);
}

#colorPicker {
    width: 100%;
    height: 44px;
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    background: var(--bg-tertiary);
}

/* Sliders */
.slider-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
}

.slider-group label {
    font-size: 11px;
    color: var(--text-secondary);
}

.slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--bg-tertiary);
    outline: none;
    -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
}

.slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: none;
}

.slider:disabled {
    opacity: 0.5;
}

/* Modals */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 16px;
}

.modal.active {
    display: flex;
}

.modal-content {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    width: 100%;
    max-width: 400px;
    border: 1px solid var(--border);
}

.modal-content h2 {
    font-size: 18px;
    margin-bottom: 20px;
}

.modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
}

.modal-actions .btn,
.modal-actions .btn-secondary {
    flex: 1;
}

.select-format {
    width: 100%;
    padding: 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
}

.select-format:focus {
    outline: none;
    border-color: var(--accent);
}

/* Resize Modal */
.resize-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.input-group label {
    font-size: 12px;
    color: var(--text-secondary);
}

.input-group input {
    width: 100%;
    padding: 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 14px;
}

.input-group input:focus {
    outline: none;
    border-color: var(--accent);
}

.preset-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.preset-btn {
    flex: 1;
    padding: 10px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.preset-btn:active {
    background: var(--accent);
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--accent);
}

/* Tablet & Desktop */
@media (min-width: 768px) {
    .header-main {
        padding: 16px 24px;
    }

    .header h1 {
        font-size: 20px;
    }

    .menu-toggle {
        display: none;
    }

    .mobile-menu {
        position: static;
        transform: translateX(0);
        background: transparent;
        width: auto;
        height: auto;
    }

    .menu-header {
        display: none;
    }

    .menu-content {
        display: flex;
        flex-direction: row;
        padding: 0;
    }

    .container {
        flex-direction: row;
    }

    .canvas-area {
        flex: 1;
        padding: 24px;
    }

    .controls {
        width: 320px;
        max-height: none;
        border-top: none;
        border-left: 1px solid var(--border);
    }

    .tool-grid {
        grid-template-columns: repeat(6, 1fr);
    }

    .props-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (min-width: 1024px) {
    .controls {
        width: 360px;
    }

    .canvas-area {
        padding: 32px;
    }
}
`;

// CSS injection
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);
