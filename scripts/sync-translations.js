#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');

// Configuration
const CONFIG = {
  roles: ['common', 'farmer', 'ngo', 'trader'],
  languages: ['en', 'sw', 'fr'],
  sheetId: process.env.GOOGLE_SHEET_ID,
  outputDir: path.join(process.cwd(), 'client', 'src', 'locales'),
};

// CLI setup
program
  .option('-s, --sheet-id <id>', 'Google Sheet ID')
  .option('-t, --token <token>', 'Google Sheets API token')
  .option('--dry-run', 'Show what would be written without making changes')
  .parse(process.argv);

const options = program.opts();

// Fetch translations from Google Sheets
async function fetchTranslations(sheetId, token) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Translations!A1:Z1000`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in sheet');
    }

    // First row contains headers (key, en, sw, fr, ...)
    const headers = rows[0];
    const languageColumns = headers.slice(1);

    // Group translations by role and language
    const translations = {};
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue; // Skip empty keys
      
      const key = row[0];
      const [role, ...keyParts] = key.split('.');
      
      // Skip invalid roles
      if (!CONFIG.roles.includes(role)) continue;
      
      // Initialize role objects
      if (!translations[role]) {
        translations[role] = {};
        languageColumns.forEach(lang => {
          if (CONFIG.languages.includes(lang)) {
            translations[role][lang] = {};
          }
        });
      }
      
      // Add translations for each language
      languageColumns.forEach((lang, index) => {
        if (!CONFIG.languages.includes(lang)) return;
        
        const translation = row[index + 1];
        if (!translation) return;
        
        let current = translations[role][lang];
        const lastKey = keyParts.pop();
        
        // Create nested objects for deep keys
        keyParts.forEach(part => {
          current[part] = current[part] || {};
          current = current[part];
        });
        
        current[lastKey] = translation;
      });
    }

    return translations;
  } catch (error) {
    console.error('Failed to fetch translations:', error.message);
    throw error;
  }
}

// Write translations to files
async function writeTranslations(translations, dryRun = false) {
  for (const [role, roleTranslations] of Object.entries(translations)) {
    for (const [lang, langTranslations] of Object.entries(roleTranslations)) {
      const dirPath = path.join(CONFIG.outputDir, lang);
      const filePath = path.join(dirPath, `${role}.json`);
      
      if (dryRun) {
        console.log(`Would write to ${filePath}:`);
        console.log(JSON.stringify(langTranslations, null, 2));
        continue;
      }
      
      try {
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(
          filePath,
          JSON.stringify(langTranslations, null, 2) + '\n',
          'utf8'
        );
        console.log(`✓ Written ${filePath}`);
      } catch (error) {
        console.error(`Failed to write ${filePath}:`, error.message);
        throw error;
      }
    }
  }
}

// Validate translations
function validateTranslations(translations) {
  const errors = [];
  
  // Check for missing translations in non-English languages
  Object.entries(translations).forEach(([role, roleTranslations]) => {
    const enKeys = getAllKeys(roleTranslations.en);
    
    Object.entries(roleTranslations).forEach(([lang, langTranslations]) => {
      if (lang === 'en') return;
      
      const langKeys = getAllKeys(langTranslations);
      const missingKeys = enKeys.filter(key => !langKeys.includes(key));
      
      if (missingKeys.length > 0) {
        errors.push(`${lang}/${role}.json missing keys: ${missingKeys.join(', ')}`);
      }
    });
  });

  return errors;
}

// Get all keys from nested object
function getAllKeys(obj, prefix = '') {
  return Object.entries(obj).reduce((keys, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object') {
      return [...keys, ...getAllKeys(value, newKey)];
    }
    return [...keys, newKey];
  }, []);
}

// Main function
async function main() {
  try {
    const sheetId = options.sheetId || CONFIG.sheetId;
    const token = options.token || process.env.GOOGLE_SHEETS_TOKEN;
    
    if (!sheetId || !token) {
      throw new Error('Missing required parameters: sheet ID or token');
    }

    console.log('Fetching translations from Google Sheets...');
    const translations = await fetchTranslations(sheetId, token);

    console.log('Validating translations...');
    const errors = validateTranslations(translations);
    if (errors.length > 0) {
      console.warn('⚠️ Validation warnings:');
      errors.forEach(error => console.warn(`  ${error}`));
    }

    console.log('Writing translation files...');
    await writeTranslations(translations, options.dryRun);

    console.log('✨ Translations sync completed successfully!');
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();
