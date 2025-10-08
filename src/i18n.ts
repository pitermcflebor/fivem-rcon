import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface Translations {
    [key: string]: string;
}

let translations: Translations = {};

export function loadTranslations(extensionPath: string): void {
    const locale = vscode.env.language;
    // Support full locale (e.g., 'es-ES') by taking only the language part
    const lang = locale.split('-')[0];
    
    // Try loading from dist folder first (production), then from src (development)
    const distLocaleFile = path.join(extensionPath, 'dist', 'locales', `${lang}.json`);
    const srcLocaleFile = path.join(extensionPath, 'src', 'locales', `${lang}.json`);
    const distDefaultFile = path.join(extensionPath, 'dist', 'locales', 'en.json');
    const srcDefaultFile = path.join(extensionPath, 'src', 'locales', 'en.json');

    try {
        // Try to load locale-specific file
        if (fs.existsSync(distLocaleFile)) {
            translations = JSON.parse(fs.readFileSync(distLocaleFile, 'utf8'));
        } else if (fs.existsSync(srcLocaleFile)) {
            translations = JSON.parse(fs.readFileSync(srcLocaleFile, 'utf8'));
        } else if (fs.existsSync(distDefaultFile)) {
            // Fallback to default (English)
            translations = JSON.parse(fs.readFileSync(distDefaultFile, 'utf8'));
        } else if (fs.existsSync(srcDefaultFile)) {
            translations = JSON.parse(fs.readFileSync(srcDefaultFile, 'utf8'));
        }
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
}

export function t(key: string, ...args: any[]): string {
    let message = translations[key] || key;
    
    // Replace placeholders {0}, {1}, etc.
    args.forEach((arg, index) => {
        message = message.replace(`{${index}}`, String(arg));
    });
    
    return message;
}
