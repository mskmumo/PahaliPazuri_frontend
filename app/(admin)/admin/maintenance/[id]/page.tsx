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
      const response = await maintenanceApi.getById(requestId);
      setRequest(response.data);
      
      // TODO: Fetch staff list
      // const staffResponse = await adminApi.getAllStaff();
      // setStaff(staffResponse.data);
      
      // Mock staff data
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
      setStaff(mockStaff);
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

  const handleAssignStaff = async (staffId: number) => {
    try {
      setUpdating(true);
      // TODO: Implement assign API
      // await adminApi.assignMaintenanceStaff(requestId, staffId);
      alert('Staff assigned successfully');
      setShowAssignMenu(false);
      fetchData();
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
                  <p className="text-xs font-semibold text-gray-700 mb-2 px-3">
                    Select Staff Member:
                  </p>
                  {staff.length === 0 ? (
                    <p className="text-sm text-gray-500 px-3 py-2">No staff available</p>
                  ) : (
                    staff.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleAssignStaff(s.id)}
                        disabled={!s.is_available}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.specialization}</div>
                        {!s.is_available && (
                          <Badge className="mt-1 bg-red-100 text-red-800 text-xs">Busy</Badge>
                        )}
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
