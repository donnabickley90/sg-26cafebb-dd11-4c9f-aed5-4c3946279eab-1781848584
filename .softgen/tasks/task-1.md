---
title: Base Layout, Navigation, and Cyber-Kawaii Theme Setup
status: done
priority: urgent
type: chore
tags:
- layout
- theme
- navigation
created_by: agent
created_at: 2026-06-18 21:36:06+00:00
position: 1
---

## Notes
Set up the global application shell, the dark-mode-first cyber-kawaii design system, and the core layout. The design must be pretty enough to encourage daily use without feeling like corporate productivity software.

## Checklist
- [x] Configure `globals.css` with dark soft-goth Shadcn tokens (charcoal backgrounds, hot pink primary, deep purple secondary, soft lilac accents) and soft shadows.
- [x] Import and apply `Quicksand` (headings) and `Nunito` (body) via Next.js Font optimization.
- [x] Create a persistent global navigation layout (sidebar on desktop, bottom bar on mobile) linking to exactly: Home, Planner, Calendar, Meals, Chores, Rooms, Deep Clean, Declutter, Birthdays, Stats, and Settings.
- [x] Implement cute thematic icons from Lucide React (e.g., Sparkles, PawPrint, Moon, Stars) for the navigation items.
- [x] Build a reusable, highly rounded (`rounded-3xl`) Card component with subtle pink/purple hover glows.
- [x] Build reusable UI primitives for visual progress tracking: cute Progress Bars and circular Progress Rings.

## Acceptance
- The app strictly defaults to dark mode with deep charcoal and pink/purple glows.
- The 11 required navigation links are visible and route correctly.
- UI elements feature heavy rounding and soft shadows fitting the cozy aesthetic.
