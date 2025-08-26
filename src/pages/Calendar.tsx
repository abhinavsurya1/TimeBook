import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedCalendar } from '@/components/enhanced-calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  getSlotsByDate, 
  services, 
  staff, 
  locations, 
  getServiceById, 
  getStaffById, 
  getLocationById,
  TimeSlot 
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];
  const slots = getSlotsByDate(dateStr);

  // Filter slots based on selected filters
  const filteredSlots = slots.filter(slot => {
    if (selectedService !== 'all' && slot.serviceId !== selectedService) return false;
    if (selectedStaff !== 'all' && slot.staffId !== selectedStaff) return false;
    if (selectedLocation !== 'all' && slot.locationId !== selectedLocation) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedService('all');
    setSelectedStaff('all');
    setSelectedLocation('all');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSlotStatusClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'slot-available border-2 cursor-pointer hover:shadow-md transition-all duration-200';
      case 'booked':
        return 'slot-booked border-2';
      case 'disabled':
        return 'slot-disabled border';
      default:
        return '';
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
    }
  };

  const handleBooking = () => {
    // In a real app, this would make an API call
    setSelectedSlot(null);
    // Show success toast here
  };

  // Check if any filter is active
  const isFilterActive = selectedService !== 'all' || selectedStaff !== 'all' || selectedLocation !== 'all';

  return (
    <div className="space-y-6 relative">
      {/* Glass effect overlay */}
      {isFilterActive && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 pointer-events-none" />
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar & Timeslots</h1>
        <p className="text-muted-foreground">
          Select a date and browse available time slots
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedCalendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </CardContent>
        </Card>

        {/* Filters and Slots Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className={cn("relative z-20", isFilterActive && "ring-2 ring-primary/50")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
                {isFilterActive && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Active filters: {[selectedService !== 'all' && 'Service', selectedStaff !== 'all' && 'Staff', selectedLocation !== 'all' && 'Location'].filter(Boolean).join(', ')})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staff.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Available Slots - {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No slots available</h3>
                  <p className="text-muted-foreground">
                    Try selecting a different date or adjusting your filters.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSlots.map(slot => {
                    const service = getServiceById(slot.serviceId);
                    const staffMember = getStaffById(slot.staffId);
                    const location = getLocationById(slot.locationId);

                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "p-4 rounded-lg",
                          getSlotStatusClass(slot.status)
                        )}
                        onClick={() => handleSlotClick(slot)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </span>
                          <Badge 
                            variant={slot.status === 'available' ? 'default' : 'secondary'}
                            className={cn(
                              slot.status === 'available' && 'bg-success text-success-foreground',
                              slot.status === 'booked' && 'bg-muted text-muted-foreground',
                              slot.status === 'disabled' && 'bg-muted text-muted-foreground'
                            )}
                          >
                            {slot.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>{service?.name}</p>
                          <p>{staffMember?.name}</p>
                          <p>{location?.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Date:</span> {formatDate(selectedDate)}</p>
                  <p><span className="font-medium">Time:</span> {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}</p>
                  <p><span className="font-medium">Service:</span> {getServiceById(selectedSlot.serviceId)?.name}</p>
                  <p><span className="font-medium">Staff:</span> {getStaffById(selectedSlot.staffId)?.name}</p>
                  <p><span className="font-medium">Location:</span> {getLocationById(selectedSlot.locationId)?.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBooking} className="flex-1">
                  Confirm Booking
                </Button>
                <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}