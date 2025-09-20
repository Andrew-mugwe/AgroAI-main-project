import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export const TranslationTest: React.FC = () => {
  const { t } = useTranslation(['common', 'farmer']);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Translation Test</h2>
        <LanguageSwitcher />
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700">Common Translations:</h3>
          <p>Home: {t('common:navigation.home')}</p>
          <p>Dashboard: {t('common:navigation.dashboard')}</p>
          <p>Login: {t('common:auth.login')}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-700">Farmer Translations:</h3>
          <p>Dashboard Title: {t('farmer:dashboard.title')}</p>
          <p>Add Crop: {t('farmer:crops.add')}</p>
          <p>Weather Title: {t('farmer:weather.title')}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-700">Missing Translation Test:</h3>
          <p>This should show the key: {t('common:nonexistent.key')}</p>
        </div>
      </div>
    </div>
  );
};
