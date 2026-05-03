import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';

/** Avoid duplicate DOM during React Strict Mode double-invoke (breaks getByRole). */
configure({ reactStrictMode: false });

afterEach(() => {
  cleanup();
});
