import React from 'react';
import { View, Svg, Defs, LinearGradient, Stop, Path } from '@react-pdf/renderer';
import { LOGO } from './constants';

export function CertificateLogoPDF() {
  return (
    <View
      style={{
        width: LOGO.SIZE,
        height: LOGO.SIZE,
        borderRadius: LOGO.SIZE / 2,
        overflow: 'hidden',
        marginBottom: 24,
      }}
    >
      <Svg viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={LOGO.BG_GRADIENT_START} />
            <Stop offset="100%" stopColor={LOGO.BG_GRADIENT_END} />
          </LinearGradient>
        </Defs>

        {/* Background */}
        <Path d="M0 0h100v100H0z" fill="url(#grad)" />

        {/* Icon */}
        <Path
          d="M50 20L20 35L50 50L80 35L50 20Z
             M20 65L50 80L80 65
             M20 50L50 65L80 50"
          stroke="white"
          strokeWidth={4}
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
