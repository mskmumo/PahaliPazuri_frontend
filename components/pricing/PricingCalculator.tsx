'use client';

import { useState, useEffect } from 'react';
import { pricingApi, type AvailableCharges, type ComprehensivePricing } from '@/lib/api/pricing';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface PricingCalculatorProps {
  roomId: number;
  defaultBeds?: number;
}

export default function PricingCalculator({ roomId, defaultBeds = 1 }: PricingCalculatorProps) {
  const [availableCharges, setAvailableCharges] = useState<AvailableCharges | null>(null);
  const [pricing, setPricing] = useState<ComprehensivePricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [beds, setBeds] = useState(defaultBeds);
  const [durationType, setDurationType] = useState<'monthly' | 'semester' | 'yearly'>('monthly');
  const [selectedOneTimeCharges, setSelectedOneTimeCharges] = useState<string[]>([]);
  const [selectedRecurringCharges, setSelectedRecurringCharges] = useState<string[]>([]);

  // Load available charges on mount
  useEffect(() => {
    loadAvailableCharges();
  }, []);

  // Auto-calculate when selections change
  useEffect(() => {
    if (availableCharges && selectedOneTimeCharges.length > 0 && selectedRecurringCharges.length > 0) {
      calculatePricing();
    }
  }, [beds, durationType, selectedOneTimeCharges, selectedRecurringCharges]);

  const loadAvailableCharges = async () => {
    try {
      const response = await pricingApi.getAvailableCharges();
      if (response.success && response.data) {
        setAvailableCharges(response.data);
        // Set defaults
        setSelectedOneTimeCharges(response.data.default_one_time);
        setSelectedRecurringCharges(response.data.default_recurring);
      }
    } catch (err: any) {
      setError('Failed to load pricing options');
      console.error(err);
    }
  };

  const calculatePricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pricingApi.calculateComprehensivePricing(roomId, {
        beds,
        duration_type: durationType,
        one_time_charges: selectedOneTimeCharges,
        recurring_charges: selectedRecurringCharges,
      });

      if (response.success && response.data) {
        setPricing(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate pricing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOneTimeCharge = (chargeKey: string) => {
    setSelectedOneTimeCharges(prev =>
      prev.includes(chargeKey)
        ? prev.filter(k => k !== chargeKey)
        : [...prev, chargeKey]
    );
  };

  const toggleRecurringCharge = (chargeKey: string) => {
    setSelectedRecurringCharges(prev =>
      prev.includes(chargeKey)
        ? prev.filter(k => k !== chargeKey)
        : [...prev, chargeKey]
    );
  };

  if (!availableCharges) {
    return <div className="text-center py-8">Loading pricing options...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Calculate Your Total Cost</h3>

        <div className="space-y-4">
          {/* Beds and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="beds">Number of Beds</Label>
              <select
                id="beds"
                value={beds}
                onChange={(e) => setBeds(parseInt(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n} Bed{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <select
                id="duration"
                value={durationType}
                onChange={(e) => setDurationType(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="monthly">Monthly</option>
                <option value="semester">Semester (4 months - 5% off)</option>
                <option value="yearly">Yearly (12 months - 10% off)</option>
              </select>
            </div>
          </div>

          {/* One-Time Charges */}
          <div>
            <h4 className="font-medium mb-2">One-Time Charges (Move-In Fees)</h4>
            <div className="space-y-2">
              {Object.entries(availableCharges.one_time_charges).map(([key, charge]) => (
                <label key={key} className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOneTimeCharges.includes(key)}
                    onChange={() => toggleOneTimeCharge(key)}
                    disabled={charge.required}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {charge.name}
                        {charge.required && <span className="ml-2 text-xs text-red-500">(Required)</span>}
                        {charge.refundable && <span className="ml-2 text-xs text-green-600">✓ Refundable</span>}
                      </span>
                      <span className="text-sm text-gray-600">
                        KES {charge.default != null ? charge.default.toLocaleString() : '0'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{charge.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Recurring Charges */}
          <div>
            <h4 className="font-medium mb-2">Recurring Service Charges (Monthly)</h4>
            <div className="space-y-2">
              {Object.entries(availableCharges.recurring_charges).map(([key, charge]) => (
                <label key={key} className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRecurringCharges.includes(key)}
                    onChange={() => toggleRecurringCharge(key)}
                    disabled={charge.required}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {charge.name}
                        {charge.required && <span className="ml-2 text-xs text-red-500">(Required)</span>}
                      </span>
                      <span className="text-sm text-gray-600">
                        KES {charge.default != null ? charge.default.toLocaleString() : '0'}/month
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{charge.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing Result */}
      {loading && (
        <Card className="p-6">
          <div className="text-center py-8">Calculating pricing...</div>
        </Card>
      )}

      {error && (
        <Card className="p-6 border-red-300 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {pricing && !loading && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="text-2xl font-bold mb-6">Cost Breakdown</h3>

          {/* Room Charges */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-lg">
              <span>Room Rent ({pricing.number_of_months} month{pricing.number_of_months > 1 ? 's' : ''} × {pricing.number_of_beds} bed{pricing.number_of_beds > 1 ? 's' : ''})</span>
              <span>KES {pricing.base_room_charges.toLocaleString()}</span>
            </div>
            {pricing.discount_percentage > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Duration Discount ({pricing.discount_percentage}%)</span>
                <span>- KES {pricing.discount_applied.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Room Charges After Discount</span>
              <span>KES {pricing.room_charges_after_discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>VAT ({pricing.vat_rate}%)</span>
              <span>+ KES {pricing.vat_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Room Charges (Incl. VAT)</span>
              <span>KES {pricing.room_charges_with_vat.toLocaleString()}</span>
            </div>
          </div>

          {/* One-Time Charges */}
          {Object.keys(pricing.one_time_charges).length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3">One-Time Charges</h4>
              <div className="space-y-2 pl-4">
                {Object.entries(pricing.one_time_charges).map(([key, charge]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {charge.name}
                      {charge.refundable && <span className="ml-2 text-xs text-green-600">✓ Refundable</span>}
                    </span>
                    <span>KES {charge.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total One-Time Charges</span>
                  <span>KES {pricing.one_time_total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recurring Charges */}
          {Object.keys(pricing.recurring_charges).length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3">Recurring Charges ({pricing.number_of_months} month{pricing.number_of_months > 1 ? 's' : ''})</h4>
              <div className="space-y-2 pl-4">
                {Object.entries(pricing.recurring_charges).map(([key, charge]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {charge.name} (KES {charge.monthly_amount.toLocaleString()}/mo)
                    </span>
                    <span>KES {charge.total_amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Recurring Charges</span>
                  <span>KES {pricing.recurring_total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-4 space-y-3">
            <div className="flex justify-between text-xl font-bold text-blue-600">
              <span>TOTAL PAYABLE</span>
              <span>KES {pricing.total_payable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Refundable Deposits</span>
              <span>KES {pricing.refundable_deposits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Non-Refundable Amount</span>
              <span>KES {pricing.total_non_refundable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold bg-yellow-100 p-3 rounded">
              <span>💰 Move-In Cost (1st Month + Fees)</span>
              <span>KES {pricing.move_in_cost.toLocaleString()}</span>
            </div>
          </div>

          {/* Monthly Rent Info */}
          <div className="mt-6 p-4 bg-white rounded border">
            <p className="text-sm text-gray-600">
              <strong>Base Monthly Rent:</strong> KES {pricing.monthly_rent_before_vat.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>VAT ({pricing.vat_rate}%):</strong> KES {pricing.monthly_rent_vat.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1 font-semibold">
              <strong>Monthly Rent (Incl. VAT):</strong> KES {pricing.monthly_rent.toLocaleString()} 
              <span className="ml-2 font-normal">(KES {pricing.price_per_bed_per_month_with_vat.toLocaleString()}/bed × {pricing.number_of_beds} bed{pricing.number_of_beds > 1 ? 's' : ''})</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Monthly Service Charges:</strong> KES {pricing.recurring_monthly_total.toLocaleString()}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
