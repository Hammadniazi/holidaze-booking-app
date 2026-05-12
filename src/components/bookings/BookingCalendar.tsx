import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import type { Booking } from "@/types";
import { isBefore, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { cn } from "@/utils";

interface BookingCalendarProps {
  bookings: Booking[];
  onRangeSelect?: (range: DateRange | undefined) => void;
  selected?: DateRange;
  className?: string;
}

export function BookingCalendar({
  bookings,
  onRangeSelect,
  selected,
  className,
}: BookingCalendarProps) {
  const today = startOfDay(new Date());

  // Build disabled date intervals from existing bookings
  const bookedIntervals = bookings.map((b) => ({
    from: parseISO(b.dateFrom),
    to: parseISO(b.dateTo),
  }));

  const isBooked = (date: Date) => {
    if (isBefore(date, today)) return true;
    return bookedIntervals.some((interval) =>
      isWithinInterval(date, { start: interval.from, end: interval.to }),
    );
  };

  return (
    <div
      className={cn(
        "rounded-(--radius) border border-(--color-border) p-4 bg-(--color-card)",
        className,
      )}
    >
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onRangeSelect}
        disabled={isBooked}
        fromDate={today}
        numberOfMonths={1}
        classNames={{
          root: "w-full",
          month_caption: "flex justify-center mb-2 font-semibold text-sm",
          weekdays:
            "grid grid-cols-7 text-center text-xs text-(--color-muted-foreground) mb-1",
          weeks: "space-y-1",
          week: "grid grid-cols-7",
          day: "text-center text-sm",
          day_button: cn(
            "h-8 w-8 rounded-(--radius) text-sm transition-colors mx-auto flex items-center justify-center",
            "hover:bg-(--color-accent) hover:text-(--color-accent-foreground)",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--color-ring)",
          ),
          selected:
            "bg-(--color-primary) text-(--color-primary-foreground) rounded-(--radius)",
          range_start:
            "bg-(--color-primary) text-(--color-primary-foreground) rounded-l-(--radius)",
          range_end:
            "bg-(--color-primary) text-(--color-primary-foreground) rounded-r-(--radius)",
          range_middle: "bg-(--color-primary)/20 rounded-none",
          disabled: "opacity-30 pointer-events-none line-through",
          today: "font-bold",
          outside: "opacity-40",
          nav: "flex items-center justify-between mb-2",
          button_previous:
            "h-7 w-7 rounded-(--radius) flex items-center justify-center text-(--color-muted-foreground) hover:bg-(--color-accent) hover:text-(--color-foreground) transition-colors",
          button_next:
            "h-7 w-7 rounded-(--radius) flex items-center justify-center text-(--color-muted-foreground) hover:bg-(--color-accent) hover:text-(--color-foreground) transition-colors",
        }}
      />
      <div className="mt-3 flex gap-4 text-xs text-(--color-muted-foreground)">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-(--color-primary)" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-(--color-muted) opacity-40" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
