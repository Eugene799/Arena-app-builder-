import React, { useState, useEffect } from 'react';
import { Cloud, Server, Database, Globe, Zap, DollarSign, Info } from 'lucide-react';
import { feeService } from '../../services/feeService';
import type { DeploymentCost, DeploymentEstimate } from '../../types';
import './DeploymentCostEstimator.css';

interface DeploymentCostEstimatorProps {
  onClose?: () => void;
}

const FRAMEWORKS = [
  { id: 'react', name: 'React', icon: '⚛️' },
  { id: 'vue', name: 'Vue', icon: '💚' },
  { id: 'nextjs', name: 'Next.js', icon: '▲' },
  { id: 'astro', name: 'Astro', icon: '🚀' },
  { id: 'vanilla', name: 'Vanilla JS', icon: '📜' },
];

const PLATFORMS = [
  { id: 'vercel', name: 'Vercel', icon: '▲' },
  { id: 'netlify', name: 'Netlify', icon: 'N' },
];

export const DeploymentCostEstimator: React.FC<DeploymentCostEstimatorProps> = ({
  onClose,
}) => {
  const [selectedFramework, setSelectedFramework] = useState('react');
  const [selectedPlatform, setSelectedPlatform] = useState('vercel');
  const [pageCount, setPageCount] = useState(5);
  const [bandwidth, setBandwidth] = useState(10);
  const [showComparison, setShowComparison] = useState(false);
  const [costEstimate, setCostEstimate] = useState<DeploymentCost | null>(null);
  const [comparison, setComparison] = useState<DeploymentEstimate[]>([]);

  useEffect(() => {
    const cost = feeService.calculateDeploymentCost(
      selectedPlatform,
      selectedFramework,
      pageCount,
      bandwidth
    );
    setCostEstimate(cost);

    if (showComparison) {
      const comp = feeService.compareDeploymentCosts(selectedFramework, pageCount, bandwidth);
      setComparison(comp);
    }
  }, [selectedFramework, selectedPlatform, pageCount, bandwidth, showComparison]);

  return (
    <div className="deployment-estimator">
      <div className="deployment-estimator__header">
        <Cloud size={20} />
        <h3>Deployment Cost Estimator</h3>
        {onClose && (
          <button className="deployment-estimator__close" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="deployment-estimator__content">
        {/* Framework Selection */}
        <div className="deployment-estimator__section">
          <h4>
            <Server size={16} />
            Framework
          </h4>
          <div className="deployment-estimator__grid">
            {FRAMEWORKS.map((fw) => (
              <button
                key={fw.id}
                className={`deployment-estimator__option-btn ${selectedFramework === fw.id ? 'active' : ''}`}
                onClick={() => setSelectedFramework(fw.id)}
              >
                <span className="deployment-estimator__option-icon">{fw.icon}</span>
                <span className="deployment-estimator__option-name">{fw.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="deployment-estimator__section">
          <h4>
            <Globe size={16} />
            Platform
          </h4>
          <div className="deployment-estimator__platform-options">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                className={`deployment-estimator__platform-btn ${selectedPlatform === platform.id ? 'active' : ''}`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                <span className="deployment-estimator__platform-icon">{platform.icon}</span>
                <span>{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Page Count */}
        <div className="deployment-estimator__section">
          <h4>
            <Zap size={16} />
            Estimated Pages
          </h4>
          <div className="deployment-estimator__slider-container">
            <input
              type="range"
              min="1"
              max="50"
              value={pageCount}
              onChange={(e) => setPageCount(parseInt(e.target.value))}
              className="deployment-estimator__slider"
            />
            <div className="deployment-estimator__slider-value">{pageCount} pages</div>
          </div>
          <div className="deployment-estimator__slider-labels">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        {/* Bandwidth */}
        <div className="deployment-estimator__section">
          <h4>
            <Database size={16} />
            Monthly Bandwidth (GB)
          </h4>
          <div className="deployment-estimator__slider-container">
            <input
              type="range"
              min="1"
              max="100"
              value={bandwidth}
              onChange={(e) => setBandwidth(parseInt(e.target.value))}
              className="deployment-estimator__slider"
            />
            <div className="deployment-estimator__slider-value">{bandwidth} GB</div>
          </div>
        </div>

        {/* Cost Breakdown */}
        {costEstimate && (
          <div className="deployment-estimator__breakdown">
            <h4>
              <DollarSign size={16} />
              Estimated Monthly Cost
            </h4>
            <div className="deployment-estimator__costs">
              <div className="deployment-estimator__cost-row">
                <span>Base cost</span>
                <span>${costEstimate.baseCost}</span>
              </div>
              <div className="deployment-estimator__cost-row">
                <span>Compute ({costEstimate.pages} pages)</span>
                <span>${costEstimate.computeUnitCost}</span>
              </div>
              <div className="deployment-estimator__cost-row">
                <span>Bandwidth ({costEstimate.bandwidthCost > 0 ? `${bandwidth}GB` : 'Free tier'})</span>
                <span>${costEstimate.bandwidthCost}</span>
              </div>
              <div className="deployment-estimator__cost-row">
                <span>Storage</span>
                <span>${costEstimate.storageCost}</span>
              </div>
              <div className="deployment-estimator__cost-row">
                <span>Network fee buffer</span>
                <span>${costEstimate.gasFee}</span>
              </div>
              <div className="deployment-estimator__cost-divider" />
              <div className="deployment-estimator__cost-row deployment-estimator__cost-row--total">
                <span>Total</span>
                <span>${costEstimate.total}/mo</span>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Toggle */}
        <button
          className="deployment-estimator__compare-btn"
          onClick={() => setShowComparison(!showComparison)}
        >
          {showComparison ? 'Hide' : 'Compare'} Platforms
        </button>

        {/* Platform Comparison */}
        {showComparison && comparison.length > 0 && (
          <div className="deployment-estimator__comparison">
            <h4>Platform Comparison</h4>
            <div className="deployment-estimator__comparison-grid">
              {comparison.map((platform) => (
                <div key={platform.platform} className="deployment-estimator__comparison-card">
                  <div className="deployment-estimator__comparison-header">
                    <span className="deployment-estimator__comparison-name">{platform.platform}</span>
                  </div>
                  <div className="deployment-estimator__comparison-stats">
                    <div className="deployment-estimator__comparison-stat">
                      <span>Bandwidth</span>
                      <span>{platform.monthlyBandwidth} GB</span>
                    </div>
                    <div className="deployment-estimator__comparison-stat">
                      <span>Est. Cost</span>
                      <span className={platform.totalMonthly === 0 ? 'free' : ''}>
                        {platform.totalMonthly === 0 ? 'Free' : `$${platform.totalMonthly}/mo`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Notice */}
        <div className="deployment-estimator__notice">
          <Info size={14} />
          <span>
            Estimates are based on typical usage patterns. Actual costs may vary based on
            build times, serverless function usage, and network traffic.
          </span>
        </div>
      </div>
    </div>
  );
};
