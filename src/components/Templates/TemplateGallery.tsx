import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, Download, Eye, Grid, List } from 'lucide-react';
import type { Template, TemplateCategory } from '../../types';
import { TemplateCard } from './TemplateCard';
import './TemplateGallery.css';

interface TemplateGalleryProps {
  templates: Template[];
  categories: TemplateCategory[];
  onSelectTemplate: (template: Template) => void;
  onPreviewTemplate?: (template: Template) => void;
  searchPlaceholder?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'name';

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  categories,
  onSelectTemplate,
  onPreviewTemplate,
  searchPlaceholder = 'Search templates...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        t => 
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      result = result.filter(t => t.difficulty === selectedDifficulty);
    }

    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'newest':
        result.reverse();
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [templates, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return templates.length;
    return templates.filter(t => t.category === categoryId).length;
  };

  return (
    <div className="template-gallery">
      <div className="template-gallery__header">
        <h2>
          <Grid size={24} />
          Template Gallery
        </h2>
        <p>Start with a pre-built template or build from scratch</p>
      </div>

      {/* Filters */}
      <div className="template-gallery__filters">
        <div className="template-gallery__search">
          <Search size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="template-gallery__filter-group">
          <Filter size={16} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({getCategoryCount('all')})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({getCategoryCount(cat.id)})
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="template-gallery__view-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} />
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Categories Quick Links */}
      <div className="template-gallery__categories">
        {categories.slice(0, 6).map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
          >
            {cat.icon}
            <span>{cat.name}</span>
            <span className="category-count">{getCategoryCount(cat.id)}</span>
          </button>
        ))}
      </div>

      {/* Templates Grid/List */}
      <div className={`template-gallery__content template-gallery__content--${viewMode}`}>
        {filteredTemplates.length === 0 ? (
          <div className="template-gallery__empty">
            <p>No templates found matching your criteria</p>
            <button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }}>
              Clear Filters
            </button>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              viewMode={viewMode}
              onSelect={() => onSelectTemplate(template)}
              onPreview={onPreviewTemplate ? () => onPreviewTemplate(template) : undefined}
            />
          ))
        )}
      </div>

      {/* Results Count */}
      <div className="template-gallery__results">
        Showing {filteredTemplates.length} of {templates.length} templates
      </div>
    </div>
  );
};
