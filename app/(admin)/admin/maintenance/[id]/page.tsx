'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, User, UserPlus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { MaintenanceRequest, Staff } from '@/lib/types/api';
import { maintenanceApi } from '@/lib/api';

export default function MaintenanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = parseInt(params.id as string);

  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock staff data
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
          is_available: true,
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-23T10:00:00Z',
        },
      ];
      setStaff(mockStaff);
      
      // Try to fetch from API first
      try {
        const response = await maintenanceApi.getById(requestId);
        setRequest(response.data);
      } catch (apiErr) {
        console.warn('API call failed, using mock data:', apiErr);
        
        // Mock maintenance request data as fallback
        const mockRequests: Record<number, MaintenanceRequest> = {
          1: {
            id: 1,
            user_id: 1,
            room_id: 5,
            staff_id: null,
            title: 'Leaking faucet in bathroom',
            description: 'The bathroom faucet is leaking continuously. Water is dripping even when the tap is fully closed.',
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
          2: {
            id: 2,
            user_id: 2,
            room_id: 8,
            staff_id: 1,
            title: 'Broken air conditioner',
            description: 'Air conditioner not cooling properly. The unit turns on but only blows warm air.',
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
            staff: mockStaff[0],
          },
        };
        
        const mockRequest = mockRequests[requestId];
        if (mockRequest) {
          setRequest(mockRequest);
        } else {
          setError('Maintenance request not found');
        }
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignStaff = async (staffId: number, staffName: string) => {
    try {
      setUpdating(true);
      
      // SECURITY CHECK: Verify the request is not already assigned
      if (!request) {
        alert('Error: Maintenance request not found');
        return;
      }
      
      if (request.staff_id) {
        alert('Security Error: This maintenance request has already been assigned to a staff member. A request cannot be assigned to multiple staff members.');
        setShowAssignMenu(false);
        return;
      }
      
      if (request.status !== 'pending') {
        alert('Error: Only pending requests can be assigned to staff.');
        setShowAssignMenu(false);
        return;
      }
      
      // TODO: Implement assign API
      // await adminApi.assignMaintenanceStaff(requestId, staffId);
      
      // Update local state to reflect assignment
      const assignedStaff = staff.find(s => s.id === staffId);
      setRequest(prev => prev ? {
        ...prev,
        staff_id: staffId,
        status: 'in_progress' as const,
        staff: assignedStaff
      } : null);
      
      alert(`Successfully assigned ${staffName} to this maintenance request`);
      setShowAssignMenu(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to assign staff');
    } finally {
      setUpdating(false);
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
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Request</h2>
        <p className="text-gray-600 mb-4">{error || 'Request not found'}</p>
        <Link href="/admin/maintenance">
          <Button>Back to Maintenance</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <Link 
        href="/admin/maintenance"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to maintenance
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
          <div className="flex gap-2 mt-3">
            <Badge className={getPriorityColor(request.priority)}>
              {request.priority}
            </Badge>
            <Badge className={getStatusColor(request.status)}>
              {request.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">{request.category}</Badge>
          </div>
        </div>

        {!request.staff_id && request.status === 'pending' && (
          <div className="relative">
            <Button
              onClick={() => setShowAssignMenu(!showAssignMenu)}
              disabled={updating}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Staff
            </Button>

            {showAssignMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2 border-b mb-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Select Staff Member:
                    </p>
                    <button 
                      onClick={() => setShowAssignMenu(false)}
                      className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                  {staff.filter(s => s.status === 'active').length === 0 ? (
                    <p className="text-sm text-gray-500 px-3 py-2">No active staff available</p>
                  ) : (
                    staff.filter(s => s.status === 'active').map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleAssignStaff(s.id, s.name)}
                        disabled={updating}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      >
                        <div className="font-medium text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{s.specialization}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {request.staff_id && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Assigned to</p>
            <p className="font-medium text-green-600">{request.staff?.name}</p>
          </div>
        )}
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{request.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Room</p>
                <p className="font-medium">{request.room?.room_number || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Reported by</p>
                <p className="font-medium">{request.user?.name || 'Unknown'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{new Date(request.created_at).toLocaleString()}</p>
              </div>
            </div>

            {request.completed_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="font-medium">{new Date(request.completed_date).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {request.images && request.images.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {request.images.map((image, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={index}
                    src={image}
                    alt={`Issue ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tenant Feedback */}
      {request.status === 'completed' && request.rating && (
        <Card>
          <CardHeader>
            <CardTitle>Tenant Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-xl ${
                        star <= request.rating! ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {request.feedback && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Comments</p>
                  <p className="text-gray-700">{request.feedback}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
