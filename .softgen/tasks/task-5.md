---
title: Chaos Cleaner Integration (Rooms & Resets)
status: todo
priority: high
type: feature
tags: [chores, rooms, cleaner]
created_by: agent
created_at: 2026-06-18T21:36:06Z
position: 5
---

## Notes
Integrating the user's "Chaos Cleaner" concept. This replaces standard chores with a room-based cleaning dashboard, detailed task frequencies, and dedicated Reset modes.

## Checklist
- [ ] Build the Cleaning Dashboard showing: Today's progress, # of daily tasks complete, % complete, current streak, tasks due today.
- [ ] Create exactly 11 Room Cards: Kitchen, Lounge Room, Dining Room, Master Bedroom, Master Bathroom, Guest Bathroom, Guest Toilet, Spare Toilet, Laundry, Activity Room, Entry Way.
- [ ] Implement the room detail view showing a task list divided into: Daily, Weekly, Monthly, and Deep Clean tasks with a room-specific progress percentage.
- [ ] Build the chore creation system allowing task name, room, frequency, due date, notes, priority, and recurring schedules.
- [ ] Build "Daily Reset" mode: Shows only daily tasks due today grouped by room, allowing rapid check-offs, updating streaks, and displaying a "daily reset complete" success state.
- [ ] Build "Weekly Reset" mode: Shows all weekly tasks grouped by room, tracking weekly progress.
- [ ] Implement logic to automatically reset daily/weekly tasks based on their frequency.

## Acceptance
- All 11 specific rooms exist by default and have their own task lists.
- User can enter "Daily Reset" mode and quickly check off all daily chores room-by-room.
- Task completion drives the progress rings on the Cleaning Dashboard.