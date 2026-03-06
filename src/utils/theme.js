/* ==========================================
   THEME MANAGER
   ========================================== */

import { getSettings, saveSettings } from './storage.js';

export function initTheme() {
    const settings = getSettings();
    applyTheme(settings.theme || 'light');
    applyHighContrast(settings.highContrast || false);
    applyFontScale(settings.fontScale || 'normal');
}

export function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const settings = getSettings();
    settings.theme = theme;
    saveSettings(settings);
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return next;
}

export function applyHighContrast(enabled) {
    document.documentElement.setAttribute('data-high-contrast', enabled ? 'true' : 'false');
    const settings = getSettings();
    settings.highContrast = enabled;
    saveSettings(settings);
}

export function applyFontScale(scale) {
    document.documentElement.setAttribute('data-font-scale', scale);
    const settings = getSettings();
    settings.fontScale = scale;
    saveSettings(settings);
}

export function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}
