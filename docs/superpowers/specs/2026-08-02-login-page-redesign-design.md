# Design Spec: Login Page Redesign for NCIS RSUD KHZ. Musthafa Tasikmalaya

**Date:** 2026-08-02  
**Status:** Draft / Pending Review  
**Target File(s):** 
- `src/app/(auth)/login/page.tsx`
- `src/components/auth/login-form.tsx`
- `src/app/layout.tsx` (Typography configuration if adding Plus Jakarta Sans)

---

## 1. Overview & Goals

Redesign the NCIS (Non Clinical Integrated System) login page for RSUD KHZ. Musthafa Tasikmalaya to present a highly modern, professional, and visually stunning healthcare platform experience.

Key changes:
1. **Split Screen Layout**: Left side (~60%) dedicated to hospital hero branding with the aerial photo background (`/bg-login.jpg`); Right side (~40%) housing the login card.
2. **Glassmorphism Overlay**: A center-aligned, frosted glass container over the aerial background with ambient glow and crisp borders (`border-white/10`, `backdrop-blur-md`).
3. **Centered Hero Typography**:
   - Headline: **NON CLINICAL INTEGRATED SYSTEM**
   - Subtitle: **(RSUD KHZ. MUSTHAFA TASIKMALAYA)**
   - Operational Sub-heading: *CSSD & Laundry Operational Portal*
4. **Color Tone Preservation**: Retain the existing dark slate/sky color hierarchy (`slate-950`, `slate-900`, `sky-500`, `teal-500`, `slate-300`).
5. **Modern Shadcn/UI Form Card**: Refined inputs, tactile button states (`active:scale-[0.98]`), and polished demo credential pills.

---

## 2. Layout & Responsive Structure

```
+----------------------------------------------------+-----------------------------+
| LEFT HERO SECTION (60% Desktop / Top Mobile)       | RIGHT LOGIN CARD (40%)      |
| Background: /bg-login.jpg + Slate-950 Overlay      | Surface: Slate-900          |
|                                                    | Border: Slate-800           |
|        [ CENTERED GLASSMORPHISM OVERLAY ]          |                             |
|    +------------------------------------------+    |   [ Welcome Header ]        |
|    |  (Icon) NCIS HEALTHCARE PLATFORM         |    |   [ Email Input ]           |
|    |  NON CLINICAL INTEGRATED SYSTEM          |    |   [ Password Input ]        |
|    |  (RSUD KHZ. MUSTHAFA TASIKMALAYA)        |    |   [ Masuk Button ]          |
|    |  CSSD & Laundry Operational Portal       |    |   [ Demo Credentials ]      |
|    +------------------------------------------+    |                             |
+----------------------------------------------------+-----------------------------+
```

### Viewport & Mechanics:
- Desktop (`lg:flex` or `lg:grid`): Split 60/40 layout filling `min-h-[100dvh]`.
- Mobile (`< 1024px`): Stacked layout where hero banner sits at top with auto height and login card occupies lower section seamlessly.
- Viewport Stability: Use `min-h-[100dvh]` to avoid iOS address bar jumping.

---

## 3. Visual & Styling Details

### A. Left Section (Hero & Glass Overlay)
- **Background Image**: Cover image positioned with `object-cover object-center` linking to `/bg-login.jpg`.
- **Mask Overlay**: Deep slate-950 vignette tint with subtle radial gradient to ensure dark aesthetic and contrast for text overlay.
- **Glass Card Overlay**:
  - Center positioned using Flexbox (`flex flex-col items-center justify-center`).
  - Container styling: `bg-slate-950/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl p-8 sm:p-10 max-w-xl text-center space-y-4`.
  - Ambient glow: Cyan & Teal soft radial light blurs behind the glass card (`bg-sky-500/20 blur-3xl`).
- **Typography Scale**:
  - Badge Chip: `inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-sky-400`.
  - Main Headline: `text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white leading-none`.
  - Hospital Subtitle: `text-sm sm:text-base font-bold tracking-wider text-sky-300 uppercase`.
  - Subtext: `text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto`.

### B. Right Section (Login Card)
- **Card Surface**: `bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 w-full max-w-md`.
- **Form Controls**:
  - Inputs: `bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 rounded-xl h-11 text-sm text-white placeholder-slate-500 transition-all`.
  - Submit Button: `bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold h-11 rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2`.
- **Demo Credentials Info Box**: Sleek mono-styled box with copyable or highlighted demo user accounts.

---

## 4. Verification & Testing

1. **Visual Inspection**: Ensure clean split-screen alignment on desktop and smooth collapse on mobile viewports.
2. **Contrast & Readability**: Confirm WCAG AA contrast compliance for text over the glassmorphism overlay and inputs.
3. **Authentication Functional Check**: Verify login action, error state rendering, and successful redirection remain fully intact.
