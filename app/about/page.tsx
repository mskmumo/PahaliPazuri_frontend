'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import {
  Building2,
  Shield,
  Zap,
  Users,
  HeartHandshake,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CmsPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export default function AboutPage() {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/pages/about-us`);

        if (!response.ok) {
          throw new Error('Failed to fetch about page');
        }

        const data = await response.json();
        setPage(data.page);
      } catch (err) {
        console.error('Error fetching about page:', err);
        // Don't show error, just use default content
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Verified & Secure',
      description: 'Every property is thoroughly inspected and verified for your safety and peace of mind.'
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description: 'Book your room online in minutes with secure payment options and instant confirmation.'
    },
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Properties near universities, transport hubs, and all essential amenities you need.'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Dedicated support team available around the clock to assist with any issues.'
    },
    {
      icon: HeartHandshake,
      title: 'Transparent Pricing',
      description: 'No hidden fees, clear pricing structure with flexible payment options.'
    },
    {
      icon: Building2,
      title: 'Quality Properties',
      description: 'Carefully selected apartments and rooms across Nairobi with modern amenities.'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-1.5" />
              About Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Kenya's Leading
              <span className="block text-gradient">Rental Platform</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Transforming the way people find and manage rental properties across Kenya
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 border-y bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">500+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">50+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Buildings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">2K+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Tenants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">24/7</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Pahali Pazuri Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Why Pahali Pazuri?
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for a seamless housing experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.slice(0, 3).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8">
            {features.slice(3).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CMS Content Section (if available) */}
      {loading ? (
        <section className="py-16">
          <div className="container flex justify-center">
            <LoadingSpinner />
          </div>
        </section>
      ) : page ? (
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8 md:p-12">
                  <div
                    className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-foreground text-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to find your new home?
            </h2>
            <p className="text-lg text-background/70 max-w-xl mx-auto">
              Join thousands of students who have found their perfect accommodation with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-base rounded-full" asChild>
                <Link href="/rooms">
                  Browse Rooms
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-base rounded-full bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground" 
                asChild
              >
                <Link href="/register">
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
