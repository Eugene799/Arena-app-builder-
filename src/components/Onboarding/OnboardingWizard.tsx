import React, { useState, useCallback, useEffect } from 'react';
import {
  Sparkles,
  Code,
  Rocket,
  Zap,
  ChevronRight,
  ChevronLeft,
  Check,
  Brain,
  Globe,
  Smartphone,
  Server,
  GraduationCap,
  Briefcase,
  Key,
  Lightbulb,
} from 'lucide-react';
import type { OnboardingProgress, Template } from '../../types';
import { storageService } from '../../services/storageService';
import './OnboardingWizard.css';

interface OnboardingWizardProps {
  onComplete: (progress: OnboardingProgress) => void;
  onSkip: () => void;
  onSelectTemplate: (templateId: string) => void;
  templates?: Template[];
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: '👋' },
  { id: 'goal', title: 'Your Goal', icon: '🎯' },
  { id: 'experience', title: 'Experience', icon: '📊' },
  { id: 'project-type', title: 'Project Type', icon: '💻' },
  { id: 'template', title: 'Choose Template', icon: '📋' },
  { id: 'ai-provider', title: 'AI Provider', icon: '🤖' },
  { id: 'complete', title: 'Ready!', icon: '🎉' },
];

const GOALS = [
  { id: 'build-app', name: 'Build an App', desc: 'Create a web or mobile application', icon: <Rocket size={24} /> },
  { id: 'learn', name: 'Learn to Code', desc: 'Understand web development', icon: <GraduationCap size={24} /> },
  { id: 'portfolio', name: 'Build Portfolio', desc: 'Showcase your work', icon: <Briefcase size={24} /> },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', name: 'Beginner', desc: 'New to coding', color: '#a6e3a1' },
  { id: 'intermediate', name: 'Intermediate', desc: 'Some experience', color: '#f9e2af' },
  { id: 'advanced', name: 'Advanced', desc: 'Experienced developer', color: '#f38ba8' },
];

const PROJECT_TYPES = [
  { id: 'web-app', name: 'Web App', desc: 'Full-featured application', icon: <Globe size={24} /> },
  { id: 'mobile-app', name: 'Mobile App', desc: 'Responsive mobile-first', icon: <Smartphone size={24} /> },
  { id: 'website', name: 'Website', desc: 'Landing page or blog', icon: <Code size={24} /> },
  { id: 'api', name: 'API', desc: 'Backend service', icon: <Server size={24} /> },
];

