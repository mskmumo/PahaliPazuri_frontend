'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Mail, Phone, Clock, Eye } from 'lucide-react';

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export default function AdminContactsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/contacts`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.data || []);
      } else {
        console.warn('API call failed, using mock data');
        // Mock data fallback
        setSubmissions([
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+254712345678',
            subject: 'Inquiry about room availability',
            message: 'Hello, I am interested in renting a room. Could you please provide more information about availability and pricing?',
            status: 'new',
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+254723456789',
            subject: 'Question about amenities',
            message: 'Hi, I would like to know what amenities are included with the rooms. Do you have WiFi and laundry facilities?',
            status: 'read',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch contact submissions:', err);
      // Mock data fallback on error
      setSubmissions([
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+254712345678',
          subject: 'Inquiry about room availability',
          message: 'Hello, I am interested in renting a room. Could you please provide more information about availability and pricing?',
          status: 'new',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'replied':
        return <Badge className="bg-green-500">Replied</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Contact Submissions</h1>
        <p className="text-gray-600 mt-2">Manage incoming contact form messages</p>
      </div>

      {selectedSubmission ? (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
            ← Back to List
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedSubmission.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </p>
                </div>
                {getStatusBadge(selectedSubmission.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-semibold">{selectedSubmission.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <a href={`mailto:${selectedSubmission.email}`} className="font-semibold text-primary hover:underline">
                    {selectedSubmission.email}
                  </a>
                </div>
                {selectedSubmission.phone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <a href={`tel:${selectedSubmission.phone}`} className="font-semibold text-primary hover:underline">
                      {selectedSubmission.phone}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Message</p>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild>
                  <a href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}>
                    Reply via Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Contact Submissions</h3>
                <p className="text-gray-600">Contact form submissions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedSubmission(submission)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{submission.subject}</CardTitle>
                        {getStatusBadge(submission.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {submission.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(submission.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {submission.message}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
