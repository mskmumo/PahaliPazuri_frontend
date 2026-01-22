'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface CmsPage {
  id: number;
  title: string;
  content: string;
}

export default function FAQPage() {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/pages/faq`);
        if (!response.ok) throw new Error('Failed to fetch page');
        const data = await response.json();
        setPage(data.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="container py-12"><ErrorMessage message={error} /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 text-sm font-semibold px-4 py-1.5">
              <HelpCircle className="h-4 w-4 mr-1.5" />
              Help Center
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Frequently Asked
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about our platform
            </p>
          </div>
        </div>
      </div>

      <div className="container py-16 max-w-4xl">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 md:p-12">
            {page && (
              <div 
                className="prose prose-lg max-w-none dark:prose-invert prose-h3:text-primary prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-3"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            )}
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="border-0 shadow-xl mt-8 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you
            </p>
            <Link href="/contact">
              <Button size="lg">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