const AI_PROVIDERS = [
  { 
    id: 'groq', 
    name: 'Groq', 
    desc: 'Fast inference, great for code generation', 
    badge: 'Fastest',
    color: '#f43f5e' 
  },
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    desc: 'Multimodal, excellent understanding', 
    badge: 'Best Quality',
    color: '#8b5cf6' 
  },
  { 
    id: 'openrouter', 
    name: 'OpenRouter', 
    desc: 'Access to multiple models', 
    badge: 'Most Options',
    color: '#06b6d4' 
  },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onSkip,
  onSelectTemplate,
  templates = [],
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState<OnboardingProgress>({
    completedSteps: [],
    currentStep: 0,
    totalSteps: STEPS.length,
  });

  useEffect(() => {
    const saved = storageService.getOnboardingProgress();
    if (saved) {
      setProgress(saved);
      setCurrentStep(saved.currentStep);
    }
  }, []);

  const saveProgress = useCallback((newProgress: OnboardingProgress) => {
    setProgress(newProgress);
    storageService.saveOnboardingProgress(newProgress);
  }, []);

  const handleNext = useCallback(() => {
    const stepId = STEPS[currentStep].id;
    const newProgress: OnboardingProgress = {
      ...progress,
      completedSteps: [...progress.completedSteps, stepId],
      currentStep: currentStep + 1,
    };
    saveProgress(newProgress);

    if (currentStep >= STEPS.length - 1) {
      onComplete(newProgress);
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, progress, onComplete, saveProgress]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const updateProgress = useCallback((updates: Partial<OnboardingProgress>) => {
    const newProgress = { ...progress, ...updates };
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="onboarding-step onboarding-step--welcome">
            <div className="welcome-icon">
              <Sparkles size={48} />
            </div>
            <h2>Welcome to Arena AI Builder</h2>
            <p>Let's get you set up to build amazing applications with AI assistance</p>
            <div className="welcome-features">
              <div className="welcome-feature">
                <Code size={20} />
                <span>Build with AI</span>
              </div>
              <div className="welcome-feature">
                <Zap size={20} />
                <span>Deploy Instantly</span>
              </div>
              <div className="welcome-feature">
                <Rocket size={20} />
                <span>No Setup Required</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="onboarding-step">
            <h2>What would you like to do?</h2>
            <p>Help us understand your goals</p>
            <div className="goal-grid">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  className={`goal-card ${progress.goal === goal.id ? 'active' : ''}`}
                  onClick={() => updateProgress({ goal: goal.id as 'build-app' | 'learn' | 'portfolio' })}
                >
                  <div className="goal-icon">{goal.icon}</div>
                  <div className="goal-info">
                    <span className="goal-name">{goal.name}</span>
                    <span className="goal-desc">{goal.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="onboarding-step">
            <h2>What's your experience level?</h2>
            <p>This helps us customize the experience</p>
            <div className="experience-grid">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.id}
                  className={`experience-card ${progress.experienceLevel === level.id ? 'active' : ''}`}
                  onClick={() => updateProgress({ experienceLevel: level.id as 'beginner' | 'intermediate' | 'advanced' })}
                >
                  <div className="experience-indicator" style={{ backgroundColor: level.color }} />
                  <span className="experience-name">{level.name}</span>
                  <span className="experience-desc">{level.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-step">
            <h2>What type of project?</h2>
            <p>Choose what you want to build</p>
            <div className="project-grid">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`project-card ${progress.projectType === type.id ? 'active' : ''}`}
                  onClick={() => updateProgress({ projectType: type.id as 'web-app' | 'mobile-app' | 'website' | 'api' })}
                >
                  <div className="project-icon">{type.icon}</div>
                  <span className="project-name">{type.name}</span>
                  <span className="project-desc">{type.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="onboarding-step">
            <h2>Start with a template</h2>
            <p>Pick a starting point or start from scratch</p>
            <div className="template-grid">
              <button
                className={`template-card template-card--blank ${!progress.selectedTemplate ? 'active' : ''}`}
                onClick={() => {
                  updateProgress({ selectedTemplate: undefined });
                  onSelectTemplate('');
                }}
              >
                <div className="template-blank-icon">
                  <Lightbulb size={32} />
                </div>
                <span>Start from Scratch</span>
              </button>
              {templates.slice(0, 4).map((template) => (
                <button
                  key={template.id}
                  className={`template-card ${progress.selectedTemplate === template.id ? 'active' : ''}`}
                  onClick={() => {
                    updateProgress({ selectedTemplate: template.id });
                    onSelectTemplate(template.id);
                  }}
                >
                  <div className="template-preview">
                    <span className="difficulty-badge" data-difficulty={template.difficulty}>
                      {template.difficulty}
                    </span>
                  </div>
                  <span className="template-name">{template.name}</span>
                  <span className="template-category">{template.category}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="onboarding-step">
            <h2>Choose your AI Provider</h2>
            <p>Select the AI model for code generation</p>
            <div className="provider-grid">
              {AI_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  className={`provider-card ${progress.aiProvider === provider.id ? 'active' : ''}`}
                  onClick={() => updateProgress({ aiProvider: provider.id as 'groq' | 'gemini' | 'openrouter' })}
                >
                  <div className="provider-header">
                    <div className="provider-icon" style={{ backgroundColor: provider.color }}>
                      <Key size={18} />
                    </div>
                    <span className="provider-badge" style={{ backgroundColor: provider.color }}>
                      {provider.badge}
                    </span>
                  </div>
                  <span className="provider-name">{provider.name}</span>
                  <span className="provider-desc">{provider.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="onboarding-step onboarding-step--complete">
            <div className="complete-icon">
              <Check size={48} />
            </div>
            <h2>You're All Set!</h2>
            <p>Ready to start building amazing things</p>
            <div className="complete-summary">
              <div className="summary-item">
                <span className="summary-label">Goal</span>
                <span className="summary-value">{GOALS.find(g => g.id === progress.goal)?.name || 'Not set'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Experience</span>
                <span className="summary-value">{EXPERIENCE_LEVELS.find(e => e.id === progress.experienceLevel)?.name || 'Not set'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Project</span>
                <span className="summary-value">{PROJECT_TYPES.find(p => p.id === progress.projectType)?.name || 'Not set'}</span>
              </div>
            </div>
            <button className="get-started-btn" onClick={() => onComplete(progress)}>
              Start Building <ChevronRight size={18} />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!progress.goal;
      case 2:
        return !!progress.experienceLevel;
      case 3:
        return !!progress.projectType;
      case 4:
        return true;
      case 5:
        return !!progress.aiProvider;
      default:
        return true;
    }
  };

  return (
    <div className="onboarding-wizard">
      <div className="onboarding-wizard__header">
        <button className="skip-btn" onClick={onSkip}>
          Skip
        </button>
        <div className="progress-dots">
          {STEPS.map((step, index) => (
            <span
              key={step.id}
              className={`progress-dot ${index <= currentStep ? 'active' : ''} ${progress.completedSteps.includes(step.id) ? 'completed' : ''}`}
            />
          ))}
        </div>
        <span className="step-counter">{currentStep + 1}/{STEPS.length}</span>
      </div>

      <div className="onboarding-wizard__content">
        {renderStep()}
      </div>

      <div className="onboarding-wizard__footer">
        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <button className="back-btn" onClick={handleBack}>
            <ChevronLeft size={18} /> Back
          </button>
        )}
        {currentStep < STEPS.length - 1 && (
          <button
            className="next-btn"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === STEPS.length - 2 ? 'Get Started' : 'Continue'} <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
