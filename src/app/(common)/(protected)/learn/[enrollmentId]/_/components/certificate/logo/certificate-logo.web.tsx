'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LOGO } from './constants';

export function CertificateLogoWeb() {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center justify-center">
      <div
        className="flex items-center justify-center rounded-full shadow-lg"
        style={{
          width: LOGO.SIZE,
          height: LOGO.SIZE,
          background: `linear-gradient(135deg, ${LOGO.BG_GRADIENT_START}, ${LOGO.BG_GRADIENT_END})`,
        }}
      >
        <svg
          width={LOGO.INNER_SIZE}
          height={LOGO.INNER_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <path d="M12 2L2 7L12 12L22 7L12 2Z" />
          <path d="M2 17L12 22L22 17" />
          <path d="M2 12L12 17L22 12" />
        </svg>
      </div>
    </motion.div>
  );
}
