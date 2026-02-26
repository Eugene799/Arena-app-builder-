import type { ValidationResult, ValidationRule } from '../types';

export const validateProjectName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Project name is required');
  } else {
    if (name.length > 50) {
      errors.push('Project name must be 50 characters or less');
    }
    if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
      errors.push('Project name can only contain letters, numbers, spaces, and hyphens');
    }
    if (/^[-]/.test(name) || /[-]$/.test(name)) {
      errors.push('Project name cannot start or end with a hyphen');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateFileName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('File name is required');
  } else {
    const invalidChars = /[<>:"|?*\x00-\x1F]/;
    if (invalidChars.test(name)) {
      errors.push('File name contains invalid characters');
    }
    if (name === '.' || name === '..') {
      errors.push('Invalid file name');
    }
    if (name.length > 255) {
      errors.push('File name must be 255 characters or less');
    }
    if (/[\/\\]/.test(name)) {
      errors.push('File name cannot contain path separators');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateWalletAddress = (address: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!address || address.trim().length === 0) {
    errors.push('Wallet address is required');
  } else {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      errors.push('Invalid Avalanche address format (expected: 0x followed by 40 hex characters)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateApiKey = (key: string, provider: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!key || key.trim().length === 0) {
    errors.push(`${provider} API key is required`);
  } else {
    switch (provider.toLowerCase()) {
      case 'groq':
        if (!key.startsWith('gsk_')) {
          errors.push('Invalid Groq API key format (expected: gsk_...)');
        }
        break;
      case 'gemini':
        if (!key.startsWith('AIza')) {
          errors.push('Invalid Gemini API key format (expected: AIza...)');
        }
        break;
      case 'openrouter':
        if (key.length < 10) {
          errors.push('Invalid OpenRouter API key format');
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const sanitizeHtml = (html: string): string => {
  const allowedTags = ['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  let sanitized = html;
  
  allowedTags.forEach(tag => {
    const regex = new RegExp(`<(?!\/?(?:${allowedTags.join('|')}))[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized;
};

export const createValidator = (rules: ValidationRule[]): ((value: string) => ValidationResult) => {
  return (value: string): ValidationResult => {
    const errors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };
};

export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!url || url.trim().length === 0) {
    errors.push('URL is required');
  } else {
    try {
      new URL(url);
    } catch {
      errors.push('Invalid URL format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAmount = (amount: string, min: number = 0, max?: number): ValidationResult => {
  const errors: string[] = [];
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    errors.push('Amount must be a valid number');
  } else {
    if (numAmount < min) {
      errors.push(`Amount must be at least ${min}`);
    }
    if (max !== undefined && numAmount > max) {
      errors.push(`Amount must be at most ${max}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
