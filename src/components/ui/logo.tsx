interface LogoProps {
  /** 'mark' = icon only (square). 'full' = icon + wordmark. */
  variant?: 'mark' | 'full';
  /** Which background this sits on, so text/ring colors stay legible. */
  theme?: 'light' | 'dark';
  className?: string;
}

/**
 * Inline SVG brand mark — renders crisp at any size with zero network
 * request, and can be recolored per-theme via the `theme` prop. Use this
 * instead of an <img> for the header/footer lockup; use the generated
 * PNGs (public/logo.png, public/logo-lockup-*.png) only where a raster
 * file is required (emails, share cards, external tools).
 */
export function Logo({ variant = 'full', theme = 'light', className }: LogoProps) {
  const ink = '#14213D';
  const paper = '#F8F7F2';
  const brass = '#A9812F';

  const boxFill = theme === 'dark' ? paper : ink;
  const glyphFill = theme === 'dark' ? ink : paper;
  const wordmarkFill = theme === 'dark' ? paper : ink;

  if (variant === 'mark') {
    return (
      <svg viewBox="0 0 140 140" className={className} role="img" aria-label="EduLearn">
        <rect width="140" height="140" rx="30" fill={boxFill} />
        <rect
          x="7"
          y="7"
          width="126"
          height="126"
          rx="24"
          fill="none"
          stroke={brass}
          strokeWidth="1"
          opacity="0.55"
        />
        <text
          x="70"
          y="97"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          fontSize="80"
          fill={glyphFill}
        >
          E
        </text>
        <rect x="47" y="103" width="46" height="4" rx="2" fill={brass} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 620 140" className={className} role="img" aria-label="EduLearn">
      <rect width="140" height="140" rx="30" fill={boxFill} />
      <rect
        x="7"
        y="7"
        width="126"
        height="126"
        rx="24"
        fill="none"
        stroke={brass}
        strokeWidth="1"
        opacity="0.55"
      />
      <text
        x="70"
        y="97"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="80"
        fill={glyphFill}
      >
        E
      </text>
      <rect x="47" y="103" width="46" height="4" rx="2" fill={brass} />

      <text
        x="172"
        y="88"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="600"
        fontSize="56"
        fill={wordmarkFill}
      >
        EduLearn
      </text>
      <rect x="174" y="102" width="200" height="2" fill={brass} opacity="0.65" />
    </svg>
  );
}
