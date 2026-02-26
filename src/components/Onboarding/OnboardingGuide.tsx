import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, X, ChevronRight, BookOpen, HelpCircle, CheckCircle } from 'lucide-react';
import './OnboardingGuide.css';

interface GuideTip {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingGuideProps {
  tips: GuideTip[];
  onDismiss: (tipId: string) => void;
  onComplete: () => void;
}

interface VisibleTip extends GuideTip {
  element: HTMLElement | null;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  tips,
  onDismiss,
  onComplete,
}) => {
  const [visibleTip, setVisibleTip] = useState<VisibleTip | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const availableTips = tips.filter(tip => !dismissedTips.has(tip.id));
    if (availableTips.length === 0) {
      onComplete();
      return;
    }

    const tip = availableTips[currentIndex];
    if (!tip) {
      onComplete();
      return;
    }

    let element: HTMLElement | null = null;
    
    if (tip.target === 'global') {
      element = containerRef.current;
    } else {
      element = document.querySelector(tip.target);
    }

    if (element) {
      setVisibleTip({ ...tip, element });
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [tips, currentIndex, dismissedTips, onComplete]);

  const handleNext = () => {
    if (visibleTip) {
      setDismissedTips(prev => new Set(prev).add(visibleTip.id));
      onDismiss(visibleTip.id);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleDismissAll = () => {
    tips.forEach(tip => {
      setDismissedTips(prev => new Set(prev).add(tip.id));
      onDismiss(tip.id);
    });
    onComplete();
  };

  if (!visibleTip) {
    return null;
  }

  const remaining = tips.length - currentIndex;

  return (
    <div className="onboarding-guide">
      <div className="onboarding-guide__content">
        <div className="onboarding-guide__header">
          <Lightbulb size={18} />
          <span>Quick Tip</span>
          <button className="dismiss-btn" onClick={handleDismissAll}>
            <X size={16} />
          </button>
        </div>
        
        <h4>{visibleTip.title}</h4>
        <p>{visibleTip.content}</p>

        <div className="onboarding-guide__footer">
          <span className="tip-counter">
            {remaining} tip{remaining !== 1 ? 's' : ''} remaining
          </span>
          <button className="next-tip-btn" onClick={handleNext}>
            {remaining === 1 ? 'Got it' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ContextualHelpProps {
  onOpenHelp: () => void;
  showBadge?: boolean;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  onOpenHelp,
  showBadge = false,
}) => {
  return (
    <button className="contextual-help-btn" onClick={onOpenHelp}>
      <HelpCircle size={20} />
      {showBadge && <span className="help-badge">?</span>}
    </button>
  );
};

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="help-modal__overlay" onClick={onClose}>
      <div className="help-modal" onClick={e => e.stopPropagation()}>
        <div className="help-modal__header">
          <h3><BookOpen size={20} /> Help & Guide</h3>
          <button className="help-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="help-modal__content">
          {children}
        </div>
      </div>
    </div>
  );
};

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface HelpContentProps {
  sections: HelpSection[];
}

export const HelpContent: React.FC<HelpContentProps> = ({ sections }) => {
  return (
    <div className="help-content">
      {sections.map((section) => (
        <div key={section.id} className="help-section">
          <h4>
            {section.icon}
            {section.title}
          </h4>
          {section.content}
        </div>
      ))}
    </div>
  );
};

export const DEFAULT_HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Rocket size={16} />,
    content: (
      <div className="help-text">
        <ol>
          <li>Describe what you want to build in the chat</li>
          <li>AI will generate the code for your project</li>
          <li>Click "Apply" to add files to your project</li>
          <li>Preview your app in real-time</li>
          <li>Deploy with one click when ready</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'editor',
    title: 'Using the Editor',
    icon: <Code size={16} />,
    content: (
      <div className="help-text">
        <ul>
          <li>Click any file to edit it</li>
          <li>Syntax highlighting for JS, TS, HTML, CSS, JSON</li>
          <li>Changes auto-save to the project</li>
          <li>Use Ctrl/Cmd + S to manually save</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'ai-chat',
    title: 'AI Chat Tips',
    icon: <Lightbulb size={16} />,
    content: (
      <div className="help-text">
        <ul>
          <li>Be specific about your requirements</li>
          <li>Include desired styling preferences</li>
          <li>Specify if you need responsive design</li>
          <li>Mention any specific libraries needed</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'deployment',
    title: 'Deploying',
    icon: <CheckCircle size={16} />,
    content: (
      <div className="help-text">
        <ol>
          <li>Make sure your app is working in preview</li>
          <li>Click the Deploy button</li>
          <li>Choose Vercel or Netlify</li>
          <li>Follow the authentication steps</li>
          <li>Your app will be live in minutes!</li>
        </ol>
      </div>
    ),
  },
];

const Rocket = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
