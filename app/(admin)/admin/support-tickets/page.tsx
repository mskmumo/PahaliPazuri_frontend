'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  Ticket, 
  Clock, 
  User, 
  Mail, 
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Filter,
  X
} from 'lucide-react';

interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  resolved_at: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

interface Statistics {
  total: number;
  open: number;
  in_progress: number;
  waiting_response: number;
  resolved: number;
  closed: number;
}

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchStatistics();
  }, [statusFilter, categoryFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/support-tickets`;
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(data.data || []);
      } else {
        // Mock data fallback
        setTickets([
          {
            id: 1,
            ticket_number: 'TKT-20250121-ABC1',
            subject: 'Room heating not working',
            message: 'The heating in my room has stopped working. It has been very cold at night.',
            category: 'room_issue',
            priority: 'high',
            status: 'open',
            admin_response: null,
            responded_at: null,
            resolved_at: null,
            created_at: new Date().toISOString(),
            user: { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+254712345678' },
          },
          {
            id: 2,
            ticket_number: 'TKT-20250120-DEF2',
            subject: 'Question about monthly billing',
            message: 'I would like to understand how the monthly billing cycle works.',
            category: 'billing',
            priority: 'medium',
            status: 'in_progress',
            admin_response: null,
            responded_at: null,
            resolved_at: null,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            user: { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+254723456789' },
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support-tickets/statistics`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStatistics(data.data);
      } else {
        setStatistics({ total: 2, open: 1, in_progress: 1, waiting_response: 0, resolved: 0, closed: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleRespond = async () => {
    if (!selectedTicket || !response.trim()) return;

    try {
      setResponding(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support-tickets/${selectedTicket.id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        alert('Response sent successfully!');
        setResponse('');
        fetchTickets();
        setSelectedTicket(null);
      } else {
        alert('Failed to send response');
      }
    } catch (err) {
      console.error('Failed to respond:', err);
      alert('Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const handleUpdateStatus = async (ticketId: number, status: string) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support-tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchTickets();
        fetchStatistics();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'waiting_response':
        return <Badge className="bg-purple-500">Waiting Response</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-500">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-500">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      billing: 'Billing',
      room_issue: 'Room Issue',
      booking: 'Booking',
      maintenance: 'Maintenance',
      general: 'General',
      complaint: 'Complaint',
      feedback: 'Feedback',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600 mt-2">Manage support requests from tenants</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 uppercase">Total</p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 uppercase">Open</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.open}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.in_progress}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 uppercase">Waiting</p>
              <p className="text-2xl font-bold text-purple-600">{statistics.waiting_response}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 uppercase">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{statistics.resolved}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-gray-400">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 uppercase">Closed</p>
              <p className="text-2xl font-bold text-gray-600">{statistics.closed}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 border rounded-md bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_response">Waiting Response</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 border rounded-md bg-background text-sm"
            >
              <option value="all">All Categories</option>
              <option value="billing">Billing</option>
              <option value="room_issue">Room Issue</option>
              <option value="booking">Booking</option>
              <option value="maintenance">Maintenance</option>
              <option value="general">General</option>
              <option value="complaint">Complaint</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tickets ({tickets.length})</h2>
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Tickets Found</h3>
                <p className="text-gray-600">No support tickets match your filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-xs text-gray-500">#{ticket.ticket_number}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ticket.user.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(ticket.category)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div>
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">#{selectedTicket.ticket_number}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  <Badge variant="outline">{getCategoryLabel(selectedTicket.category)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tenant Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Tenant Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedTicket.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${selectedTicket.user.email}`} className="text-blue-600 hover:underline">
                        {selectedTicket.user.email}
                      </a>
                    </div>
                    {selectedTicket.user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${selectedTicket.user.phone}`} className="text-blue-600 hover:underline">
                          {selectedTicket.user.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="font-medium mb-2">Message</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">{selectedTicket.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Previous Response */}
                {selectedTicket.admin_response && (
                  <div>
                    <h4 className="font-medium mb-2">Previous Response</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="whitespace-pre-wrap text-sm">{selectedTicket.admin_response}</p>
                      {selectedTicket.responded_at && (
                        <p className="text-xs text-blue-600 mt-2">
                          Responded: {new Date(selectedTicket.responded_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                <div>
                  <h4 className="font-medium mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedTicket.status === status ? 'default' : 'outline'}
                        onClick={() => handleUpdateStatus(selectedTicket.id, status)}
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Response Form */}
                {selectedTicket.status !== 'closed' && (
                  <div>
                    <h4 className="font-medium mb-2">Send Response</h4>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response to the tenant..."
                      rows={4}
                    />
                    <Button
                      className="mt-3 gap-2"
                      onClick={handleRespond}
                      disabled={!response.trim() || responding}
                    >
                      {responding ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Response
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Ticket</h3>
                <p className="text-gray-600">Click on a ticket to view details and respond</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
