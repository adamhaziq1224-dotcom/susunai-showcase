/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Toaster } from '@/components/ui/sonner';
import { AuthWrapper } from '@/src/components/AuthWrapper';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <AuthWrapper>
      <Dashboard />
      <Toaster />
    </AuthWrapper>
  );
}
