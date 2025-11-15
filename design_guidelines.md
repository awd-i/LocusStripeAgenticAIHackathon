# Design Guidelines: AI Transaction Agent Dashboard

## Design Approach
**Reference-Based: Vercel-Inspired Interface**

Drawing from Vercel's clean, developer-focused aesthetic with emphasis on modern gradients, typography, and spatial efficiency. This dashboard requires professional trustworthiness (handling financial transactions) combined with technical sophistication.

---

## Core Design Elements

### A. Typography
**Font Stack:**
- **Primary UI**: Inter (via Google Fonts) - all weights 400, 500, 600, 700
- **Monospace**: JetBrains Mono - for transaction IDs, addresses, timestamps, logs

**Hierarchy:**
- **Page Titles**: text-4xl font-bold (36px)
- **Section Headers**: text-2xl font-semibold (24px)
- **Card Titles**: text-lg font-semibold (18px)
- **Body Text**: text-sm font-normal (14px)
- **Labels**: text-xs font-medium uppercase tracking-wide (12px)
- **Monospace Data**: text-sm font-mono (14px)

### B. Layout System
**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Container padding: `p-8` on desktop, `p-4` on mobile
- Card padding: `p-6`
- Section gaps: `gap-8` for major sections, `gap-4` for related items
- Component margins: `mb-8` between major blocks, `mb-4` within sections

**Grid Structure:**
- Sidebar navigation: Fixed 240px width (`w-60`)
- Main content area: `flex-1` with `max-w-7xl mx-auto`
- Dashboard cards: 2-column grid on desktop (`grid-cols-2`), single column mobile
- Stats overview: 3-4 columns (`grid-cols-4` on xl screens)

### C. Component Library

**Navigation:**
- Fixed left sidebar (240px) with logo at top
- Navigation items: Icon + label, hover state with subtle background
- Active state: Accent gradient background with increased font weight
- Mobile: Collapsible hamburger menu

**Dashboard Cards:**
- Rounded corners: `rounded-xl`
- Border: 1px semi-transparent border
- Shadow: Subtle shadow on hover (`hover:shadow-xl` transition)
- Backdrop blur for glass-morphism effect where appropriate
- Header with title + action button (right-aligned)

**Transaction List:**
- Table-based layout with alternating row treatments
- Monospace font for IDs, addresses, amounts
- Status badges (pill-shaped, color-coded: green for approved, yellow for pending, red for rejected)
- Expandable rows for transaction details and voice logs

**Voice Interaction Module:**
- Waveform visualization during active calls
- Transcript display with speaker labels (Agent/User)
- Timestamp markers in monospace
- Recording playback controls

**Agent Configuration Panel:**
- Segmented control for different config sections
- Input fields with clear labels and helper text
- Range sliders for spending limits with live value display
- Toggle switches for permissions
- Save button with loading state

**Emergency Stop Button:**
- Large, prominent placement in header or sidebar
- Red accent with icon
- Confirmation modal before execution
- Disabled state when no active transactions

**Real-time Stats:**
- Large numeric values with descriptive labels below
- Trend indicators (arrows/percentages)
- Sparkline charts for historical context
- Auto-refresh indicator

### D. Visual Treatment

**Gradient Accents (Vercel-style):**
- Primary gradient: Purple to pink (`from-purple-500 to-pink-500`)
- Secondary gradient: Blue to cyan (`from-blue-500 to-cyan-500`)
- Background gradients: Subtle, large-scale gradients in dark interface
- Text gradients: Applied to headings via `bg-clip-text text-transparent`

**Background Patterns:**
- Dot grid pattern (subtle, in background)
- Radial gradient overlays for depth
- Dark base (`bg-gray-950` or `bg-black`)

**Glass Morphism:**
- Used on modal overlays and floating elements
- `backdrop-blur-xl` with semi-transparent backgrounds
- Subtle border highlights

**Status Indicators:**
- Live pulse animation for active/ongoing transactions
- Color coding: Green (success/approved), Yellow (pending), Red (failed/rejected), Blue (processing)

---

## Page Structure

### Main Dashboard
1. **Header Bar**: Logo + page title + emergency stop button
2. **Stats Row**: 4-card grid showing total transactions, pending approvals, active calls, total spent
3. **Two-Column Layout**:
   - Left: Recent transactions table (expandable rows)
   - Right: Voice activity feed + agent status card
4. **Bottom Section**: Quick actions and recent activity timeline

### Agent Configuration
1. **Tab Navigation**: Spending Limits | Permissions | Merchants | Voice Settings
2. **Form Sections**: Card-based grouped inputs
3. **Live Preview**: Shows current configuration summary
4. **Action Bar**: Cancel + Save buttons (sticky bottom on mobile)

### Transaction Detail View
1. **Hero Section**: Transaction ID, amount, status (large, centered)
2. **Info Grid**: 2-3 columns with transaction metadata
3. **Voice Transcript Card**: Full conversation log if applicable
4. **Action Log**: Timeline of agent decisions and API calls

---

## Key Interactions

**Hover States:**
- Cards: Slight elevation increase, border glow
- Buttons: Background brightness increase
- Links: Underline slide-in animation

**Loading States:**
- Skeleton screens for data tables
- Spinner + "Processing..." text for actions
- Progress bar for long-running operations

**Transitions:**
- Page transitions: Fade (200ms)
- Card appearances: Slide up + fade (300ms, staggered)
- Modal overlays: Backdrop blur in + scale (250ms)

**Animations (Minimal):**
- Live transaction pulse indicator
- Waveform animation during active calls
- Number counter animations for stats updates
- Subtle gradient shift on hover (slow, 2-3s loop)

---

## Icons
**Library:** Heroicons (outline style for navigation, solid for status indicators)
- Navigation icons: 24px
- Status badges: 16px
- Action buttons: 20px

---

## Accessibility
- High contrast ratios for all text on dark backgrounds
- Focus visible states with outline rings
- ARIA labels for icon-only buttons
- Keyboard navigation support throughout
- Screen reader announcements for real-time updates

---

## Mobile Responsiveness
- Sidebar collapses to hamburger menu
- Stats cards stack vertically
- Tables switch to card-based mobile view
- Touch-friendly tap targets (minimum 44px)
- Bottom navigation bar for primary actions