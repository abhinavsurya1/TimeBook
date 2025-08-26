import { useState, useMemo } from 'react';
import { Table, Search, Filter, Download, MoreHorizontal, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  bookings, 
  getServiceById, 
  getStaffById, 
  getLocationById,
  Booking 
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Booking>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      const service = getServiceById(booking.serviceId);
      const staff = getStaffById(booking.staffId);
      
      // Search filter
      const searchMatch = searchTerm === '' || 
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff?.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
      
      // Client type filter
      const clientTypeMatch = clientTypeFilter === 'all' || booking.clientType === clientTypeFilter;

      return searchMatch && statusMatch && clientTypeMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(a.date + ' ' + a.start).getTime() as any;
        bValue = new Date(b.date + ' ' + b.start).getTime() as any;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [bookings, searchTerm, statusFilter, clientTypeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const paginatedBookings = filteredAndSortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Booking) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBookings.length === paginatedBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(paginatedBookings.map(booking => booking.id));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setClientTypeFilter('all');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'badge-confirmed';
      case 'pending':
        return 'badge-pending';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return '';
    }
  };

  // Check if any filter is active
  const isFilterActive = statusFilter !== 'all' || clientTypeFilter !== 'all' || searchTerm !== '';

  return (
    <div className="space-y-6 relative">
      {/* Glass effect overlay */}
      {isFilterActive && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 pointer-events-none" />
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">
          Manage and view all your bookings in one place
        </p>
      </div>

      {/* Filters and Search */}
      <Card className={cn("relative z-20", isFilterActive && "ring-2 ring-primary/50")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
            {isFilterActive && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Active filters: {[
                  statusFilter !== 'all' && 'Status', 
                  clientTypeFilter !== 'all' && 'Client Type',
                  searchTerm !== '' && 'Search'
                ].filter(Boolean).join(', ')})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients, services, or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Client Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedBookings.length} booking(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="destructive" size="sm">
                  Cancel Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Bookings Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedBookings.length === paginatedBookings.length && paginatedBookings.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('clientName')}
                >
                  Client
                </TableHead>
                <TableHead>Service</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('date')}
                >
                  Date & Time
                </TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Location</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.map((booking) => {
                const service = getServiceById(booking.serviceId);
                const staff = getStaffById(booking.staffId);
                const location = getLocationById(booking.locationId);

                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedBookings.includes(booking.id)}
                        onCheckedChange={() => toggleBookingSelection(booking.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.clientName}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {booking.clientType}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{service?.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDate(booking.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(booking.start)} - {formatTime(booking.end)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{staff?.name}</TableCell>
                    <TableCell>{location?.name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Booking</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableComponent>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {paginatedBookings.map((booking) => {
          const service = getServiceById(booking.serviceId);
          const staff = getStaffById(booking.staffId);
          const location = getLocationById(booking.locationId);

          return (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedBookings.includes(booking.id)}
                      onCheckedChange={() => toggleBookingSelection(booking.id)}
                    />
                    <div>
                      <h3 className="font-medium">{booking.clientName}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {booking.clientType} client
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Booking</DropdownMenuItem>
                      <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Cancel Booking
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{service?.name} with {staff?.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(booking.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatTime(booking.start)} - {formatTime(booking.end)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">{location?.name}</span>
                    <Badge className={getStatusBadgeClass(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedBookings.length)} of{' '}
                {filteredAndSortedBookings.length} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}