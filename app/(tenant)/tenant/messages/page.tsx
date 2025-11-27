'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus, Mail, MailOpen } from 'lucide-react';
import Link from 'next/link';
import { messagesApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Message } from '@/lib/types/api';

export default function MessagesPage() {
  const [messages, setMessages] = useState<{ received: Message[]; sent: Message[] }>({
    received: [],
    sent: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Fetch inbox and sent messages
      const [inboxResponse, sentResponse] = await Promise.all([
        messagesApi.getInbox(),
        messagesApi.getSent(),
      ]);
      
      setMessages({ 
        received: inboxResponse.data || [], 
        sent: sentResponse.data || [] 
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await messagesApi.markAsRead(messageId);
      fetchMessages();
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with property management</p>
        </div>
        <Button asChild>
          <Link href="/tenant/messages/new">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="received" className="space-y-6">
        <TabsList>
          <TabsTrigger value="received">
            Inbox ({messages.received.filter(m => !m.is_read).length})
          </TabsTrigger>
          <TabsTrigger value="sent">Sent ({messages.sent.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {messages.received.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No messages</h3>
                  <p className="text-muted-foreground">
                    You don&apos;t have any messages yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            messages.received.map((message) => (
              <Card key={message.id} className={!message.is_read ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{message.subject}</CardTitle>
                        {!message.is_read && <Badge variant="default">New</Badge>}
                      </div>
                      <CardDescription>
                        From: {message.sender?.name || 'System'} • {new Date(message.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {!message.is_read ? (
                      <Mail className="h-5 w-5 text-primary" />
                    ) : (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {message.body}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tenant/messages/${message.id}`}>
                        Read Message
                      </Link>
                    </Button>
                    {!message.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(message.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {messages.sent.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No sent messages</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t sent any messages yet.
                  </p>
                  <Button asChild>
                    <Link href="/tenant/messages/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Send Your First Message
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            messages.sent.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{message.subject}</CardTitle>
                      </div>
                      <CardDescription>
                        To: {message.recipient?.name || 'Management'} • {new Date(message.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {message.body}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/tenant/messages/${message.id}`}>
                      View Message
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
