// version-checker.js
const VERSION_CHECKER_VERSION = '1.0';

document.addEventListener('DOMContentLoaded', () => {
    const versionBox = document.getElementById('version-info');
    if (!versionBox) return;
    const versions = [];
    if (typeof SIMULATOR_ENGINE_VERSION !== 'undefined') versions.push(`Engine v${SIMULATOR_ENGINE_VERSION}`);
    if (typeof SCRIPT_JS_VERSION !== 'undefined') versions.push(`Spel v${SCRIPT_JS_VERSION}`);
    // Lägg till fler versioner här om du vill
    versionBox.textContent = versions.join(' | ');
});
