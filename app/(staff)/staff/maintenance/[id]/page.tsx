'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, MapPin, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { maintenanceApi } from '@/lib/api';
import { MaintenanceRequest } from '@/lib/types/api';

export default function StaffMaintenanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = parseInt(params.id as string);

  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    try {
      setLoading(true);
      const response = await maintenanceApi.getById(requestId);
      setRequest(response.data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const updateStatus = async (newStatus: 'in_progress' | 'completed') => {
    if (!request) return;

    try {
      setUpdating(true);
      await maintenanceApi.update(requestId, { 
        status: newStatus
      });
      await fetchRequest();
      setNotes('');
      alert(`Task marked as ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to update status');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Task</h2>
        <p className="text-gray-600 mb-4">{error || 'Task not found'}</p>
        <Link href="/staff/maintenance">
          <Button>Back to Tasks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <Link 
        href="/staff/maintenance"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to tasks
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
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
        </div>
      </div>

      {/* Main details */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
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

      {/* Action section */}
      {request.status !== 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Update Task Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the work done..."
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              {request.status === 'pending' && (
                <Button
                  onClick={() => updateStatus('in_progress')}
                  disabled={updating}
                  className="flex-1"
                >
                  {updating ? 'Updating...' : 'Start Working'}
                </Button>
              )}

              {request.status === 'in_progress' && (
                <Button
                  onClick={() => updateStatus('completed')}
                  disabled={updating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {updating ? 'Updating...' : 'Mark as Completed'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tenant feedback */}
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
