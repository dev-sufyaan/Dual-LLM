import React, { useState, useEffect } from 'react';
import { 
  setApiKey as saveApiKeyToBackend, 
  checkApiKeyStatus as checkApiKeyStatusFromBackend,
  testApiKeyDirectly
} from '../services/llmService';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Check API key status when component mounts
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const result = await checkApiKeyStatusFromBackend();
      setMessage(result.message);
      setMessageType(result.is_set ? 'success' : 'error');
    } catch (error) {
      setMessage('Failed to check API key status');
      setMessageType('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Testing API key directly with Gemini API...');
      const testResult = await testApiKeyDirectly(apiKey);
      console.log('API key test result:', testResult);
      
      if (!testResult.success) {
        setMessage(`API key test failed: ${testResult.message}`);
        setMessageType('error');
        setIsLoading(false);
        return;
      }
      
      console.log('Attempting to save API key...');
      const result = await saveApiKeyToBackend(apiKey);
      console.log('API key save result:', result);
      
      if (result.success) {
        setMessage('API key saved successfully!');
        setMessageType('success');
        onClose();
      } else {
        setMessage(result.message || 'Failed to set API key');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      setMessage('Failed to set API key');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Google API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded ${
                messageType === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100'
                  : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Saving...' : 'Save API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 