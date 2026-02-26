import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Zap, Shield, Clock, Check, AlertCircle, Wallet } from 'lucide-react';
import { feeService } from '../../services/feeService';
import type { SubscriptionPricing } from '../../types';
import './SubscriptionCheckout.css';

interface PlanDetails {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

interface SubscriptionCheckoutProps {
  plans: PlanDetails[];
  selectedPlanId: string;
  onPlanSelect: (planId: string) => void;
  onPayment: (pricing: SubscriptionPricing, paymentMethod: 'avax' | 'card') => Promise<void>;
  isProcessing?: boolean;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  plans,
  selectedPlanId,
  onPlanSelect,
  onPayment,
  isProcessing = false,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'avax' | 'card'>('avax');
  const [pricing, setPricing] = useState<SubscriptionPricing | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  useEffect(() => {
    if (selectedPlan) {
      const planPrice = billingPeriod === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
      const fee = feeService.calculateSubscriptionFees(selectedPlan.id, planPrice, billingPeriod);
      setPricing(fee);
    }
  }, [selectedPlan, billingPeriod]);

  const handlePayment = useCallback(async () => {
    if (!pricing) return;
    
    setError(null);
    try {
      await onPayment(pricing, paymentMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  }, [pricing, paymentMethod, onPayment]);

  return (
    <div className="subscription-checkout">
      <div className="subscription-checkout__header">
        <h3>Complete Your Subscription</h3>
      </div>

      <div className="subscription-checkout__content">
        {/* Plan Selection */}
        <div className="subscription-checkout__section">
          <h4>Select Plan</h4>
          <div className="subscription-checkout__plans">
            {plans.map((plan) => (
              <button
                key={plan.id}
                className={`subscription-checkout__plan-btn ${selectedPlanId === plan.id ? 'active' : ''}`}
                onClick={() => onPlanSelect(plan.id)}
              >
                <div className="subscription-checkout__plan-header">
                  <span className="subscription-checkout__plan-name">{plan.name}</span>
                  {selectedPlanId === plan.id && <Check size={16} className="check-icon" />}
                </div>
                <div className="subscription-checkout__plan-price">
                  <span className="price-amount">${billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}</span>
                  <span className="price-period">/{billingPeriod === 'yearly' ? 'year' : 'mo'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Billing Period */}
        <div className="subscription-checkout__section">
          <h4>Billing Period</h4>
          <div className="subscription-checkout__billing-options">
            <button
              className={`subscription-checkout__billing-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingPeriod('monthly')}
            >
              <Clock size={16} />
              Monthly
            </button>
            <button
              className={`subscription-checkout__billing-btn ${billingPeriod === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingPeriod('yearly')}
            >
              <Zap size={16} />
              Yearly
              <span className="save-badge">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="subscription-checkout__section">
          <h4>Payment Method</h4>
          <div className="subscription-checkout__payment-options">
            <button
              className={`subscription-checkout__payment-btn ${paymentMethod === 'avax' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('avax')}
            >
              <Wallet size={18} />
              <div className="subscription-checkout__payment-info">
                <span className="payment-name">AVAX</span>
                <span className="payment-desc">Pay with Avalanche</span>
              </div>
            </button>
            <button
              className={`subscription-checkout__payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <CreditCard size={18} />
              <div className="subscription-checkout__payment-info">
                <span className="payment-name">Card</span>
                <span className="payment-desc">Credit/Debit Card</span>
              </div>
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        {pricing && (
          <div className="subscription-checkout__breakdown">
            <h4>Price Breakdown</h4>
            <div className="subscription-checkout__lines">
              <div className="subscription-checkout__line">
                <span>{pricing.planName} Plan ({billingPeriod})</span>
                <span>${pricing.subtotal}</span>
              </div>
              <div className="subscription-checkout__line">
                <span>
                  <Shield size={14} />
                  Processing Fee (2.9% + $0.30)
                </span>
                <span>${pricing.processingFee}</span>
              </div>
              <div className="subscription-checkout__line">
                <span>
                  <Zap size={14} />
                  Network Fee Buffer
                </span>
                <span>${pricing.gasFee}</span>
              </div>
              <div className="subscription-checkout__divider" />
              <div className="subscription-checkout__line subscription-checkout__line--total">
                <span>Total</span>
                <span>${pricing.total}</span>
              </div>
            </div>
            {billingPeriod === 'yearly' && (
              <div className="subscription-checkout__yearly-note">
                Billed annually (${pricing.total.toFixed(2)})
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="subscription-checkout__error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Features List */}
        {selectedPlan && (
          <div className="subscription-checkout__features">
            <h4>Plan Features</h4>
            <ul>
              {selectedPlan.features.map((feature, index) => (
                <li key={index}>
                  <Check size={14} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="subscription-checkout__submit"
          onClick={handlePayment}
          disabled={!pricing || isProcessing}
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>
              {paymentMethod === 'avax' ? 'Pay with AVAX' : 'Pay with Card'}
              {pricing && <span className="submit-amount">${pricing.total}</span>}
            </>
          )}
        </button>

        {/* Security Note */}
        <div className="subscription-checkout__security">
          <Shield size={14} />
          <span>Secure payment powered by Stars Arena</span>
        </div>
      </div>
    </div>
  );
};
