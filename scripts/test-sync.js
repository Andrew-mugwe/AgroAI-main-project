#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Mock Google Sheets data
const mockSheetData = {
  values: [
    // Headers
    ['key', 'en', 'sw', 'fr'],
    // Common translations
    ['common.navigation.home', 'Home', 'Nyumbani', 'Accueil'],
    ['common.navigation.dashboard', 'Dashboard', 'Dashibodi', 'Tableau de bord'],
    ['common.auth.login', 'Login', 'Ingia', 'Connexion'],
    // Farmer translations
    ['farmer.dashboard.title', 'Farmer Dashboard', 'Dashibodi ya Mkulima', 'Tableau de bord agricole'],
    ['farmer.crops.add', 'Add Crop', 'Ongeza Mazao', 'Ajouter une culture'],
    // NGO translations
    ['ngo.dashboard.title', 'NGO Dashboard', 'Dashibodi ya NGO', 'Tableau de bord ONG'],
    ['ngo.projects.add', 'Add Project', 'Ongeza Mradi', 'Ajouter un projet'],
    // Trader translations
    ['trader.dashboard.title', 'Trader Dashboard', 'Dashibodi ya Mfanyabiashara', 'Tableau de bord commerçant'],
    ['trader.marketplace.buy', 'Buy', 'Nunua', 'Acheter']
  ]
};

// Configuration
const CONFIG = {
  roles: ['common', 'farmer', 'ngo', 'trader'],
  languages: ['en', 'sw', 'fr'],
  outputDir: path.join(process.cwd(), 'client', 'src', 'locales'),
};

// Process mock data
function processTranslations() {
  const rows = mockSheetData.values;
  const headers = rows[0];
  const languageColumns = headers.slice(1);

  const translations = {};
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    
    const key = row[0];
    const [role, ...keyParts] = key.split('.');
    
    if (!CONFIG.roles.includes(role)) continue;
    
    if (!translations[role]) {
      translations[role] = {};
      languageColumns.forEach(lang => {
        if (CONFIG.languages.includes(lang)) {
          translations[role][lang] = {};
        }
      });
    }
    
    languageColumns.forEach((lang, index) => {
      if (!CONFIG.languages.includes(lang)) return;
      
      const translation = row[index + 1];
      if (!translation) return;
      
      let current = translations[role][lang];
      const lastKey = keyParts.pop();
      
      // Create nested structure
      keyParts.forEach(part => {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      });
      
      // Set the final value
      current[lastKey] = translation;
    });
  }

  return translations;
}

// Write translations to files
async function writeTranslations(translations) {
  for (const [role, roleTranslations] of Object.entries(translations)) {
    for (const [lang, langTranslations] of Object.entries(roleTranslations)) {
      const dirPath = path.join(CONFIG.outputDir, lang);
      const filePath = path.join(dirPath, `${role}.json`);
      
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

// Main function
async function main() {
  try {
    console.log('Processing mock translations...');
    const translations = processTranslations();

    console.log('Writing translation files...');
    await writeTranslations(translations);

    console.log('✨ Test sync completed successfully!');
  } catch (error) {
    console.error('❌ Test sync failed:', error.message);
    process.exit(1);
  }
}

main();
