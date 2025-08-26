import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EnhancedCalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  mode?: 'single';
}

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  disabled,
  mode = 'single',
}: EnhancedCalendarProps) {
  // Get initial month from selected date or current date
  const getInitialMonth = () => {
    if (selected && selected instanceof Date) {
      return selected;
    }
    return new Date();
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(getInitialMonth());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempYear, setTempYear] = useState(currentMonth.getFullYear());
  const [tempMonth, setTempMonth] = useState(currentMonth.getMonth());

  // Generate year options (±10 years from current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthYearChange = () => {
    const newDate = new Date(tempYear, tempMonth, 1);
    setCurrentMonth(newDate);
    setIsPickerOpen(false);
  };

  const handleCancel = () => {
    setTempYear(currentMonth.getFullYear());
    setTempMonth(currentMonth.getMonth());
    setIsPickerOpen(false);
  };

  // Custom caption component
  const CustomCaption = () => (
    <div className="flex justify-center pt-1 relative items-center">
      <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="text-sm font-medium hover:bg-accent/50 flex items-center gap-1"
          >
            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="center">
          <div className="space-y-4">
            <div className="text-sm font-medium text-center">Select Month & Year</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Year</label>
                <Select
                  value={tempYear.toString()}
                  onValueChange={(value) => setTempYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Month</label>
                <Select
                  value={tempMonth.toString()}
                  onValueChange={(value) => setTempMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleMonthYearChange}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <DayPicker
      mode={mode}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: CustomCaption,
      }}
    />
  );
}

EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };