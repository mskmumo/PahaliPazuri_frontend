'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import type { Booking } from '@/lib/types/api';

interface MpesaPaymentFormProps {
  booking: Booking;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MpesaPaymentForm({ booking, onSuccess, onCancel }: MpesaPaymentFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(booking.total_amount.toString());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState('');

  const formatPhoneNumber = (value: string) => {
    // Remove any non-digit characters
    let cleaned = value.replace(/\D/g, '');
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // If doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (formattedPhone.length !== 12) {
      setMessage('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    try {
      setLoading(true);
      setStatus('processing');
      setMessage('Sending STK push to your phone...');

      const response = await paymentsApi.initiateMpesa({
        booking_id: booking.id,
        phone_number: formattedPhone,
        amount: parseFloat(amount),
        payment_type: 'full',
      });

      if (response.success) {
        setMessage('Payment request sent! Please check your phone and enter your M-Pesa PIN.');
        
        // Poll for payment status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await paymentsApi.getByBookingId(booking.id);
            const latestPayment = statusResponse.data?.[0];
            
            if (latestPayment?.status === 'completed') {
              clearInterval(pollInterval);
              setStatus('success');
              setMessage('Payment successful!');
              setTimeout(() => {
                onSuccess();
              }, 2000);
            } else if (latestPayment?.status === 'failed') {
              clearInterval(pollInterval);
              setStatus('failed');
              setMessage('Payment failed. Please try again.');
              setLoading(false);
            }
          } catch (err) {
            console.error('Error polling payment status:', err);
          }
        }, 3000);

        // Stop polling after 90 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          if (status === 'processing') {
            setStatus('failed');
            setMessage('Payment timeout. Please check your payment history or try again.');
            setLoading(false);
          }
        }, 90000);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setStatus('failed');
      setMessage(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">M-Pesa STK Push</h4>
            <p className="text-sm text-blue-700">
              Enter your M-Pesa registered phone number. You&apos;ll receive a prompt on your phone to complete the payment.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0712345678 or 254712345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={loading}
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter your Safaricom M-Pesa phone number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (KES)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
          required
          min="1"
        />
        <p className="text-xs text-muted-foreground">
          Total due: KES {booking.total_amount.toLocaleString()}
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-md flex items-start gap-2 ${
          status === 'success' ? 'bg-green-50 text-green-800' :
          status === 'failed' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {status === 'success' && <CheckCircle2 className="h-5 w-5 mt-0.5" />}
          {status === 'failed' && <XCircle className="h-5 w-5 mt-0.5" />}
          {status === 'processing' && <Loader2 className="h-5 w-5 mt-0.5 animate-spin" />}
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Smartphone className="mr-2 h-4 w-4" />
              Pay with M-Pesa
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center pt-2">
        <p>By proceeding, you agree to the payment terms and conditions.</p>
      </div>
    </form>
  );
}
