export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  color: string;
}

export interface Staff {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  status: 'available' | 'booked' | 'disabled';
  serviceId: string;
  staffId: string;
  locationId: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientType: 'individual' | 'business';
  serviceId: string;
  staffId: string;
  locationId: string;
  date: string;
  start: string;
  end: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

// Mock Services
export const services: Service[] = [
  { id: '1', name: 'Consultation', duration: 60, color: '#6366f1' },
  { id: '2', name: 'Follow-up', duration: 30, color: '#10b981' },
  { id: '3', name: 'Workshop', duration: 120, color: '#f59e0b' },
  { id: '4', name: 'Assessment', duration: 90, color: '#ef4444' },
  { id: '5', name: 'Therapy Session', duration: 45, color: '#8b5cf6' },
];

// Mock Staff
export const staff: Staff[] = [
  { id: '1', name: 'Dr. Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Senior Consultant' },
  { id: '2', name: 'Dr. Michael Chen', avatar: '/avatars/michael.jpg', role: 'Therapist' },
  { id: '3', name: 'Lisa Rodriguez', avatar: '/avatars/lisa.jpg', role: 'Specialist' },
  { id: '4', name: 'Dr. Emily Davis', avatar: '/avatars/emily.jpg', role: 'Senior Therapist' },
  { id: '5', name: 'James Wilson', avatar: '/avatars/james.jpg', role: 'Consultant' },
];

// Mock Locations
export const locations: Location[] = [
  { id: '1', name: 'Downtown Office' },
  { id: '2', name: 'Medical Center' },
  { id: '3', name: 'Wellness Clinic' },
  { id: '4', name: 'Virtual Meeting' },
];

// Generate time slots for the next 60 days
function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate slots for business hours (9 AM to 5 PM)
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = new Date();
        endTime.setHours(hour, minute + 30);
        const end = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
        
        // Randomly assign status (70% available, 20% booked, 10% disabled)
        const rand = Math.random();
        let status: TimeSlot['status'] = 'available';
        if (rand < 0.2) status = 'booked';
        else if (rand < 0.3) status = 'disabled';
        
        // Past slots should be disabled
        if (dayOffset === 0 && hour < new Date().getHours()) {
          status = 'disabled';
        }
        
        slots.push({
          id: `slot-${dateStr}-${start}`,
          date: dateStr,
          start,
          end,
          status,
          serviceId: services[Math.floor(Math.random() * services.length)].id,
          staffId: staff[Math.floor(Math.random() * staff.length)].id,
          locationId: locations[Math.floor(Math.random() * locations.length)].id,
        });
      }
    }
  }
  
  return slots;
}

// Generate bookings based on booked slots
function generateBookings(): Booking[] {
  const bookings: Booking[] = [];
  const bookedSlots = timeSlots.filter(slot => slot.status === 'booked');
  
  const clientNames = [
    'John Smith', 'Emma Wilson', 'Robert Johnson', 'Maria Garcia',
    'David Brown', 'Jennifer Davis', 'Michael Miller', 'Sarah Anderson',
    'Christopher Martinez', 'Ashley Taylor', 'Daniel Thomas', 'Jessica Moore',
    'Matthew Jackson', 'Amanda White', 'Anthony Harris', 'Melissa Martin',
  ];
  
  bookedSlots.forEach((slot, index) => {
    const clientName = clientNames[index % clientNames.length];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    
    // Random status distribution
    const rand = Math.random();
    let status: Booking['status'] = 'confirmed';
    if (rand < 0.1) status = 'cancelled';
    else if (rand < 0.2) status = 'pending';
    
    bookings.push({
      id: `booking-${slot.id}`,
      clientName,
      clientType: Math.random() > 0.7 ? 'business' : 'individual',
      serviceId: slot.serviceId,
      staffId: slot.staffId,
      locationId: slot.locationId,
      date: slot.date,
      start: slot.start,
      end: slot.end,
      status,
      createdAt: createdAt.toISOString(),
    });
  });
  
  return bookings;
}

export const timeSlots = generateTimeSlots();
export const bookings = generateBookings();

// Helper functions
export function getServiceById(id: string): Service | undefined {
  return services.find(service => service.id === id);
}

export function getStaffById(id: string): Staff | undefined {
  return staff.find(member => member.id === id);
}

export function getLocationById(id: string): Location | undefined {
  return locations.find(location => location.id === id);
}

export function getSlotsByDate(date: string): TimeSlot[] {
  return timeSlots.filter(slot => slot.date === date);
}

export function getBookingStats() {
  const total = bookings.length;
  const upcoming = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    return bookingDate >= new Date();
  }).length;
  const cancelled = bookings.filter(booking => booking.status === 'cancelled').length;
  
  const totalSlots = timeSlots.length;
  const bookedSlots = timeSlots.filter(slot => slot.status === 'booked').length;
  const utilization = Math.round((bookedSlots / totalSlots) * 100);
  
  return { total, upcoming, cancelled, utilization };
}

export function getBookingsChartData() {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });
  
  return last30Days.map(date => {
    const dayBookings = bookings.filter(booking => booking.date === date);
    return {
      date,
      bookings: dayBookings.length,
      confirmed: dayBookings.filter(b => b.status === 'confirmed').length,
      pending: dayBookings.filter(b => b.status === 'pending').length,
      cancelled: dayBookings.filter(b => b.status === 'cancelled').length,
    };
  });
}