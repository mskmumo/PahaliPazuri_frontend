'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { roomsApi, pricingApi } from '@/lib/api';
import { enhancedBookingsApi } from '@/lib/api/bookings';
import { useAuth } from '@/hooks/useAuth';
import { Room } from '@/lib/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { formatCurrency } from '@/lib/utils/api-helpers';
import { calculateRentalCosts, PaymentPlanType, RentalCostResult, formatPaymentDate } from '@/lib/utils/pricing-utils';
import { ArrowLeft, Calendar, DollarSign, Info, Bed, CheckCircle2, User, Phone, FileText, AlertCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react';

export default function BookRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [comprehensivePricing, setComprehensivePricing] = useState<any>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [availableBeds, setAvailableBeds] = useState<number[]>([]);
  const [occupiedBeds, setOccupiedBeds] = useState<number[]>([]);
  const [loadingBeds, setLoadingBeds] = useState(false);

  // Booking Details
  const [moveInDate, setMoveInDate] = useState('');
  const [duration, setDuration] = useState('6'); // months
  const [bedNumber, setBedNumber] = useState('');
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanType>('monthly');
  const [localPricing, setLocalPricing] = useState<RentalCostResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    roomCharges: false,
    oneTimeFees: false,
    serviceCharges: false,
  });

  // Personal Information (pre-filled from user profile)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [phone, setPhone] = useState('');

  // Room Gender Preference
  const [genderPreference, setGenderPreference] = useState<'mixed' | 'male_only' | 'female_only'>('mixed');

  // Emergency Contact (Required)
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');

  // Purpose of Stay (Required)
  const [purposeOfStay, setPurposeOfStay] = useState<'education' | 'employment' | 'business' | 'tourism' | 'medical' | 'relocation' | 'other'>('education');
  const [purposeDetails, setPurposeDetails] = useState('');

  // Legal Compliance (Required)
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=/rooms/${roomId}/book`);
      } else {
        fetchRoom();
      }
    }
  }, [roomId, isAuthenticated, authLoading]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const response = await roomsApi.getById(parseInt(roomId));
      setRoom(response.data);

      // Load comprehensive pricing with default values
      loadComprehensivePricing(parseInt(roomId), 1, 'semester');

      // Load bed availability for shared rooms
      if (response.data.total_beds && response.data.total_beds > 1) {
        loadBedAvailability(parseInt(roomId));
      }

      // Set minimum move-in date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setMoveInDate(tomorrow.toISOString().split('T')[0]);

      // Pre-fill form with user data if available
      if (user) {
        setFirstName(user.name?.split(' ')[0] || '');
        setLastName(user.name?.split(' ').slice(1).join(' ') || '');
        setDateOfBirth(user.date_of_birth || '');
        setGender(user.gender || 'male');
        setPhone(user.phone || '');
        setGenderPreference((user as any).gender_preference || 'mixed');

        // Emergency contact
        setEmergencyContactName((user as any).emergency_contact_name || '');
        setEmergencyContactPhone((user as any).emergency_contact_phone || user.phone || '');
        setEmergencyContactRelationship((user as any).emergency_contact_relationship || '');
      }
    } catch (err) {
      console.error('Failed to fetch room:', err);
      setError('Failed to load room details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadComprehensivePricing = async (roomId: number, beds: number, durationType: 'monthly' | 'semester' | 'yearly') => {
    try {
      setLoadingPricing(true);
      const response = await pricingApi.calculateComprehensivePricing(roomId, {
        beds,
        duration_type: durationType,
        custom_months: parseInt(duration) || 6, // Pass actual selected duration as custom_months
      });

      if (response.success && response.data) {
        setComprehensivePricing(response.data);
      }
    } catch (err) {
      console.error('Failed to load comprehensive pricing:', err);
    } finally {
      setLoadingPricing(false);
    }
  };

  const loadBedAvailability = async (roomId: number, checkInDate?: string, durationMonthsParam?: number) => {
    try {
      setLoadingBeds(true);

      // Use provided dates or defaults
      const checkIn = checkInDate || moveInDate || new Date().toISOString().split('T')[0];
      const durationVal = durationMonthsParam || parseInt(duration) || 6;

      // Call the new real-time bed availability API
      const response = await roomsApi.getBedAvailability(roomId, {
        check_in_date: checkIn,
        duration_months: durationVal,
      });

      if (response.success && response.data) {
        const bedData = response.data;

        // Extract available and occupied bed numbers from the detailed response
        const available: number[] = [];
        const occupied: number[] = [];

        bedData.beds?.forEach((bed: any) => {
          if (bed.status === 'available') {
            available.push(bed.bed_number);
          } else if (bed.status === 'occupied') {
            occupied.push(bed.bed_number);
          }
        });

        setAvailableBeds(available);
        setOccupiedBeds(occupied);

        // Update room data with latest availability info
        if (room) {
          setRoom({
            ...room,
            available_beds: bedData.available_beds,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load bed availability:', err);
      // Fallback to old method if API fails
      try {
        const response = await roomsApi.getById(roomId);
        const roomData = response.data;

        if (roomData.total_beds && roomData.total_beds > 1) {
          const totalBeds = roomData.total_beds;
          const occupiedCount = (roomData.total_beds - (roomData.available_beds || 0));
          const allBeds = Array.from({ length: totalBeds }, (_, i) => i + 1);
          const occupied = allBeds.slice(0, occupiedCount);
          const available = allBeds.slice(occupiedCount);

          setOccupiedBeds(occupied);
          setAvailableBeds(available);
        }
      } catch (fallbackErr) {
        console.error('Fallback bed availability also failed:', fallbackErr);
      }
    } finally {
      setLoadingBeds(false);
    }
  };

  // Update pricing when duration changes
  useEffect(() => {
    if (room && duration) {
      const months = parseInt(duration);
      let durationType: 'monthly' | 'semester' | 'yearly';

      if (months === 1) {
        durationType = 'monthly';
      } else if (months >= 12) {
        durationType = 'yearly';
      } else if (months >= 4) {
        durationType = 'semester';
      } else {
        durationType = 'monthly';
      }

      loadComprehensivePricing(parseInt(roomId), 1, durationType);
    }
  }, [duration, room, roomId]);

  // Reload bed availability when move-in date or duration changes
  useEffect(() => {
    if (room && moveInDate && room.total_beds > 1) {
      loadBedAvailability(parseInt(roomId), moveInDate, parseInt(duration));
    }
  }, [moveInDate, duration, roomId, room]);

  // Calculate local proration-based pricing when inputs change
  useEffect(() => {
    if (room && moveInDate && comprehensivePricing) {
      const monthlyRent = comprehensivePricing.monthly_rent || room.price_per_bed_month || room.price_per_month || 0;
      const deposit = comprehensivePricing.refundable_deposits || 0;
      const oneTimeFees = (comprehensivePricing.one_time_total || 0) - deposit; // Non-refundable fees
      const serviceCharges = comprehensivePricing.recurring_monthly_total || 0;

      const result = calculateRentalCosts(
        monthlyRent,
        deposit,
        oneTimeFees,
        moveInDate,
        parseInt(duration),
        paymentPlan,
        serviceCharges
      );

      setLocalPricing(result);
    }
  }, [moveInDate, duration, paymentPlan, comprehensivePricing, room]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getMonthlyPrice = () => {
    return room?.price_per_month || room?.price_per_bed_month || room?.base_price || 0;
  };

  const calculateTotal = () => {
    if (!room) return 0;

    const monthlyRent = getMonthlyPrice();
    const months = parseInt(duration) || 0;
    const registrationFee = room.apartment?.registration_fee || 0;
    const securityDeposit = (monthlyRent * (room.apartment?.security_deposit_percentage || 100)) / 100;

    return (monthlyRent * months) + registrationFee + securityDeposit;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room) return;

    // Validate bed availability for shared rooms
    if (room.total_beds > 1 && room.available_beds === 0) {
      setError('This room is fully occupied. Please select another room.');
      return;
    }

    // Validate bed selection for shared rooms
    if (room.total_beds > 1 && bedNumber) {
      const selectedBedNum = parseInt(bedNumber);
      if (occupiedBeds.includes(selectedBedNum)) {
        setError('The selected bed is already occupied. Please choose another bed or let the system auto-assign.');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      // Calculate end date based on duration
      const startDate = new Date(moveInDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(duration));

      const bookingData = {
        room_id: room.id,
        check_in_date: moveInDate,
        duration_months: parseInt(duration),
        number_of_occupants: 1,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        gender: gender,
        id_number: user?.id_number || '',
        gender_preference: genderPreference,
        // Emergency Contact (Required)
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_relationship: emergencyContactRelationship,
        // Purpose of Stay (optional fields for enhanced API)
        special_requests: purposeDetails || undefined,
        // Bed selection for shared rooms
        ...((['3_beds', '4_beds', 'shared_dorm'].includes(room.room_type) || room.total_beds > 1) && bedNumber && {
          bed_number: parseInt(bedNumber),
        }),
      };

      const response = await enhancedBookingsApi.create(bookingData);
      setSuccess(true);

      // Redirect to confirmation page with booking ID
      if (response.success && response.data?.id) {
        setTimeout(() => {
          router.push(`/rooms/${roomId}/book/confirm?booking_id=${response.data.id}`);
        }, 1500);
      } else {
        // Fallback to bookings page if no booking ID
        setTimeout(() => {
          router.push('/tenant/bookings');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Room not found" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Your booking request has been submitted successfully. You will be redirected to your bookings page.
            </p>
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link href={`/apartments/${room.apartment_id}/rooms`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rooms
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Room {room.room_number}</h1>
          <p className="text-muted-foreground">
            {room.apartment?.name} - Floor {room.floor_number || room.floor}
          </p>
        </div>

        {/* Room Availability Card */}
        {room.total_beds > 1 && (
          <Card className="mb-6 border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Bed className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    Shared Room - {room.total_beds} Beds
                    <Badge variant="outline" className="bg-white">
                      {room.gender_type === 'male_only' ? '👨 Male Only' :
                        room.gender_type === 'female_only' ? '👩 Female Only' :
                          '👥 Mixed'}
                    </Badge>
                  </h3>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">
                        {room.available_beds} {room.available_beds === 1 ? 'Bed' : 'Beds'} Available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-muted-foreground">
                        {room.total_beds - (room.available_beds || 0)} Occupied
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        KES {(room.price_per_bed_month || room.base_price_per_bed_month || 0).toLocaleString()}/bed/month
                      </span>
                    </div>
                  </div>
                  {room.available_beds === 0 && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span className="text-sm text-red-700 font-medium">
                        This room is currently fully occupied. Please check back later or choose another room.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>Fill in the details to book this room</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Move-in Date */}
                  <div className="space-y-2">
                    <Label htmlFor="move-in-date">Move-in Date</Label>
                    <Input
                      id="move-in-date"
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Months) *</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Month</SelectItem>
                        <SelectItem value="2">2 Months</SelectItem>
                        <SelectItem value="3">3 Months</SelectItem>
                        <SelectItem value="4">4 Months</SelectItem>
                        <SelectItem value="5">5 Months</SelectItem>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="7">7 Months</SelectItem>
                        <SelectItem value="8">8 Months</SelectItem>
                        <SelectItem value="9">9 Months</SelectItem>
                        <SelectItem value="10">10 Months</SelectItem>
                        <SelectItem value="11">11 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Pricing will adjust based on your selected duration
                    </p>
                  </div>

                  {/* Payment Plan */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-plan">Payment Plan *</Label>
                    <Select value={paymentPlan} onValueChange={(value: PaymentPlanType) => setPaymentPlan(value)}>
                      <SelectTrigger id="payment-plan">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Payment</SelectItem>
                        <SelectItem value="upfront">Pay Upfront (Full Duration)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {paymentPlan === 'monthly'
                        ? 'Pay first month (prorated) + deposit + fees now. Then pay monthly.'
                        : 'Pay entire duration upfront. No recurring payments.'}
                    </p>
                  </div>

                  {/* Bed Selection (for multi-bed rooms) */}
                  {(['3_beds', '4_beds', 'shared_dorm'].includes(room.room_type) || room.total_beds > 1) && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Bed className="h-5 w-5" />
                          Select Your Bed
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {room.available_beds} of {room.total_beds} beds available
                        </p>
                      </div>

                      {/* Bed Visualization */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        {loadingBeds ? (
                          <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                            <span className="ml-2 text-sm text-muted-foreground">Loading bed availability...</span>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                              {Array.from({ length: room.total_beds }, (_, i) => i + 1).map((bed) => {
                                const isAvailable = availableBeds.includes(bed);
                                const isOccupied = occupiedBeds.includes(bed);
                                const isSelected = bedNumber === bed.toString();

                                return (
                                  <button
                                    key={bed}
                                    type="button"
                                    onClick={() => isAvailable ? setBedNumber(bed.toString()) : null}
                                    disabled={isOccupied}
                                    className={`
                                      relative p-4 rounded-lg border-2 transition-all duration-200
                                      ${isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : isAvailable
                                          ? 'border-green-300 bg-white hover:border-green-500 hover:shadow-sm cursor-pointer'
                                          : 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed'
                                      }
                                    `}
                                  >
                                    <div className="flex flex-col items-center gap-2">
                                      <Bed className={`h-6 w-6 ${isSelected ? 'text-blue-600' :
                                        isAvailable ? 'text-green-600' :
                                          'text-gray-400'
                                        }`} />
                                      <span className={`text-sm font-semibold ${isSelected ? 'text-blue-700' :
                                        isAvailable ? 'text-green-700' :
                                          'text-gray-500'
                                        }`}>
                                        Bed {bed}
                                      </span>
                                      {isSelected && (
                                        <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-blue-600" />
                                      )}
                                      {isOccupied && (
                                        <XCircle className="absolute top-1 right-1 h-4 w-4 text-red-500" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-4 text-xs border-t pt-3">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2 border-green-500 bg-white"></div>
                                <span>Available</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50"></div>
                                <span>Selected</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2 border-gray-300 bg-gray-100"></div>
                                <span>Occupied</span>
                              </div>
                            </div>

                            {/* Auto-assign option */}
                            <div className="mt-4 pt-3 border-t">
                              <button
                                type="button"
                                onClick={() => setBedNumber('')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              >
                                <AlertCircle className="h-4 w-4" />
                                Let the system auto-assign a bed for me
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {bedNumber && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900">Bed {bedNumber} Selected</p>
                            <p className="text-blue-700 text-xs">Your preferred bed has been reserved for this booking</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Personal Information Section */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name *</Label>
                        <Input
                          id="first-name"
                          type="text"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name *</Label>
                        <Input
                          id="last-name"
                          type="text"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth *</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
                          <SelectTrigger id="gender">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Gender Preference */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="gender-preference">Room Gender Preference</Label>
                        <Select value={genderPreference} onValueChange={(value: 'male_only' | 'female_only' | 'mixed') => setGenderPreference(value)}>
                          <SelectTrigger id="gender-preference">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mixed">Mixed (No Preference)</SelectItem>
                            <SelectItem value="male_only">Male Only</SelectItem>
                            <SelectItem value="female_only">Female Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Select your preferred room gender type for future bookings
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Emergency Contact Name */}
                      <div className="space-y-2">
                        <Label htmlFor="emergency-name">Contact Name *</Label>
                        <Input
                          id="emergency-name"
                          type="text"
                          placeholder="Enter contact name"
                          value={emergencyContactName}
                          onChange={(e) => setEmergencyContactName(e.target.value)}
                          required
                        />
                      </div>

                      {/* Emergency Contact Relationship */}
                      <div className="space-y-2">
                        <Label htmlFor="emergency-relationship">Relationship *</Label>
                        <Input
                          id="emergency-relationship"
                          type="text"
                          placeholder="e.g., Father, Mother, Spouse"
                          value={emergencyContactRelationship}
                          onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                          required
                        />
                      </div>

                      {/* Emergency Contact Phone */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="emergency-phone">Contact Phone *</Label>
                        <Input
                          id="emergency-phone"
                          type="tel"
                          placeholder="+254712345678"
                          value={emergencyContactPhone}
                          onChange={(e) => setEmergencyContactPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Purpose of Stay Section */}
                  <div className="border-t pt-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold">Purpose of Stay</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose of Stay *</Label>
                        <Select value={purposeOfStay} onValueChange={(value: any) => setPurposeOfStay(value)}>
                          <SelectTrigger id="purpose">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="education">Education/Studies</SelectItem>
                            <SelectItem value="employment">Employment/Work</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="tourism">Tourism/Vacation</SelectItem>
                            <SelectItem value="medical">Medical Treatment</SelectItem>
                            <SelectItem value="relocation">Relocation/Moving</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purpose-details">Additional Details</Label>
                        <Textarea
                          id="purpose-details"
                          placeholder="Provide more details about your purpose of stay..."
                          value={purposeDetails}
                          onChange={(e) => setPurposeDetails(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="border-t pt-6 mt-6 space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Terms & Conditions</h3>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4"
                        required
                      />
                      <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                        I accept the{' '}
                        <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                          Terms and Conditions
                        </Link>{' '}
                        *
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={privacyPolicyAccepted}
                        onChange={(e) => setPrivacyPolicyAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4"
                        required
                      />
                      <Label htmlFor="privacy" className="text-sm font-normal cursor-pointer">
                        I accept the{' '}
                        <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>{' '}
                        *
                      </Label>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting || (room.total_beds > 1 && room.available_beds === 0) || !termsAccepted || !privacyPolicyAccepted}
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner />
                        Submitting...
                      </>
                    ) : room.total_beds > 1 && room.available_beds === 0 ? (
                      'Room Fully Occupied'
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Submit Booking Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <div className="space-y-6">
            {/* Tenant Information Card */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">
                      {user.tenant_profile?.first_name && user.tenant_profile?.last_name
                        ? `${user.tenant_profile.first_name} ${user.tenant_profile.last_name}`
                        : user.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium capitalize">
                      {user.tenant_profile?.gender || user.gender}
                    </span>
                  </div>
                  {user.tenant_profile?.id_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID Number</span>
                      <span className="font-medium">{user.tenant_profile.id_number}</span>
                    </div>
                  )}
                  {user.tenant_profile?.dob && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date of Birth</span>
                      <span className="font-medium">
                        {new Date(user.tenant_profile.dob).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {user.emergency_contact && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Emergency Contact</p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{user.emergency_contact.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Relationship</span>
                        <span className="font-medium">{user.emergency_contact.relationship}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{user.emergency_contact.phone}</span>
                      </div>
                    </>
                  )}
                  {user.preferences?.gender_preference && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Room Preferences</p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender Preference</span>
                        <Badge variant="outline" className="capitalize">
                          {user.preferences.gender_preference.replace('_', ' ')}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Room Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Number</span>
                  <span className="font-medium">{room.room_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className="capitalize">
                    {room.room_type.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={`${room.status === 'available' ? 'bg-green-100 text-green-800' :
                    room.status === 'occupied' ? 'bg-red-100 text-red-800' :
                      room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {room.status}
                  </Badge>
                </div>
                {room.apartment && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Apartment</span>
                    <span className="font-medium">{room.apartment.name}</span>
                  </div>
                )}
                {room.floor_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Floor</span>
                    <span className="font-medium">Floor {room.floor_number}</span>
                  </div>
                )}
                {room.total_beds > 1 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Beds</span>
                    <span className="font-medium">{room.total_beds} beds</span>
                  </div>
                )}
                {room.available_beds > 0 && room.total_beds > 1 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Beds</span>
                    <span className="font-medium text-green-600">{room.available_beds} available</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Complete Cost Breakdown
                </CardTitle>
                <CardDescription>All charges including VAT</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {loadingPricing ? (
                  <div className="py-6 text-center">
                    <LoadingSpinner />
                    <p className="mt-2 text-xs text-muted-foreground">Calculating costs...</p>
                  </div>
                ) : comprehensivePricing && localPricing ? (
                  <div className="space-y-2">
                    {/* Fixed Monthly Rent - Always Visible */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Standard Monthly Rent</span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(localPricing.costs.monthlyRent)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This rate stays consistent throughout your stay
                      </p>
                    </div>

                    {/* Proration Info - When Not First of Month */}
                    {localPricing.breakdown.activeDays < localPricing.breakdown.daysInMonth && (
                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <p className="font-medium text-blue-900">First Month Prorated</p>
                            <p className="text-blue-700 mt-1">
                              Moving in on {formatPaymentDate(moveInDate)} means you pay for {localPricing.breakdown.activeDays} days
                              ({formatCurrency(localPricing.breakdown.dailyRate)}/day) = <strong>{formatCurrency(localPricing.breakdown.proratedFirstMonth)}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Collapsible Room Charges */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('roomCharges')}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-sm">Room Charges</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {formatCurrency(comprehensivePricing.room_charges_with_vat)}
                          </span>
                          {expandedSections.roomCharges ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.roomCharges ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                      >
                        <div className="p-3 space-y-1.5 border-t bg-white">
                          <div className="flex justify-between text-xs">
                            <span>Base ({comprehensivePricing.number_of_months} months)</span>
                            <span>{formatCurrency(comprehensivePricing.base_room_charges)}</span>
                          </div>
                          {comprehensivePricing.discount_percentage > 0 && (
                            <div className="flex justify-between text-xs text-green-600">
                              <span>Discount ({comprehensivePricing.discount_percentage}%)</span>
                              <span>- {formatCurrency(comprehensivePricing.discount_applied)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-blue-600">
                            <span>VAT ({comprehensivePricing.vat_rate}%)</span>
                            <span>+ {formatCurrency(comprehensivePricing.vat_amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible One-Time Fees */}
                    {Object.keys(comprehensivePricing.one_time_charges).length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleSection('oneTimeFees')}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium text-sm">One-Time Fees</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {formatCurrency(comprehensivePricing.one_time_total)}
                            </span>
                            {expandedSections.oneTimeFees ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.oneTimeFees ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                          <div className="p-3 space-y-1.5 border-t bg-white">
                            {Object.entries(comprehensivePricing.one_time_charges).map(([key, charge]: [string, any]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {charge.name}
                                  {charge.refundable && <span className="text-green-600 ml-1">✓ Refundable</span>}
                                </span>
                                <span>{formatCurrency(charge.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Collapsible Service Charges */}
                    {Object.keys(comprehensivePricing.recurring_charges).length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleSection('serviceCharges')}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium text-sm">Service Charges (Monthly)</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {formatCurrency(comprehensivePricing.recurring_monthly_total)}/mo
                            </span>
                            {expandedSections.serviceCharges ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.serviceCharges ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                          <div className="p-3 space-y-1.5 border-t bg-white">
                            {Object.entries(comprehensivePricing.recurring_charges).map(([key, charge]: [string, any]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{charge.name}</span>
                                <span>{formatCurrency(charge.monthly_amount)}/mo</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total Move-In Cost - Always Visible & Highlighted */}
                    <div className="border-t-2 border-gray-200 pt-4 mt-4 space-y-3">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-900 flex items-center gap-2">
                            💰 Move-In Cost
                            <Badge variant="outline" className="text-xs">
                              {paymentPlan === 'monthly' ? 'Monthly Plan' : 'Upfront Plan'}
                            </Badge>
                          </span>
                          <span className="text-2xl font-bold text-orange-600">
                            {formatCurrency(localPricing.costs.totalMoveInCost)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>First month rent (prorated): {formatCurrency(localPricing.breakdown.proratedFirstMonth)}</p>
                          <p>Security deposit: {formatCurrency(localPricing.costs.deposit)}</p>
                          <p>One-time fees: {formatCurrency(localPricing.costs.fees)}</p>
                          {paymentPlan === 'upfront' && localPricing.breakdown.remainingMonthsCost > 0 && (
                            <p>Remaining months rent: {formatCurrency(localPricing.breakdown.remainingMonthsCost)}</p>
                          )}
                        </div>
                      </div>

                      {/* Next Month Payment Preview */}
                      {paymentPlan === 'monthly' && localPricing.costs.nextMonthlyPayment > 0 && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-blue-900 mb-1">Next Month Payment</p>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">
                                  Due {formatPaymentDate(localPricing.nextPaymentDate)}
                                </span>
                                <span className="text-lg font-bold text-blue-600">
                                  {formatCurrency(localPricing.costs.nextMonthlyPayment)}
                                </span>
                              </div>
                              <p className="text-xs text-blue-600 mt-1">
                                Monthly rent ({formatCurrency(localPricing.costs.monthlyRent)}) +
                                Service charges ({formatCurrency(localPricing.costs.monthlyServiceCharges)})
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Refundable Note */}
                      <div className="flex justify-between text-xs text-green-600">
                        <span>Refundable at checkout</span>
                        <span>{formatCurrency(comprehensivePricing.refundable_deposits)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Rent</span>
                      <span>{formatCurrency(getMonthlyPrice())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{duration} months</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gender Preference Warning */}
            {user?.preferences?.gender_preference && room && (
              <>
                {(user.preferences.gender_preference === 'female_only' && room.gender_type !== 'female_only') ||
                  (user.preferences.gender_preference === 'male_only' && room.gender_type !== 'male_only') ? (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-900">
                          <p className="font-medium mb-1">Preference Notice</p>
                          <p className="text-xs">
                            You prefer {user.preferences.gender_preference.replace('_', ' ')} rooms,
                            but this is a {room.gender_type.replace('_', ' ')} room.
                            Please confirm this matches your needs.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            )}

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Important Note</p>
                    <p className="text-xs">
                      Your booking request will be reviewed by management.
                      You will receive a confirmation email once approved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
