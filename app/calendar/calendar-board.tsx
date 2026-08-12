"use client";

import { Bell, CalendarDays, ChevronLeft, ChevronRight, Clock, GripVertical, Inbox, Plus, Sun, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState, useTransition } from "react";

import {
    CalendarCategory,
    CalendarItemDTO,
    CalendarItemInput,
    CalendarItemType,
    createCalendarItem,
    deleteCalendarItem,
    scheduleCalendarItem,
    updateCalendarItem,
} from "@/app/calendar/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserCategoryDTO } from "@/lib/user-preferences";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week";
type DraftForm = {
    title: string;
    description: string;
    scheduledTime: string;
    isAllDay: boolean;
    itemType: CalendarItemType;
    category: CalendarCategory;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fallbackCategories: UserCategoryDTO[] = [
    { id: -1, scope: "calendar", name: "Work", color: "#505081", icon: "BriefcaseBusiness", createdAt: "", updatedAt: "" },
    { id: -2, scope: "calendar", name: "Personal", color: "#D6577A", icon: "Heart", createdAt: "", updatedAt: "" },
    { id: -3, scope: "calendar", name: "Focus", color: "#4C7FD1", icon: "Focus", createdAt: "", updatedAt: "" },
    { id: -4, scope: "calendar", name: "Meeting", color: "#D99A34", icon: "Users", createdAt: "", updatedAt: "" },
    { id: -5, scope: "reminder", name: "Reminder", color: "#7C6BD4", icon: "Bell", createdAt: "", updatedAt: "" },
];
const emptyForm: DraftForm = { title: "", description: "", scheduledTime: "", isAllDay: false, itemType: "task", category: "Work" };

function dateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(date.getDate() + days);
    return next;
}

function startOfWeek(date: Date) {
    return addDays(date, -date.getDay());
}

