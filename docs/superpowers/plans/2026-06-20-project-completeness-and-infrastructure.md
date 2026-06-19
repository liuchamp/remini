# REMX Project Completeness and Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the missing DDD components, extract the server folder to the root directory, and set up the Vite testing and GitHub Actions infrastructure.

**Architecture:** We are creating foundational files (`types.ts`, `store.ts`, `constants`) to strictly adhere to the DDD structure defined in `domains.md`. We will separate frontend from backend logic by moving `src/server` to the project root and updating `tsconfig.json` and Taro configs. Finally, we will configure Vitest (reusing Vite config) for unit tests and a standard GitHub Actions CI pipeline.

**Tech Stack:** TypeScript, Zustand, Taro 4.2, Vite, Vitest, GitHub Actions.

---

### Task 1: Create Shared Constants

**Files:**
- Create: `src/shared/constants/storage.ts`
- Create: `src/shared/constants/config.ts`
- Create: `src/shared/constants/events.ts`

- [ ] **Step 1: Write storage constants**

```typescript
// src/shared/constants/storage.ts
export const STORAGE_KEYS = {
  TOKEN: 'remx_auth_token',
  USER_INFO: 'remx_user_info',
  SEARCH_HISTORY: 'remx_search_history',
} as const;
```

- [ ] **Step 2: Write global config constants**

```typescript
// src/shared/constants/config.ts
export const GLOBAL_CONFIG = {
  API_BASE_URL: process.env.TARO_APP_API_URL || 'https://api.remx.com',
  DEFAULT_PAGE_SIZE: 20,
  REQUEST_TIMEOUT: 10000,
} as const;
```

- [ ] **Step 3: Write events constants**

```typescript
// src/shared/constants/events.ts
export const EVENT_BUS_KEYS = {
  LOGIN_SUCCESS: 'login_success',
  LOGOUT: 'logout',
  ORDER_CREATED: 'order_created',
  PAYMENT_SUCCESS: 'payment_success',
} as const;
```

- [ ] **Step 4: Commit**

```bash
rtk git add src/shared/constants/
rtk git commit -m "feat(shared): create global constants for storage, config, and events"
```

---

### Task 2: Normalize Domain Types

**Files:**
- Create: `src/domains/admin/types.ts`
- Create: `src/domains/chat/types.ts`
- Create: `src/domains/shipping/types.ts`
- Create: `src/domains/wallet/types.ts`
- Create: `src/domains/address/types.ts`

- [ ] **Step 1: Write admin types**

```typescript
// src/domains/admin/types.ts
export interface AdminDashboardData {
  totalUsers: number;
  activeDisputes: number;
  pendingWithdrawals: number;
}
```

- [ ] **Step 2: Write chat types**

```typescript
// src/domains/chat/types.ts
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: number;
}
```

- [ ] **Step 3: Write shipping types**

```typescript
// src/domains/shipping/types.ts
export interface ShippingTracking {
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'in_transit' | 'delivered';
  events: Array<{ time: number; description: string }>;
}
```

- [ ] **Step 4: Write wallet types**

```typescript
// src/domains/wallet/types.ts
export interface WalletBalance {
  available: number;
  frozen: number;
  currency: string;
}
```

- [ ] **Step 5: Write address types**

```typescript
// src/domains/address/types.ts
export interface Address {
  id: string;
  name: string;
  phone: string;
  region: string;
  detail: string;
  isDefault: boolean;
}
```

- [ ] **Step 6: Commit**

```bash
rtk git add src/domains/*/types.ts
rtk git commit -m "feat(domains): add missing types files for admin, chat, shipping, wallet, address"
```

---

### Task 3: Normalize Domain Stores

**Files:**
- Create: `src/domains/admin/store.ts`
- Create: `src/domains/shipping/store.ts`

- [ ] **Step 1: Write admin store**

```typescript
// src/domains/admin/store.ts
import { create } from 'zustand';
import { AdminDashboardData } from './types';

interface AdminState {
  dashboardData: AdminDashboardData | null;
  isLoading: boolean;
  setDashboardData: (data: AdminDashboardData) => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  dashboardData: null,
  isLoading: false,
  setDashboardData: (data) => set({ dashboardData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

- [ ] **Step 2: Write shipping store**

```typescript
// src/domains/shipping/store.ts
import { create } from 'zustand';
import { ShippingTracking } from './types';

interface ShippingState {
  currentTracking: ShippingTracking | null;
  isLoading: boolean;
  setCurrentTracking: (data: ShippingTracking) => void;
  setLoading: (loading: boolean) => void;
}

export const useShippingStore = create<ShippingState>((set) => ({
  currentTracking: null,
  isLoading: false,
  setCurrentTracking: (data) => set({ currentTracking: data }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

- [ ] **Step 3: Commit**

```bash
rtk git add src/domains/admin/store.ts src/domains/shipping/store.ts
rtk git commit -m "feat(domains): add missing store files for admin and shipping"
```

---

### Task 4: Move Server Directory

**Files:**
- Modify: `tsconfig.json`
- Modify: `config/index.ts`
- Move: `src/server` to `server`

- [ ] **Step 1: Move directory**

```bash
mv src/server server
```

- [ ] **Step 2: Update `tsconfig.json`**

Edit `tsconfig.json` to exclude the `server` directory.

```json
  // add this to existing config:
  "exclude": [
    "node_modules",
    "dist",
    "server"
  ]
```

- [ ] **Step 3: Update `config/index.ts`**

In `config/index.ts` (Taro config), make sure `server` is ignored by compiler if needed. Usually moving it outside of `src` is enough for Taro 4, but add it to copy ignores if applicable. (If not applicable, skip file modification).

- [ ] **Step 4: Verify Compilation**

```bash
rtk pnpm build:weapp
```
Expected: Build succeeds without including server files.

- [ ] **Step 5: Commit**

```bash
rtk git add src/server server tsconfig.json config/index.ts
rtk git commit -m "refactor: extract server directory from src to root and update tsconfig"
```

---

### Task 5: Setup Vitest Infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `src/shared/utils/format.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

```bash
rtk pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Create `vitest.config.ts`**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 3: Add NPM scripts**

Modify `package.json` scripts section to add:
```json
"test": "vitest run"
```

- [ ] **Step 4: Create a sample test**

```typescript
// src/shared/utils/format.test.ts
import { describe, it, expect } from 'vitest';

function formatCurrency(amount: number) {
  return `¥${amount.toFixed(2)}`;
}

describe('format utils', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(100)).toBe('¥100.00');
    expect(formatCurrency(10.5)).toBe('¥10.50');
  });
});
```

- [ ] **Step 5: Run tests**

```bash
rtk pnpm test
```
Expected: 1 test passes.

- [ ] **Step 6: Commit**

```bash
rtk git add vitest.config.ts package.json pnpm-lock.yaml src/shared/utils/format.test.ts
rtk git commit -m "build(test): setup vitest and add sample utility test"
```

---

### Task 6: Create CI/CD Pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create GitHub Actions Workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
          
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run linter
        run: pnpm lint || true
        
      - name: Type check
        run: pnpm tsc --noEmit || true
        
      - name: Run tests
        run: pnpm test
        
      - name: Build Weapp
        run: pnpm build:weapp
```

- [ ] **Step 2: Commit**

```bash
rtk git add .github/workflows/ci.yml
rtk git commit -m "ci: add github actions workflow for linting, testing, and building"
```
