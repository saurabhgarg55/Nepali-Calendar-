/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { SelfTestResult } from '../utils/dateConverter';

interface SelfTestBannerProps {
  selfTest: SelfTestResult;
}

export const SelfTestBanner: React.FC<SelfTestBannerProps> = ({ selfTest }) => {
  if (selfTest.passed) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 shadow-lg flex items-center justify-between gap-3 text-xs font-bold sticky top-14 z-40">
      <div className="flex items-center gap-2">
        <AlertOctagon className="w-5 h-5 shrink-0 animate-bounce" />
        <span>
          CRITICAL ERROR: Date integrity self-test failed! Do not rely on conversions.
          Failures: {selfTest.failures.slice(0, 2).join('; ')}
        </span>
      </div>
    </div>
  );
};
