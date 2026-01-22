'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'support@pahalipazuri.com',
      link: 'mailto:support@pahalipazuri.com'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+254 XXX XXX XXX',
      link: 'tel:+254XXXXXXXXX'
    },
    {
      icon: MapPin,
      label: 'Address',
      value: 'Nairobi, Kenya',
      link: null
    },
    {
      icon: Clock,
      label: 'Business Hours',
      value: 'Mon-Fri: 8AM - 6PM EAT',
      link: null
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 text-sm font-semibold px-4 py-1.5">
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Get In Touch
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Contact
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Our Team
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Have questions? We're here to help and answer any questions you might have
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl">
              <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-background">
                <CardTitle className="text-3xl font-black flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Send className="h-6 w-6 text-primary" />
                  </div>
                  Send Us a Message
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Fill out the form below and we'll get back to you as soon as possible
                </p>
              </CardHeader>
              <CardContent className="p-8">
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Message Sent Successfully!</p>
                      <p className="text-sm text-green-700">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+254 XXX XXX XXX"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="How can we help?"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={8}
                      placeholder="Tell us more about your inquiry..."
                      className="mt-1.5 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={sending}
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {sending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-3">Contact Information</h2>
              <p className="text-muted-foreground text-lg">
                Reach out through any of these channels
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                const content = (
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-muted-foreground mb-1">
                            {item.label}
                          </h3>
                          <p className="font-semibold text-lg">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );

                return item.link ? (
                  <a key={index} href={item.link} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>

            {/* Quick Links */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white">
              <CardContent className="p-6">
                <Sparkles className="h-10 w-10 mb-4 opacity-90" />
                <h3 className="text-xl font-bold mb-3">Need Immediate Help?</h3>
                <p className="text-white/90 mb-4 text-sm leading-relaxed">
                  For urgent matters or booking assistance, you can also message us through your tenant dashboard.
                </p>
                <a href="/login">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Link Section */}
      <div className="container pb-16 md:pb-24">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-black mb-4">Looking for Quick Answers?</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              Check out our FAQ page for answers to commonly asked questions
            </p>
            <a href="/faq">
              <Button size="lg" variant="outline" className="font-semibold">
                View FAQ
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
