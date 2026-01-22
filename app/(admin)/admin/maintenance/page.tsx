'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, UserPlus, Wrench, Clock, CheckCircle2, AlertCircle, AlertTriangle, Filter, Home, User, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { MaintenanceRequest, Staff } from '@/lib/types/api';

export default function AdminMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignMenuOpen, setAssignMenuOpen] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);
  const assignMenuRef = useRef<HTMLDivElement>(null);

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
                room_code: 'PP-R-101-G',
                floor_code: 'G',
                floor_number: 1,
                room_type: 'private',
                bed_type: 'single',
                total_beds: 1,
                available_beds: 0,
                description: null,
                price_per_night: 500,
                price_per_month: 15000,
                price_per_bed_night: 500,
                price_per_bed_month: 15000,
                base_price_per_bed_month: 15000,
                size_sqm: null,
                max_occupancy: 1,
                amenities: [],
                images: [],
                status: 'occupied',
                is_furnished: true,
                furnishing_details: null,
                gender_type: 'mixed',
                sharing_type: 'single',
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z',
                base_price: 15000,
                actual_price: 15000,
                floor: 1,
                allowed_gender: 'any',
                has_private_bathroom: true,
                has_kitchen: false,
                condition: 'good',
                last_maintenance_date: null,
                view_quality: 'good',
                noise_level: 'moderate',
                natural_light: 'good',
              },
            },
            {
              id: 2,
              user_id: 2,
              room_id: 8,
              staff_id: 1,
              title: 'Broken air conditioner',
              description: 'Air conditioner not cooling properly',
              category: 'electrical',
              priority: 'medium',
              status: 'in_progress',
              scheduled_date: '2024-01-25T10:00:00Z',
              completed_date: null,
              estimated_cost: 5000,
              actual_cost: null,
              feedback: null,
              rating: null,
              images: [],
              created_at: '2024-01-22T10:00:00Z',
              updated_at: '2024-01-23T10:00:00Z',
              user: {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+254723456789',
                gender: 'female',
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
                created_at: '2024-01-18T10:00:00Z',
                updated_at: '2024-01-18T10:00:00Z',
              },
              room: {
                id: 8,
                apartment_id: 1,
                room_number: 'R-205',
                room_code: 'PP-R-205-2',
                floor_code: '2',
                floor_number: 2,
                room_type: 'private',
                bed_type: 'double_decker_2',
                total_beds: 1,
                available_beds: 0,
                description: null,
                price_per_night: 600,
                price_per_month: 18000,
                price_per_bed_night: 600,
                price_per_bed_month: 18000,
                base_price_per_bed_month: 18000,
                size_sqm: null,
                max_occupancy: 1,
                amenities: [],
                images: [],
                status: 'occupied',
                is_furnished: true,
                furnishing_details: null,
                gender_type: 'female_only',
                sharing_type: 'single',
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-20T10:00:00Z',
                base_price: 18000,
                actual_price: 18000,
                floor: 2,
                allowed_gender: 'female',
                has_private_bathroom: true,
                has_kitchen: true,
                condition: 'excellent',
                last_maintenance_date: null,
                view_quality: 'excellent',
                noise_level: 'quiet',
                natural_light: 'excellent',
              },
              staff: {
                id: 1,
                user_id: 10,
                name: 'John Technician',
                email: 'john.tech@example.com',
                phone: '+254712345678',
                specialization: 'Electrical',
                status: 'active',
                is_available: true,
                created_at: '2024-01-10T10:00:00Z',
                updated_at: '2024-01-23T10:00:00Z',
              },
            },
          ];

          const mockStaff: Staff[] = [
            {
              id: 1,
              user_id: 10,
              name: 'John Technician',
              email: 'john.tech@example.com',
              phone: '+254712345678',
              specialization: 'Electrical',
              status: 'active',
              is_available: true,
              created_at: '2024-01-10T10:00:00Z',
              updated_at: '2024-01-23T10:00:00Z',
            },
            {
              id: 2,
              user_id: 11,
              name: 'Mary Plumber',
              email: 'mary.plumber@example.com',
              phone: '+254722345678',
              specialization: 'Plumbing',
              status: 'active',
              is_available: true,
              created_at: '2024-01-10T10:00:00Z',
              updated_at: '2024-01-23T10:00:00Z',
            },
            {
              id: 3,
              user_id: 12,
              name: 'Peter Handyman',
              email: 'peter.handyman@example.com',
              phone: '+254732345678',
              specialization: 'General',
              status: 'active',
              is_available: false,
              created_at: '2024-01-10T10:00:00Z',
              updated_at: '2024-01-23T10:00:00Z',
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

  // Close assign menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assignMenuRef.current && !assignMenuRef.current.contains(event.target as Node)) {
        setAssignMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAssignStaff = async (requestId: number, staffId: number, staffName: string) => {
    try {
      setAssigning(true);
      
      // SECURITY CHECK: Verify the request is not already assigned
      const targetRequest = requests.find(r => r.id === requestId);
      if (!targetRequest) {
        alert('Error: Maintenance request not found');
        return;
      }
      
      if (targetRequest.staff_id) {
        alert('Security Error: This maintenance request has already been assigned to a staff member. A request cannot be assigned to multiple staff members.');
        setAssignMenuOpen(null);
        return;
      }
      
      if (targetRequest.status !== 'pending') {
        alert('Error: Only pending requests can be assigned to staff.');
        setAssignMenuOpen(null);
        return;
      }
      
      // TODO: Implement API call
      // await adminApi.assignMaintenanceStaff(requestId, staffId);
      console.log('Assigning staff:', staffId, 'to request:', requestId);
      
      // Update local state to reflect the assignment
      setRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            staff_id: staffId,
            status: 'in_progress' as const,
            staff: staff.find(s => s.id === staffId)
          };
        }
        return req;
      }));
      
      setAssignMenuOpen(null);
      alert(`Successfully assigned ${staffName} to this maintenance request`);
    } catch (error) {
      console.error('Failed to assign staff:', error);
      alert('Failed to assign staff');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-lg text-muted-foreground font-medium">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {requests.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">
                  {requests.filter((r) => r.status === 'in_progress').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {requests.filter((r) => r.status === 'completed').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-purple-600">{requests.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-11 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full h-11 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              aria-label="Filter by priority"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredRequests.length}</span> of <span className="font-semibold text-foreground">{requests.length}</span> requests
            </p>
            {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Maintenance Requests</h2>
        </div>

        {filteredRequests.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Wrench className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No maintenance requests found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your filters' 
                      : 'All systems operational'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-lg">{request.title}</h3>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge className={getPriorityColor(request.priority)}>
                              {getPriorityIcon(request.priority)}
                              <span className="ml-1">{request.priority}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Category: <span className="font-medium capitalize">{request.category}</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{request.user?.name}</p>
                            <p className="text-xs text-muted-foreground">Tenant</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Room {request.room?.room_number}</p>
                            <p className="text-xs text-muted-foreground">Floor {request.room?.floor_number}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(request.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">Reported</p>
                          </div>
                        </div>
                      </div>

                      {request.estimated_cost && (
                        <div className="flex items-center gap-4 pt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Estimated Cost</p>
                            <p className="text-sm font-semibold">KES {request.estimated_cost.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-row lg:flex-col items-center gap-2">
                      <Link href={`/admin/maintenance/${request.id}`} className="w-full lg:w-auto">
                        <Button variant="outline" size="sm" className="gap-2 w-full">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      {request.status === 'pending' && !request.staff_id && (
                        <div className="relative w-full lg:w-auto" ref={assignMenuOpen === request.id ? assignMenuRef : null}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAssignMenuOpen(assignMenuOpen === request.id ? null : request.id)}
                            disabled={assigning}
                            className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full lg:w-auto"
                          >
                            <UserPlus className="h-4 w-4" />
                            Assign Staff
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          
                          {assignMenuOpen === request.id && (
                            <div className="absolute right-0 top-full mt-1 w-64 bg-white border rounded-lg shadow-lg z-20">
                              <div className="p-2">
                                <div className="flex items-center justify-between px-3 py-2 border-b mb-2">
                                  <p className="text-xs font-semibold text-gray-700">Select Staff Member</p>
                                  <button 
                                    onClick={() => setAssignMenuOpen(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                {staff.filter(s => s.status === 'active').length === 0 ? (
                                  <p className="text-sm text-gray-500 px-3 py-2">No active staff available</p>
                                ) : (
                                  staff.filter(s => s.status === 'active').map((s) => {
                                    // Count how many requests are assigned to this staff member
                                    const assignedCount = requests.filter(r => r.staff_id === s.id && r.status === 'in_progress').length;
                                    return (
                                      <button
                                        key={s.id}
                                        onClick={() => handleAssignStaff(request.id, s.id, s.name)}
                                        disabled={assigning}
                                        className="block w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="font-medium text-gray-900">{s.name}</div>
                                          {assignedCount > 0 && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                              {assignedCount} task{assignedCount > 1 ? 's' : ''}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize">{s.specialization}</div>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {request.staff_id && request.staff && (
                        <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {request.staff.name}
                        </div>
                      )}
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

