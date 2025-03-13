/**
 * Generates a unique ID for messages
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Formats a date for display in the chat
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}; 