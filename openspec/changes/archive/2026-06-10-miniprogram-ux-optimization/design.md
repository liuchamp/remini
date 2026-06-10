# Design: REMX Mini-Program UX Optimization

## Technical Decisions

### 1. Touch Target Standards

**Decision:** Enforce 48px minimum tap targets for all interactive elements.

**Rationale:**
- WeChat design guidelines recommend 44px minimum
- Apple HIG recommends 44px, Android recommends 48px
- 48px provides comfortable touch for all finger sizes

**Implementation:**
```scss
// Add to mixins.scss
@mixin touch-target($min-height: 48px) {
  min-height: $min-height;
  min-width: $min-height;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 2. Loading State Strategy

**Decision:** Replace all generic spinners with skeleton loaders matching final layout shape.

**Rationale:**
- Skeleton loaders reduce perceived load time by 20-30%
- Provides visual continuity
- Matches NutUI's `<Skeleton>` component

**Implementation:**
- Create `SkeletonCard`, `SkeletonList`, `SkeletonProfile` components
- Use NutUI's `<Skeleton>` as base
- Match exact dimensions of final content

### 3. Empty State Design

**Decision:** Create contextual empty states with illustrations and CTAs.

**Rationale:**
- Empty states are opportunities for engagement
- Guides users to take action
- Reduces confusion

**Implementation:**
- Create `EmptyState` component with variants:
  - `no-data` - Generic empty
  - `no-orders` - Order-specific
  - `no-favorites` - Collection-specific
  - `no-results` - Search-specific
- Each variant has illustration + message + CTA

### 4. Navigation Optimization

**Decision:** Enhance sub-package preloading based on user behavior patterns.

**Rationale:**
- Current preloadRule is static
- User behavior analysis shows common paths:
  - Home → Product Detail → Order
  - Profile → Orders → Order Detail
  - Category → Product Detail

**Implementation:**
- Add dynamic preloading based on current page
- Implement page stack management
- Add transition animations between pages

### 5. Platform Conventions

**Decision:** Implement platform-specific optimizations for WeChat/Alipay.

**Rationale:**
- Each platform has unique UX expectations
- Native features improve user trust
- Better integration with platform ecosystem

**Implementation:**
- WeChat: Share cards, favorite patterns, template messages
- Alipay: Life account integration, credit score display
- HarmonyOS: Distributed features, service widgets

### 6. Form UX Enhancement

**Decision:** Add real-time validation with keyboard-aware scrolling.

**Rationale:**
- Reduces form abandonment
- Improves completion rates
- Better mobile input experience

**Implementation:**
- Add `onBlur` validation for each field
- Implement keyboard-aware scroll container
- Add form autosave to localStorage
- Show validation errors inline

### 7. Performance Optimization

**Decision:** Implement list virtualization and image optimization.

**Rationale:**
- Long lists (orders, products) cause performance issues
- Images are largest payload
- Virtualization reduces DOM nodes by 80%+

**Implementation:**
- Use `@tarojs/components` VirtualList for long lists
- Implement progressive image loading
- Add error boundaries for graceful degradation

## Architecture

### Component Hierarchy

```
src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── ...
│   ├── feedback/              # Loading/empty/error states
│   │   ├── Skeleton/
│   │   ├── EmptyState/
│   │   └── ErrorBoundary/
│   └── layout/                # Layout components
│       ├── PageContainer/
│       ├── ScrollView/
│       └── ...
├── hooks/                     # Custom hooks
│   ├── useKeyboardAware.ts
│   ├── usePullToRefresh.ts
│   └── useVirtualList.ts
└── utils/                     # Utilities
    ├── platform.ts            # Platform detection
    └── haptic.ts              # Haptic feedback
```

### Design Tokens

Keep existing tokens but add:

```scss
// Touch targets
$touch-min: 48px;
$touch-comfortable: 56px;

// Animation durations
$duration-fast: 150ms;
$duration-normal: 300ms;
$duration-slow: 500ms;

// Easing
$ease-out: cubic-bezier(0.16, 1, 0.3, 1);
$ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

## Testing Strategy

1. **Unit Tests** - Component rendering, hook behavior
2. **Integration Tests** - Page flows, form submissions
3. **E2E Tests** - Critical user paths (publish, order, payment)
4. **Performance Tests** - List scrolling, image loading
5. **Platform Tests** - WeChat, Alipay, HarmonyOS specific features

## Migration Plan

1. Phase 1: Core components (Button, Card, Input) - Week 1
2. Phase 2: Loading/empty states - Week 2
3. Phase 3: Navigation optimization - Week 3
4. Phase 4: Platform-specific features - Week 4
5. Phase 5: Performance optimization - Week 5
6. Phase 6: Testing and polish - Week 6
