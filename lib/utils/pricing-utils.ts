/**
 * Pricing Utilities
 * 
 * Centralized utilities for pricing calculations and display.
 * All pricing should flow from the backend PricingService through these utilities.
 */

import { formatCurrency } from './api-helpers';

export interface PricingSummary {
    price_per_bed_per_month: number;
    monthly_rent: number;
    security_deposit: number;
    registration_fee: number;
    cleaning_fee_monthly: number;
    estimated_move_in_cost: number;
}

export interface ComprehensivePricing {
    base_room_charges: number;
    discount_applied: number;
    discount_percentage: number;
    room_charges_after_discount: number;
    vat_amount: number;
    vat_rate: number;
    room_charges_with_vat: number;
    price_per_bed_per_month: number;
    price_per_bed_per_month_with_vat: number;
    number_of_beds: number;
    number_of_months: number;
    duration_type: string;
    monthly_rent: number;
    monthly_rent_before_vat: number;
    monthly_rent_vat: number;
    one_time_total: number;
    refundable_deposits: number;
    recurring_monthly_total: number;
    recurring_total: number;
    subtotal: number;
    total_payable: number;
    total_non_refundable: number;
    move_in_cost: number;
}

/**
 * Get move-in cost from comprehensive pricing
 */
export function getMoveInCost(pricing: ComprehensivePricing | null): number {
    if (!pricing) return 0;
    return pricing.move_in_cost;
}

/**
 * Get monthly total (rent + recurring fees)
 */
export function getMonthlyTotal(pricing: ComprehensivePricing | null): number {
    if (!pricing) return 0;
    return pricing.monthly_rent + pricing.recurring_monthly_total;
}

/**
 * Get total for booking period
 */
export function getBookingTotal(pricing: ComprehensivePricing | null): number {
    if (!pricing) return 0;
    return pricing.total_payable;
}

/**
 * Format move-in cost breakdown for display
 */
export function formatMoveInBreakdown(pricing: ComprehensivePricing | null): {
    firstMonthRent: string;
    securityDeposit: string;
    registrationFee: string;
    cleaningFee: string;
    total: string;
} | null {
    if (!pricing) return null;

    return {
        firstMonthRent: formatCurrency(pricing.monthly_rent),
        securityDeposit: formatCurrency(pricing.refundable_deposits),
        registrationFee: formatCurrency(pricing.one_time_total - pricing.refundable_deposits),
        cleaningFee: formatCurrency(pricing.recurring_monthly_total),
        total: formatCurrency(pricing.move_in_cost),
    };
}

/**
 * Format pricing for quick display
 */
export function formatQuickPrice(pricePerMonth: number): string {
    return `${formatCurrency(pricePerMonth)}/mo`;
}

/**
 * Calculate estimated move-in from room data (fallback when API not available)
 */
export function estimateMoveInCost(
    monthlyRent: number,
    securityDepositPercentage: number = 100,
    registrationFee: number = 1000,
    cleaningFee: number = 300
): number {
    const securityDeposit = (monthlyRent * securityDepositPercentage) / 100;
    return monthlyRent + securityDeposit + registrationFee + cleaningFee;
}

// ============================================
// PRORATION-BASED RENTAL COST CALCULATOR
// ============================================

export type PaymentPlanType = 'monthly' | 'upfront';

export interface RentalCostBreakdown {
    daysInMonth: number;
    activeDays: number;
    dailyRate: number;
    proratedFirstMonth: number;
    remainingMonthsCost: number;
}

export interface RentalCosts {
    deposit: number;
    fees: number;
    totalMoveInCost: number;
    nextMonthlyPayment: number;
    monthlyRent: number;
    monthlyServiceCharges: number;
}

export interface RentalCostResult {
    breakdown: RentalCostBreakdown;
    costs: RentalCosts;
    nextPaymentDate: string;
    nextPaymentAmount: number;
}

/**
 * Calculates rental costs including proration and move-in fees.
 * 
 * @param baseRent - The standard monthly rent (e.g., 12000)
 * @param deposit - The security deposit amount
 * @param oneTimeFees - Service fees or administrative costs
 * @param moveInDateStr - The move-in date string (e.g., "2023-11-20")
 * @param durationMonths - Total duration of stay in months (e.g., 6)
 * @param planType - "monthly" or "upfront"
 * @param monthlyServiceCharges - Recurring monthly charges (cleaning, utilities, etc.)
 */