function addMonths(date: Date, months: number) {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getMonthDays(anchor: Date) {
    const start = startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const end = addDays(startOfWeek(monthEnd), 6);
    // Only render the weeks the month actually touches, so short months don't end on a dead row.
    const weekCount = Math.round((end.getTime() - start.getTime()) / 86_400_000 / 7);
    return Array.from({ length: weekCount * 7 }, (_, index) => addDays(start, index));
}

function getWeekDays(anchor: Date) {
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function formatPeriod(date: Date, view: CalendarView) {
    if (view === "month") {
        return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
    }

    const start = startOfWeek(date);
    const end = addDays(start, 6);
    const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
    return `${formatter.format(start)} - ${formatter.format(end)}, ${end.getFullYear()}`;
}

function sortItems(items: CalendarItemDTO[]) {
    return [...items].sort((a, b) => {
        if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1;
        if (a.scheduledTime && b.scheduledTime) return a.scheduledTime.localeCompare(b.scheduledTime);
        if (a.scheduledTime) return -1;
        if (b.scheduledTime) return 1;
        return a.createdAt.localeCompare(b.createdAt);
    });
}

export function CalendarBoard({ initialItems, categories }: { initialItems: CalendarItemDTO[]; categories: UserCategoryDTO[] }) {
    const today = useMemo(() => new Date(), []);
    const categoryOptions = useMemo(() => {
        const seen = new Set<string>();
        return [...categories, ...fallbackCategories].filter((category) => {
            const key = `${category.scope}:${category.name.toLowerCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [categories]);
    const [items, setItems] = useState(initialItems);
    const [view, setView] = useState<CalendarView>("month");
    const [anchorDate, setAnchorDate] = useState(today);
    const [selectedDate, setSelectedDate] = useState(dateKey(today));
    const [form, setForm] = useState<DraftForm>(emptyForm);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    const scheduledItems = items.filter((item) => !item.isDraft && item.scheduledDate);
    const draftItems = items.filter((item) => item.isDraft);
    const visibleDays = view === "month" ? getMonthDays(anchorDate) : getWeekDays(anchorDate);
    const itemsByDate = useMemo(
        () =>
            scheduledItems.reduce<Record<string, CalendarItemDTO[]>>((grouped, item) => {
                if (!item.scheduledDate) return grouped;
                grouped[item.scheduledDate] = [...(grouped[item.scheduledDate] || []), item];
                return grouped;
            }, {}),
        [scheduledItems],
    );

    function openDialog(date: string) {
        setSelectedDate(date);
        setForm(emptyForm);
        setEditingItemId(null);
        setError("");
        setDialogOpen(true);
    }

    function openEditDialog(item: CalendarItemDTO) {
        if (!item.scheduledDate) return;

        setSelectedDate(item.scheduledDate);
        setEditingItemId(item.id);
        setForm({
            title: item.title,
            description: item.description || "",
            scheduledTime: item.scheduledTime || "",
            isAllDay: item.isAllDay,
            itemType: item.itemType,
            category: item.category,
        });
        setError("");
        setDialogOpen(true);
    }

    function upsertItem(nextItem: CalendarItemDTO) {
        setItems((current) => {
            const exists = current.some((item) => item.id === nextItem.id);
            return exists ? current.map((item) => (item.id === nextItem.id ? nextItem : item)) : [nextItem, ...current];
        });
    }

    function trackDrag(id: number | null) {
        setDraggingId(id);
        if (id === null) setDragOverDate(null);
    }

    function removeItem(id: number) {
        setItems((current) => current.filter((item) => item.id !== id));
    }

    function deleteItem(id: number) {
        const previous = items.find((item) => item.id === id);
        if (!previous) return;

        setError("");
        removeItem(id);
        if (editingItemId === id) {
            setDialogOpen(false);
            setEditingItemId(null);
        }

        startTransition(async () => {
            try {
                await deleteCalendarItem(id);
            } catch (requestError) {
                upsertItem(previous);
                setError(requestError instanceof Error ? requestError.message : "Could not delete that item.");
            }
        });
    }

    function submitItem(asDraft: boolean) {
        const input: CalendarItemInput = {
            ...form,
            scheduledDate: selectedDate,
            scheduledTime: form.isAllDay ? null : form.scheduledTime,
            isAllDay: form.isAllDay,
        };
        setError("");
        startTransition(async () => {
            try {
                const nextItem = editingItemId
                    ? await updateCalendarItem(editingItemId, input, asDraft)
                    : await createCalendarItem(input, asDraft);

                upsertItem(nextItem);
                setDialogOpen(false);
                setEditingItemId(null);
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : "Something went wrong.");
            }
        });
    }

    function onFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        submitItem(false);
    }

    function onDropItem(targetDate: string) {
        setDragOverDate(null);
        if (!draggingId) return;
        const previous = items.find((item) => item.id === draggingId);
        if (!previous || previous.scheduledDate === targetDate) {
            setDraggingId(null);
            return;
        }

        upsertItem({ ...previous, scheduledDate: targetDate, isDraft: false });
        setDraggingId(null);
        startTransition(async () => {
            try {
                upsertItem(await scheduleCalendarItem(previous.id, targetDate));
            } catch (requestError) {
                upsertItem(previous);
                setError(requestError instanceof Error ? requestError.message : "Could not move that item.");
            }
        });
    }

    return (
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <Card className="min-w-0 overflow-hidden rounded-lg border-border bg-card shadow-sm">
                <CardHeader className="gap-4 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <CardTitle className="truncate text-xl">{formatPeriod(anchorDate, view)}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">Drop drafts or scheduled items onto any date.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex rounded-lg border border-border bg-background p-1">
                                {(["month", "week"] as CalendarView[]).map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setView(option)}
                                        className={cn(
                                            "h-8 rounded-md px-3 text-xs font-medium capitalize transition-colors",
                                            view === option ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent",
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <Button variant="outline" className="rounded-lg bg-card" onClick={() => setAnchorDate(today)}>
                                <CalendarDays className="mr-2 size-4 text-sage-600" aria-hidden="true" />
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-lg bg-card"
                                onClick={() => setAnchorDate((date) => (view === "month" ? addMonths(date, -1) : addDays(date, -7)))}
                                aria-label="Previous period"
                            >
                                <ChevronLeft className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-lg bg-card"
                                onClick={() => setAnchorDate((date) => (view === "month" ? addMonths(date, 1) : addDays(date, 7)))}
                                aria-label="Next period"
                            >
                                <ChevronRight className="size-4" aria-hidden="true" />
                            </Button>
                            <Button className="rounded-lg" onClick={() => openDialog(selectedDate)}>
                                <Plus className="mr-2 size-4" aria-hidden="true" />
                                New task
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {/* The grid keeps a minimum width so cells stay square and legible instead of being squeezed; narrow screens scroll horizontally. */}
                    <div className="overflow-x-auto border-t border-border bg-background/50">
                        <div className="min-w-[46rem] p-3 sm:p-4">
                            <div className="grid grid-cols-7 gap-1.5 pb-2 sm:gap-2">
                                {weekDays.map((day, index) => (
                                    <div
                                        key={day}
                                        className={cn(
                                            "min-w-0 text-center text-[11px] font-semibold uppercase tracking-[0.08em]",
                                            index === 0 || index === 6 ? "text-primary/70" : "text-muted-foreground",
                                        )}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                {visibleDays.map((day) => {
                                    const key = dateKey(day);
                                    const dayItems = sortItems(itemsByDate[key] || []);
                                    const isToday = key === dateKey(today);
                                    const inCurrentMonth = view === "week" || day.getMonth() === anchorDate.getMonth();
                                    const isDropTarget = dragOverDate === key;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => openDialog(key)}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                setDragOverDate(key);
                                            }}
                                            onDragLeave={(event) => {
                                                // dragleave also fires when the cursor moves onto a chip inside the cell, which would flicker the highlight.
                                                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                                                setDragOverDate((current) => (current === key ? null : current));
                                            }}
                                            onDrop={(event) => {
                                                event.preventDefault();
                                                onDropItem(key);
                                            }}
                                            className={cn(
                                                "group flex min-w-0 flex-col rounded-xl border p-2 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                                                view === "month" ? "aspect-square" : "min-h-[26rem]",
                                                inCurrentMonth
                                                    ? "border-border bg-card shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                                    : "border-transparent bg-muted/40 opacity-70 hover:bg-muted/70 hover:opacity-100",
                                                isToday && "border-primary bg-primary/[0.06] ring-1 ring-primary/25",
                                                isDropTarget && "border-dashed border-primary bg-primary/10 ring-2 ring-primary/30",
                                            )}
                                        >
                                            <div className="mb-1.5 flex items-center justify-between gap-1">
                                                <span
                                                    className={cn(
                                                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors",
                                                        isToday
                                                            ? "bg-primary text-primary-foreground shadow-sm"
                                                            : inCurrentMonth
                                                                ? "text-foreground group-hover:bg-accent/60"
                                                                : "text-muted-foreground/60",
                                                    )}
                                                >
                                                    {day.getDate()}
                                                </span>
                                                {dayItems.length > 0 && (
                                                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground group-hover:hidden">
                                                        {dayItems.length}
                                                    </span>
                                                )}
                                                <Plus
                                                    className={cn(
                                                        "size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
                                                        dayItems.length > 0 && "hidden group-hover:block",
                                                    )}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                {dayItems.map((item) => (
                                                    <TaskChip
                                                        key={item.id}
                                                        item={item}
                                                        categories={categoryOptions}
                                                        setDraggingId={trackDrag}
                                                        onOpenEdit={() => openEditDialog(item)}
                                                        onDelete={() => deleteItem(item.id)}
                                                    />
                                                ))}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="h-fit min-w-0 rounded-lg border-border bg-card shadow-sm">
                <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">Draft Task Panel</CardTitle>
                        <span className="rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{draftItems.length}</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-5 pt-0">
                    <Button variant="outline" className="w-full rounded-lg bg-background" onClick={() => openDialog(selectedDate)}>
                        <Plus className="mr-2 size-4 text-primary" aria-hidden="true" />
                        Add draft
                    </Button>
                    {draftItems.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border bg-background p-5 text-center">
                            <Inbox className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />
                            <p className="mt-3 text-sm font-medium">No drafts waiting</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">Save unscheduled tasks here, then drag them onto a date.</p>
                        </div>
                    ) : (
                        draftItems.map((item) => (
                            <DraftTask
                                key={item.id}
                                item={item}
                                categories={categoryOptions}
                                setDraggingId={trackDrag}
                                onDelete={() => deleteItem(item.id)}
                            />
                        ))
                    )}
                </CardContent>
            </Card>

            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-4 backdrop-blur-sm sm:items-center">
                    <div className="w-full max-w-lg rounded-lg border border-border bg-card p-5 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">{editingItemId ? "Edit calendar item" : "Create calendar item"}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Selected date: {parseDateKey(selectedDate).toLocaleDateString()}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => {
                                    setDialogOpen(false);
                                    setEditingItemId(null);
                                }}
                            >
                                Close
                            </Button>
                        </div>

                        <form className="mt-5 space-y-4" onSubmit={onFormSubmit}>
                            <label className="block text-sm font-medium">
                                Task title
                                <input
                                    value={form.title}
                                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                                    className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="Write the next thing to remember"
                                    required
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Description
                                <textarea
                                    value={form.description}
                                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                    className="mt-2 min-h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="Add helpful context"
                                />
                            </label>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="min-w-0">
                                    <label className="block text-sm font-medium">
                                        Time
                                        <input
                                            type="time"
                                            value={form.isAllDay ? "" : form.scheduledTime}
                                            onChange={(event) => setForm((current) => ({ ...current, scheduledTime: event.target.value }))}
                                            disabled={form.isAllDay}
                                            className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                                        />
                                    </label>
                                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            checked={form.isAllDay}
                                            onChange={(event) => {
                                                const isAllDay = event.target.checked;
                                                setForm((current) => ({ ...current, isAllDay, scheduledTime: isAllDay ? "" : current.scheduledTime }));
                                            }}
                                            className="size-4 shrink-0 cursor-pointer rounded border-input accent-primary"
                                        />
                                        All day
                                    </label>
                                </div>
                                <label className="block text-sm font-medium">
                                    Type
                                    <select
                                        value={form.itemType}
                                        onChange={(event) => {
                                            const itemType = event.target.value as CalendarItemType;
                                            const nextCategory = categoryOptions.find((category) => category.scope === (itemType === "reminder" ? "reminder" : "calendar"));
                                            setForm((current) => ({ ...current, itemType, category: nextCategory?.name || current.category }));
                                        }}
                                        className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="task">Task</option>
                                        <option value="reminder">Reminder</option>
                                    </select>
                                </label>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Category</p>
                                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                    {categoryOptions
                                        .filter((category) => (form.itemType === "reminder" ? category.scope === "reminder" : category.scope === "calendar"))
                                        .map((category) => (
                                            <button
                                                key={`${category.scope}-${category.name}`}
                                                type="button"
                                                onClick={() => setForm((current) => ({ ...current, category: category.name }))}
                                                className={cn(
                                                    "flex h-10 min-w-0 items-center justify-center gap-2 rounded-lg border px-2 text-xs font-medium transition-colors",
                                                    form.category === category.name ? "ring-1 ring-ring" : "opacity-80 hover:opacity-100",
                                                )}
                                                style={{ borderColor: `${category.color}55`, color: category.color }}
                                            >
                                                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} aria-hidden="true" />
                                                <span className="truncate">{category.name}</span>
                                            </button>
                                        ))}
                                </div>
                            </div>
                            {error && <p className="rounded-lg bg-clay-100 px-3 py-2 text-sm text-clay-800">{error}</p>}
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                                {editingItemId && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-lg border-clay-200 bg-background text-clay-700 hover:bg-clay-100 hover:text-clay-800 sm:mr-auto"
                                        onClick={() => deleteItem(editingItemId)}
                                        disabled={isPending}
                                    >
                                        <Trash2 className="mr-2 size-4" aria-hidden="true" />
                                        Delete
                                    </Button>
                                )}
                                {!editingItemId && (
                                    <Button type="button" variant="outline" className="rounded-lg bg-background" onClick={() => submitItem(true)} disabled={isPending}>
                                        Save draft
                                    </Button>
                                )}
                                <Button type="submit" className="rounded-lg" disabled={isPending}>
                                    {editingItemId ? "Save changes" : "Schedule"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function TaskChip({
    item,
    categories,
    setDraggingId,
    onOpenEdit,
    onDelete,
}: {
    item: CalendarItemDTO;
    categories: UserCategoryDTO[];
    setDraggingId: (id: number | null) => void;
    onOpenEdit: () => void;
    onDelete: () => void;
}) {
    const style = categoryStyle(item.category, categories);
    return (
        <div
            draggable
            onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", String(item.id));
                setDraggingId(item.id);
            }}
            onDragEnd={() => setDraggingId(null)}
            onClick={(event) => {
                event.stopPropagation();
                onOpenEdit();
            }}
            className="group/chip relative min-w-0 cursor-grab rounded-md border border-l-[3px] px-1.5 py-1 text-[11px] leading-tight shadow-sm transition-shadow hover:shadow active:cursor-grabbing"
            style={{ borderColor: `${style.color}40`, borderLeftColor: style.color, backgroundColor: `${style.color}14` }}
        >
            <div className="flex min-w-0 items-center gap-1">
                {item.itemType === "reminder" && <Bell className="size-3 shrink-0 text-primary" aria-hidden="true" />}
                <span className="truncate font-medium text-foreground">{item.title}</span>
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete();
                    }}
                    onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        event.stopPropagation();
                        onDelete();
                    }}
                    aria-label={`Delete ${item.title}`}
                    className="ml-auto shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-clay-100 hover:text-clay-700 focus-visible:opacity-100 group-hover/chip:opacity-100"
                >
                    <Trash2 className="size-3" aria-hidden="true" />
                </span>
            </div>
            {(item.isAllDay || item.scheduledTime || item.itemType === "reminder") && (
                <div className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.isAllDay ? <Sun className="size-2.5" aria-hidden="true" /> : item.scheduledTime ? <Clock className="size-2.5" aria-hidden="true" /> : null}
                    <span className="truncate">{item.isAllDay ? "All day" : item.scheduledTime || "Reminder"}</span>
                </div>
            )}
        </div>
    );
}

function DraftTask({
    item,
    categories,
    setDraggingId,
    onDelete,
}: {
    item: CalendarItemDTO;
    categories: UserCategoryDTO[];
    setDraggingId: (id: number | null) => void;
    onDelete: () => void;
}) {
    const style = categoryStyle(item.category, categories);
    return (
        <div
            draggable
            onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", String(item.id));
                setDraggingId(item.id);
            }}
            onDragEnd={() => setDraggingId(null)}
            className="group/draft cursor-grab rounded-lg border border-l-4 bg-background p-3 shadow-sm active:cursor-grabbing"
            style={{ borderLeftColor: style.color }}
        >
            <div className="flex items-start gap-2">
                <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</p>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete();
                            }}
                            aria-label={`Delete ${item.title}`}
                            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-clay-100 hover:text-clay-700 focus-visible:opacity-100 group-hover/draft:opacity-100"
                        >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                        </button>
                    </div>
                    {item.description && <p className="mt-1 max-h-10 overflow-hidden text-xs leading-5 text-muted-foreground">{item.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-md border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: `${style.color}55`, color: style.color }}>
                            {style.label}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">{item.itemType}</span>
                        {item.isAllDay && (
                            <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                <Sun className="size-3" aria-hidden="true" />
                                All day
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function categoryStyle(name: string, categories: UserCategoryDTO[]) {
    const category = categories.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return {
        label: category?.name || name || "Work",
        color: category?.color || "#505081",
    };
}