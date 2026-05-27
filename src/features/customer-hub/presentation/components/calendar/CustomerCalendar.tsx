"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createViewMonthGrid } from "@schedule-x/calendar";
import type { CalendarEvent } from "@schedule-x/calendar";
import "@schedule-x/theme-shadcn/dist/index.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calendarTypes } from "./calendar-config";
import { useCalendarEvents } from "./useCalendarEvents";
import { CalendarLegend } from "./CalendarLegend";
import type { CalendarItemLookup } from "./calendar-event-transforms";

const monthView = createViewMonthGrid();

interface CustomerCalendarProps {
  userId: string;
}

export function CustomerCalendar({ userId }: CustomerCalendarProps) {
  const { events, itemLookup, isLoading } = useCalendarEvents(userId);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const itemLookupRef = useRef<CalendarItemLookup>(itemLookup);
  itemLookupRef.current = itemLookup;

  const handleEventClick = useCallback((event: CalendarEvent) => {
    const id = String(event.id);
    if (id.startsWith("wp-") && itemLookupRef.current.has(id)) {
      setSelectedEventId(id);
    }
  }, []);

  const calendarApp = useCalendarApp({
    views: [monthView],
    events: [],
    calendars: calendarTypes,
    locale: "th-TH",
    theme: "shadcn",
    callbacks: {
      onEventClick: handleEventClick,
    },
  });

  useEffect(() => {
    if (calendarApp) {
      calendarApp.events.set(events);
    }
  }, [calendarApp, events]);

  const selectedItem = selectedEventId
    ? itemLookup.get(selectedEventId)
    : null;

  if (isLoading && !calendarApp) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ปฏิทินภาพรวม</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!calendarApp) return null;

  const doneCount = selectedItem?.subtasks.filter((s) => s.isDone).length ?? 0;
  const totalCount = selectedItem?.subtasks.length ?? 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ปฏิทินภาพรวม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="calendar-wrapper min-h-[500px] md:min-h-[800px]">
            <ScheduleXCalendar calendarApp={calendarApp} />
          </div>
          <CalendarLegend />
        </CardContent>
      </Card>

      <Dialog
        open={selectedItem != null}
        onOpenChange={(open) => {
          if (!open) setSelectedEventId(null);
        }}
      >
        {selectedItem && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">
                {selectedItem.activity}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedItem.planTitle}
              </p>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{selectedItem.category.name}</Badge>
              <Badge
                variant="secondary"
                style={
                  selectedItem.status.color
                    ? { backgroundColor: selectedItem.status.color, color: "#fff" }
                    : undefined
                }
              >
                {selectedItem.status.name}
              </Badge>
            </div>

            {selectedItem.description && (
              <p className="text-sm text-muted-foreground">
                {selectedItem.description}
              </p>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ความคืบหน้า</span>
                <span className="font-medium">
                  {selectedItem.progressPercent}%
                </span>
              </div>
              <Progress value={selectedItem.progressPercent} className="h-2" />
            </div>

            {totalCount > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Subtasks ({doneCount}/{totalCount})
                </p>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedItem.subtasks.map((sub) => (
                    <li key={sub.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={sub.isDone} disabled />
                      <span
                        className={
                          sub.isDone ? "line-through text-muted-foreground" : ""
                        }
                      >
                        {sub.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