export function calculateRentalCosts(
    baseRent: number,
    deposit: number,
    oneTimeFees: number,
    moveInDateStr: string,
    durationMonths: number,
    planType: PaymentPlanType = 'monthly',
    monthlyServiceCharges: number = 0
): RentalCostResult {
    // 1. Setup Dates
    const moveInDate = new Date(moveInDateStr);
    const moveInYear = moveInDate.getFullYear();
    const moveInMonth = moveInDate.getMonth(); // 0-indexed (0 is Jan)
    const moveInDay = moveInDate.getDate();

    // 2. Calculate Proration (First partial month)
    // Get total days in the specific move-in month (28, 30, or 31)
    const daysInMonth = new Date(moveInYear, moveInMonth + 1, 0).getDate();

    // Calculate how many days they will actually stay in that first month
    // We add +1 to include the move-in day itself
    const activeDays = (daysInMonth - moveInDay) + 1;

    // Calculate daily rate and the prorated cost
    const dailyRate = baseRent / daysInMonth;
    let proratedFirstMonth = activeDays * dailyRate;

    // Round to nearest whole number for KES
    proratedFirstMonth = Math.round(proratedFirstMonth);

    // 3. Calculate Total Move-in Cost based on Plan
    let totalMoveInCost = 0;
    let nextMonthlyPayment = 0;
    let remainingMonthsCost = 0;

    if (planType === 'monthly') {
        // User pays: First Prorated Month + Deposit + Fees + First Month Service Charges
        totalMoveInCost = proratedFirstMonth + deposit + oneTimeFees + monthlyServiceCharges;

        // Next month, they pay the standard rent + service charges
        nextMonthlyPayment = baseRent + monthlyServiceCharges;

    } else if (planType === 'upfront') {
        // User pays: Prorated 1st Month + Remaining Full Months + Deposit + Fees + All Service Charges
        // Note: durationMonths - 1 because the first month is the prorated one
        remainingMonthsCost = baseRent * (durationMonths - 1);
        const totalServiceCharges = monthlyServiceCharges * durationMonths;

        totalMoveInCost = proratedFirstMonth + remainingMonthsCost + deposit + oneTimeFees + totalServiceCharges;

        // No recurring payment because they paid it all upfront
        nextMonthlyPayment = 0;
    }

    // 4. Calculate next payment date (1st of next month or same day next month)
    const nextPaymentDate = new Date(moveInYear, moveInMonth + 1, 1);
    const nextPaymentDateStr = nextPaymentDate.toISOString().split('T')[0];

    // 5. Return formatted result
    return {
        breakdown: {
            daysInMonth,
            activeDays,
            dailyRate: Math.round(dailyRate * 100) / 100,
            proratedFirstMonth,
            remainingMonthsCost,
        },
        costs: {
            deposit,
            fees: oneTimeFees,
            totalMoveInCost,
            nextMonthlyPayment,
            monthlyRent: baseRent,
            monthlyServiceCharges,
        },
        nextPaymentDate: nextPaymentDateStr,
        nextPaymentAmount: nextMonthlyPayment,
    };
}

/**
 * Calculate prorated amount for a partial month
 */
export function calculateProratedRent(
    monthlyRent: number,
    moveInDateStr: string
): { proratedAmount: number; activeDays: number; daysInMonth: number } {
    const moveInDate = new Date(moveInDateStr);
    const moveInYear = moveInDate.getFullYear();
    const moveInMonth = moveInDate.getMonth();
    const moveInDay = moveInDate.getDate();

    const daysInMonth = new Date(moveInYear, moveInMonth + 1, 0).getDate();
    const activeDays = (daysInMonth - moveInDay) + 1;
    const dailyRate = monthlyRent / daysInMonth;
    const proratedAmount = Math.round(activeDays * dailyRate);

    return { proratedAmount, activeDays, daysInMonth };
}

/**
 * Get the next payment due date based on move-in date
 */
export function getNextPaymentDate(moveInDateStr: string): Date {
    const moveInDate = new Date(moveInDateStr);
    return new Date(moveInDate.getFullYear(), moveInDate.getMonth() + 1, 1);
}

/**
 * Format a date for display
 */
export function formatPaymentDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
