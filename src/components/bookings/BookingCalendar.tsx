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
        // Tighter padding on small screens hands the seven columns back the
        // width they need for comfortable targets.
        "rounded-(--radius-lg) border border-(--color-border) bg-(--color-card) p-3 sm:p-4",
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
          // Nav is a sibling of the month in RDP v9 and its default absolute
          // positioning is lost once `classNames` replaces the library class,
          // so it falls into flow and lands on the date grid. Pin it here.
          months: "relative",
          month: "w-full",
          // Without this the <table> sizes to its content. Once the day buttons
          // became `w-full` they had no intrinsic width, so the whole grid
          // collapsed to the width of the digits (~17px per cell).
          month_grid: "w-full",
          month_caption: "flex h-11 items-center justify-center font-semibold text-sm mb-2",
          weekdays:
            "grid grid-cols-7 text-center text-xs text-(--color-muted-foreground) mb-1",
          weeks: "space-y-1",
          week: "grid grid-cols-7",
          day: "text-center text-sm",
          // Picking a date is the core interaction of the whole product, and
          // every cell was 32x32. `w-full` rather than a fixed width: the cell
          // takes a seventh of whatever width the sidebar gives it, so the
          // target grows on desktop and can never overflow on a narrow phone.
          day_button: cn(
            "flex h-11 w-full items-center justify-center rounded-(--radius) text-sm transition-colors",
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
          // Header row is 44px tall so the month arrows can be full-size
          // targets flanking the centred caption.
          nav: "absolute inset-x-0 top-0 z-10 flex h-11 items-center justify-between",
          button_previous:
            "h-11 w-11 rounded-(--radius) flex items-center justify-center text-(--color-muted-foreground) hover:bg-(--color-accent) hover:text-(--color-foreground) transition-colors",
          button_next:
            "h-11 w-11 rounded-(--radius) flex items-center justify-center text-(--color-muted-foreground) hover:bg-(--color-accent) hover:text-(--color-foreground) transition-colors",
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
