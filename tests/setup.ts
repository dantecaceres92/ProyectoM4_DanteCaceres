import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('../src/services/firebase', () => import('./mocks/firebase'));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
