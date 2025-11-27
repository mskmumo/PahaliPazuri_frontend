'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { Staff } from '@/lib/types/api';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = useMemo(() => {
    if (!searchQuery) {
      return staff;
    }

    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staff, searchQuery]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API call
        // const response = await adminApi.getAllStaff();
        
        // Mock data
        setTimeout(() => {
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
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to fetch staff:', err);
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      // TODO: Implement delete API call with id parameter
      // await adminApi.deleteStaff(id);
      console.log('Deleting staff member:', id);
      alert('Staff deleted successfully');
      // TODO: Refresh staff list after deletion
    } catch (error) {
      console.error('Failed to delete staff:', error);
      alert('Failed to delete staff');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-2">Manage maintenance staff members</p>
        </div>
        <Link href="/admin/staff/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredStaff.length} of {staff.length} staff members
        </p>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No staff members found</p>
          </div>
        ) : (
          filteredStaff.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-gray-600">{member.specialization}</p>
                  </div>
                  {member.is_available ? (
                    <Badge className="bg-green-100 text-green-800">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <UserX className="h-3 w-3 mr-1" />
                      Busy
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-sm text-gray-600">{member.phone}</p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/staff/${member.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
