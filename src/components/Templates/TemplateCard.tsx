import React, { useState } from 'react';
import { Download, Eye, Star, Code, Layout } from 'lucide-react';
import type { Template } from '../../types';
import './TemplateCard.css';

interface TemplateCardProps {
  template: Template;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  onPreview?: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  viewMode,
  onSelect,
  onPreview,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#a6e3a1';
      case 'intermediate':
        return '#f9e2af';
      case 'advanced':
        return '#f38ba8';
      default:
        return '#cdd6f4';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="template-card template-card--list">
        <div className="template-card__preview">
          <Layout size={24} />
        </div>
        <div className="template-card__info">
          <div className="template-card__header">
            <h3>{template.name}</h3>
            <span 
              className="template-card__difficulty"
              style={{ color: getDifficultyColor(template.difficulty) }}
            >
              {template.difficulty}
            </span>
          </div>
          <p className="template-card__desc">{template.description}</p>
          <div className="template-card__meta">
            <span className="template-card__category">
              {template.category}
            </span>
            <div className="template-card__tech">
              {template.techStack.slice(0, 3).map((tech) => (
                <span key={tech} className="tech-badge">{tech}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="template-card__actions">
          <button 
            className="preview-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.();
            }}
          >
            <Eye size={16} />
            Preview
          </button>
          <button className="select-btn" onClick={onSelect}>
            <Download size={16} />
            Use
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`template-card template-card--grid ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="template-card__preview">
        <div className="preview-placeholder">
          <Layout size={32} />
        </div>
        <span 
          className="template-card__difficulty"
          style={{ backgroundColor: getDifficultyColor(template.difficulty) }}
        >
          {template.difficulty}
        </span>
        <div className="template-card__overlay">
          <button 
            className="overlay-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.();
            }}
          >
            <Eye size={18} />
            Preview
          </button>
        </div>
      </div>

      <div className="template-card__content">
        <div className="template-card__header">
          <h3>{template.name}</h3>
          <div className="template-card__popularity">
            <Star size={14} />
            {template.popularity}
          </div>
        </div>

        <p className="template-card__desc">{template.description}</p>

        <div className="template-card__tags">
          {template.features.slice(0, 2).map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
          {template.features.length > 2 && (
            <span className="feature-tag more">+{template.features.length - 2}</span>
          )}
        </div>

        <div className="template-card__footer">
          <div className="template-card__tech">
            {template.techStack.slice(0, 3).map((tech) => (
              <span key={tech} className="tech-badge">{tech}</span>
            ))}
          </div>
          <button className="use-btn" onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}>
            <Download size={14} />
            Use
          </button>
        </div>
      </div>
    </div>
  );
};
