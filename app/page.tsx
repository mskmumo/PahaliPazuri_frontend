import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Clean & Minimal */}
      <section className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Now available in Nairobi
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-fade-in-up">
              Your Perfect
              <br />
              <span className="text-gradient">Accommodation</span>
              <br />
              Awaits
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
              Quality student housing with modern amenities.
              Simple booking. Trusted by thousands.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up delay-200">
              <Button size="lg" className="h-14 px-8 text-base rounded-full" asChild>
                <Link href="/rooms">
                  Browse Rooms
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full" asChild>
                <Link href="/apartments">
                  View Apartments
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground animate-fade-in delay-300">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Verified Properties</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Instant Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Prime Locations</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
