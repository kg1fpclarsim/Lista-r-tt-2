// version-checker.js
document.addEventListener('DOMContentLoaded', () => {
    const versionBox = document.getElementById('version-info');
    if (!versionBox) return;

    const versions = [];
    
    // Samla in versioner från alla filer som kan tänkas vara laddade
    if (typeof SIMULATOR_ENGINE_VERSION !== 'undefined') versions.push(`Engine v${SIMULATOR_ENGINE_VERSION}`);
    if (typeof SCRIPT_JS_VERSION !== 'undefined') versions.push(`Sim-Spel v${SCRIPT_JS_VERSION}`);
    if (typeof ADMIN_JS_VERSION !== 'undefined') versions.push(`Sim-Admin v${ADMIN_JS_VERSION}`);
    if (typeof SPEL_ANALYS_VERSION !== 'undefined') versions.push(`Analys-Spel v${SPEL_ANALYS_VERSION}`);
    if (typeof ADMIN_ANALYS_VERSION !== 'undefined') versions.push(`Analys-Admin v${ADMIN_ANALYS_VERSION}`);
    if (typeof CERTIFIKAT_JS_VERSION !== 'undefined') versions.push(`Certifikat v${CERTIFIKAT_JS_VERSION}`);

    versionBox.textContent = versions.join(' | ');
});
