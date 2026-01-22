'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Download, 
  Eye, 
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { Payment } from '@/lib/types/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    return filtered;
  }, [payments, searchQuery, statusFilter]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API call
        // const response = await adminApi.getAllPayments();
        
        // Mock data
        setTimeout(() => {
          const mockPayments: Payment[] = [
            {
              id: 1,
              booking_id: 1,
              user_id: 1,
              amount: 27000,
              payment_method: 'mpesa',
              payment_type: 'full',
              transaction_id: 'MPX123456789',
              mpesa_receipt_number: 'MPX123456789',
              pesapal_tracking_id: null,
              payment_date: '2024-01-15T10:00:00Z',
              status: 'completed',
              notes: null,
              created_at: '2024-01-15T10:00:00Z',
              updated_at: '2024-01-15T10:00:00Z',
            },
            {
              id: 2,
              booking_id: 2,
              user_id: 2,
              amount: 15000,
              payment_method: 'bank_transfer',
              payment_type: 'deposit',
              transaction_id: 'BT987654321',
              mpesa_receipt_number: null,
              pesapal_tracking_id: null,
              payment_date: '2024-01-16T10:00:00Z',
              status: 'pending',
              notes: null,
              created_at: '2024-01-16T10:00:00Z',
              updated_at: '2024-01-16T10:00:00Z',
            },
          ];
          setPayments(mockPayments);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTotalRevenue = () => {
    return payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-lg text-muted-foreground font-medium">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground text-lg">Track and manage all payments</p>
        </div>
        <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Total Revenue</CardDescription>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-green-600">
                KES {getTotalRevenue().toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === 'completed').length} completed transactions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Pending Payments</CardDescription>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-yellow-600">
                {payments.filter((p) => p.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">
                KES {getPendingAmount().toLocaleString()} pending
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Total Transactions</CardDescription>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-purple-600">{payments.length}</p>
              <p className="text-xs text-muted-foreground">
                All time payments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters - Enhanced */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                aria-label="Filter by payment status"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredPayments.length}</span> of <span className="font-semibold text-foreground">{payments.length}</span> payments
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payments List - Card View (More Modern) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Payments</h2>
        </div>
        
        {filteredPayments.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No payments found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Payments will appear here once transactions are made'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-lg">KES {payment.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          Transaction ID: {payment.transaction_id}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3.5 w-3.5" />
                            {payment.payment_method.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/payments/${payment.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

