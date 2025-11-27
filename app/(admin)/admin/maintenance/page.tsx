'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { MaintenanceRequest, Staff } from '@/lib/types/api';

export default function AdminMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.room?.room_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((r) => r.priority === priorityFilter);
    }

    return filtered;
  }, [requests, searchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API calls
        // const [requestsRes, staffRes] = await Promise.all([
        //   adminApi.getAllMaintenanceRequests(),
        //   adminApi.getAllStaff(),
        // ]);
        
        // Mock data
        setTimeout(() => {
          const mockRequests: MaintenanceRequest[] = [
            {
              id: 1,
              user_id: 1,
              room_id: 5,
              staff_id: null,
              title: 'Leaking faucet in bathroom',
              description: 'The bathroom faucet is leaking continuously',
              category: 'plumbing',
              priority: 'high',
              status: 'pending',
              scheduled_date: null,
              completed_date: null,
              estimated_cost: null,
              actual_cost: null,
              feedback: null,
              rating: null,
              images: [],
              created_at: '2024-01-20T10:00:00Z',
              updated_at: '2024-01-20T10:00:00Z',
              user: {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+254712345678',
                gender: 'male',
                id_number: null,
                date_of_birth: null,
                role: 'tenant',
                email_verified_at: null,
                notification_preferences: {
                  email_notifications: true,
                  sms_notifications: true,
                  push_notifications: true,
                  booking_updates: true,
                  payment_reminders: true,
                  maintenance_updates: true,
                  promotional_emails: false,
                },
                created_at: '2024-01-15T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z',
              },
              room: {
                id: 5,
                apartment_id: 1,
                room_number: 'R-101',
                room_type: 'single',
                base_price: 15000,
                actual_price: 15000,
                description: null,
                floor: 1,
                amenities: [],
                images: [],
                status: 'occupied',
                available_beds: 0,
                total_beds: 1,
                allowed_gender: 'any',
                has_private_bathroom: true,
                has_kitchen: false,
                is_furnished: true,
                size_sqm: null,
                condition: 'good',
                last_maintenance_date: null,
                view_quality: 'good',
                noise_level: 'moderate',
                natural_light: 'good',
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z',
              },
            },
          ];

          const mockStaff: Staff[] = [
            {
              id: 1,
              user_id: null,
              name: 'Mike Johnson',
              email: 'mike@example.com',
              phone: '+254798765432',
              specialization: 'plumbing',
              status: 'active',
              is_available: true,
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T10:00:00Z',
            },
            {
              id: 2,
              user_id: null,
              name: 'Sarah Williams',
              email: 'sarah@example.com',
              phone: '+254798765433',
              specialization: 'electrical',
              status: 'active',
              is_available: true,
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T10:00:00Z',
            },
          ];

          setRequests(mockRequests);
          setStaff(mockStaff);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignStaff = async (requestId: number, staffId: number) => {
    try {
      // TODO: Implement API call with requestId and staffId parameters
      // await adminApi.assignMaintenanceStaff(requestId, staffId);
      console.log('Assigning staff:', { requestId, staffId });
      alert('Staff assigned successfully');
      // TODO: Refresh data after assignment
      // fetchData();
    } catch (error) {
      console.error('Failed to assign staff:', error);
      alert('Failed to assign staff');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Maintenance Management</h1>
        <p className="text-gray-600 mt-2">View and assign maintenance tasks to staff</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredRequests.length} of {requests.length} requests
        </p>
      </div>

      {/* Maintenance Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No maintenance requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Room</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Tenant</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Assigned To</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{request.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {request.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {request.room?.room_number}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {request.user?.name}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant="outline">{request.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {request.staff ? (
                          <span className="text-green-600">{request.staff.name}</span>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/maintenance/${request.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {!request.staff_id && request.status === 'pending' && (
                            <div className="relative group">
                              <Button variant="outline" size="sm">
                                <UserPlus className="h-4 w-4" />
                              </Button>
                              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 hidden group-hover:block">
                                <div className="p-2">
                                  <p className="text-xs font-semibold text-gray-700 mb-2">
                                    Assign to:
                                  </p>
                                  {staff.map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() => handleAssignStaff(request.id, s.id)}
                                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                                    >
                                      {s.name}
                                      <span className="text-xs text-gray-500 block">
                                        {s.specialization}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
