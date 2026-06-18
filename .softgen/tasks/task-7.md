---
title: Settings, Customisation, and Local JSON Backup
status: todo
priority: medium
type: feature
tags: [settings, data, export]
created_by: agent
created_at: 2026-06-18T21:36:06Z
position: 7
---

## Notes
Handles local storage data management, privacy guarantees, and extensive aesthetic customisation options.

## Checklist
- [ ] Build a Settings page with a "Data & Privacy" section explicitly stating no cloud storage is used.
- [ ] Implement JSON Backup: "Export Data" (downloads local storage as JSON) and "Import Data" (restores app state from JSON).
- [ ] Add a customisation setting to select Accent Colours. Must include: Deep purple, Hot pink, Lilac, Silver, Blood red, and Midnight blue (updates CSS variables globally).
- [ ] Add UI to add, edit, or rename custom rooms (extending the base 11) and custom chore categories.
- [ ] Implement a "Reorder dashboard widgets" setting (drag-and-drop or simple up/down arrows) saving preference to local storage.
- [ ] Add ability to "Copy previous day's routine" for the daily planner hourly schedule.
- [ ] Add a "Clear/Reset Section" utility for wiping specific data (e.g., clear all meals, clear all chores).

## Acceptance
- JSON export creates a valid file that can be re-imported successfully.
- User can change the app's accent colour to "Blood red" and see the UI update immediately.
- Dashboard widgets can be reordered and the order persists on reload.