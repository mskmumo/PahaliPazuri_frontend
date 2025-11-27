'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Reply } from 'lucide-react';
import Link from 'next/link';
import { messagesApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Message } from '@/lib/types/api';

export default function MessageDetailsPage() {
  const params = useParams();
  const messageId = parseInt(params.id as string);
  
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessage = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getById(messageId);
      setMessage(response.data);
      
      // Mark as read if not already read
      if (!response.data.is_read) {
        await messagesApi.markAsRead(messageId);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load message');
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !message) {
    return <ErrorMessage message={error || 'Message not found'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tenant/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Message</h1>
          <p className="text-muted-foreground">Message details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle>{message.subject}</CardTitle>
              </div>
              <CardDescription>
                {message.sender?.name || 'System'} → {message.recipient?.name || 'You'}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{message.body}</p>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button asChild>
              <Link href="/tenant/messages/new">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
