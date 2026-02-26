import type { Project, AppSettings, APIKeys, OnboardingProgress } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'arena_projects',
  SETTINGS: 'arena_settings',
  API_KEYS: 'arena_api_keys',
  CURRENT_PROJECT: 'arena_current_project',
  ONBOARDING_PROGRESS: 'arena_onboarding_progress',
  MESSAGES_USED: 'arena_messages_used',
  APPS_CREATED: 'arena_apps_created',
};

class StorageService {
  saveProject(project: Project): void {
    const projects = this.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getProject(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  deleteProject(id: string): void {
    const projects = this.getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    
    const currentProject = this.getCurrentProject();
    if (currentProject?.id === id) {
      this.clearCurrentProject();
    }
  }

  saveCurrentProject(project: Project): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(project));
  }

  getCurrentProject(): Project | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  clearCurrentProject(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  getSettings(): AppSettings {
    const defaults: AppSettings = {
      theme: 'dark',
      aiProvider: 'groq',
      autoSave: true,
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
    };
    
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return defaults;
    
    try {
      return { ...defaults, ...JSON.parse(data) };
    } catch {
      return defaults;
    }
  }

  saveAPIKeys(keys: APIKeys): void {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  }

  getAPIKeys(): APIKeys {
    const defaults: APIKeys = {
      groq: '',
      gemini: '',
      openrouter: '',
    };
    
    const data = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (!data) return defaults;
    
    try {
      return { ...defaults, ...JSON.parse(data) };
    } catch {
      return defaults;
    }
  }

  saveOnboardingProgress(progress: OnboardingProgress): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_PROGRESS, JSON.stringify(progress));
  }

  getOnboardingProgress(): OnboardingProgress | null {
    const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  clearOnboardingProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
  }

  incrementMessageCount(): void {
    const current = this.getMessageCount();
    localStorage.setItem(STORAGE_KEYS.MESSAGES_USED, String(current + 1));
  }

  getMessageCount(): number {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES_USED);
    return data ? parseInt(data, 10) : 0;
  }

  resetMessageCount(): void {
    localStorage.setItem(STORAGE_KEYS.MESSAGES_USED, '0');
  }

  incrementAppCount(): void {
    const current = this.getAppCount();
    localStorage.setItem(STORAGE_KEYS.APPS_CREATED, String(current + 1));
  }

  getAppCount(): number {
    const data = localStorage.getItem(STORAGE_KEYS.APPS_CREATED);
    return data ? parseInt(data, 10) : 0;
  }

  resetAppCount(): void {
    localStorage.setItem(STORAGE_KEYS.APPS_CREATED, '0');
  }

  exportAllData(): string {
    const data = {
      projects: this.getProjects(),
      settings: this.getSettings(),
      apiKeys: this.getAPIKeys(),
      currentProject: this.getCurrentProject(),
      onboardingProgress: this.getOnboardingProgress(),
      messagesUsed: this.getMessageCount(),
      appsCreated: this.getAppCount(),
      exportedAt: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.projects) {
        data.projects.forEach((project: Project) => this.saveProject(project));
      }
      
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      
      if (data.apiKeys) {
        this.saveAPIKeys(data.apiKeys);
      }
      
      if (data.currentProject) {
        this.saveCurrentProject(data.currentProject);
      }
      
      if (data.onboardingProgress) {
        this.saveOnboardingProgress(data.onboardingProgress);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storageService = new StorageService();
