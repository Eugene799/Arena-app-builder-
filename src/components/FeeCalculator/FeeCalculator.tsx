import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, Fuel, Clock, Zap, AlertCircle, Info } from 'lucide-react';
import { feeService } from '../../services/feeService';
import type { GasPriceOption, TransactionFee } from '../../types';
import './FeeCalculator.css';

interface FeeCalculatorProps {
  onClose?: () => void;
  defaultGasLimit?: number;
}

export const FeeCalculator: React.FC<FeeCalculatorProps> = ({
  onClose,
  defaultGasLimit = 21000,
}) => {
  const [selectedSpeed, setSelectedSpeed] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [gasLimit, setGasLimit] = useState(defaultGasLimit);
  const [customGasPrice, setCustomGasPrice] = useState<number | ''>('');
  const [currentFee, setCurrentFee] = useState<TransactionFee | null>(null);
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [isLoadingGas, setIsLoadingGas] = useState(false);

  const gasOptions: GasPriceOption[] = feeService.getGasPriceOptions();
  const networkFees = feeService.getNetworkFees();

  useEffect(() => {
    const fetchGasPrice = async () => {
      setIsLoadingGas(true);
      try {
        const gasPrice = await feeService.getGasPrice();
        const option = gasOptions.find(o => o.id === selectedSpeed);
        const price = useCustomPrice && customGasPrice 
          ? customGasPrice 
          : option?.priceInGwei || gasPrice.standard;
        
        const fee = feeService.calculateTransactionFee(price, gasLimit);
        setCurrentFee(fee);
      } catch (error) {
        console.error('Failed to fetch gas price:', error);
      } finally {
        setIsLoadingGas(false);
      }
    };

    fetchGasPrice();
  }, [selectedSpeed, gasLimit, customGasPrice, useCustomPrice]);

  const handleSpeedChange = useCallback((speed: 'slow' | 'standard' | 'fast') => {
    setSelectedSpeed(speed);
    setUseCustomPrice(false);
    setCustomGasPrice('');
  }, []);

  const handleCustomPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setCustomGasPrice('');
      setUseCustomPrice(false);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        setCustomGasPrice(numValue);
        setUseCustomPrice(true);
      }
    }
  }, []);

  const handleGasLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setGasLimit(value);
    }
  }, []);

  return (
    <div className="fee-calculator">
      <div className="fee-calculator__header">
        <Calculator size={20} />
        <h3>Transaction Fee Calculator</h3>
        {onClose && (
          <button className="fee-calculator__close" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="fee-calculator__content">
        {/* Gas Speed Selection */}
        <div className="fee-calculator__section">
          <h4>
            <Fuel size={16} />
            Transaction Speed
          </h4>
          <div className="fee-calculator__speed-options">
            {gasOptions.map((option) => (
              <button
                key={option.id}
                className={`fee-calculator__speed-btn ${selectedSpeed === option.id ? 'active' : ''}`}
                onClick={() => handleSpeedChange(option.id)}
              >
                <div className="fee-calculator__speed-header">
                  <span className="fee-calculator__speed-label">{option.label}</span>
                  <span className="fee-calculator__speed-price">{option.priceInGwei} Gwei</span>
                </div>
                <div className="fee-calculator__speed-time">
                  <Clock size={12} />
                  {option.estimatedTime}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Gas Price */}
        <div className="fee-calculator__section">
          <h4>
            <Zap size={16} />
            Custom Gas Price
          </h4>
          <div className="fee-calculator__custom-input">
            <input
              type="number"
              value={customGasPrice}
              onChange={handleCustomPriceChange}
              placeholder="Enter custom Gwei"
              min="0"
              step="0.1"
            />
            <span className="fee-calculator__custom-unit">Gwei</span>
          </div>
          <div className="fee-calculator__quick-prices">
            <span className="fee-calculator__quick-label">Quick select:</span>
            {Object.entries(networkFees).map(([level, _]) => (
              <button
                key={level}
                className="fee-calculator__quick-btn"
                onClick={() => {
                  const prices = { low: 20, medium: 30, high: 50 };
                  setCustomGasPrice(prices[level as keyof typeof prices]);
                  setUseCustomPrice(true);
                }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Gas Limit */}
        <div className="fee-calculator__section">
          <h4>
            <Info size={16} />
            Gas Limit
          </h4>
          <div className="fee-calculator__gas-limit">
            <input
              type="number"
              value={gasLimit}
              onChange={handleGasLimitChange}
              min="21000"
              step="1000"
            />
            <span className="fee-calculator__gas-limit-unit">units</span>
          </div>
          <div className="fee-calculator__gas-presets">
            <button onClick={() => setGasLimit(21000)}>ETH Transfer (21k)</button>
            <button onClick={() => setGasLimit(65000)}>Token Transfer (65k)</button>
            <button onClick={() => setGasLimit(100000)}>Contract (100k)</button>
          </div>
        </div>

        {/* Fee Summary */}
        {currentFee && (
          <div className="fee-calculator__summary">
            <h4>Estimated Fee</h4>
            <div className="fee-calculator__fee-display">
              <div className="fee-calculator__fee-row">
                <span>Gas Price</span>
                <span>{useCustomPrice ? customGasPrice : gasOptions.find(o => o.id === selectedSpeed)?.priceInGwei} Gwei</span>
              </div>
              <div className="fee-calculator__fee-row">
                <span>Gas Limit</span>
                <span>{gasLimit.toLocaleString()} units</span>
              </div>
              <div className="fee-calculator__fee-divider" />
              <div className="fee-calculator__fee-row fee-calculator__fee-row--total">
                <span>Total</span>
                <span>
                  <strong>{currentFee.totalInAvax} AVAX</strong>
                  <span className="fee-calculator__fee-usd">(≈ ${currentFee.totalInUsd})</span>
                </span>
              </div>
            </div>
            <div className="fee-calculator__notice">
              <AlertCircle size={14} />
              <span>Fees may vary based on network conditions</span>
            </div>
          </div>
        )}

        {isLoadingGas && (
          <div className="fee-calculator__loading">
            Fetching current gas prices...
          </div>
        )}
      </div>
    </div>
  );
};
