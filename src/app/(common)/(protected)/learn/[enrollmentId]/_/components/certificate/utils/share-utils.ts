/* eslint-disable @typescript-eslint/no-explicit-any */
import { CertificateData } from '@/types/enrollment/enrollment-certificate.type';

/**
 * Get certificate public page URL
 */
export function getCertificatePublicUrl(certificateId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/certificates/${certificateId}`;
}

// ============================================================================
// LINKEDIN SHARING
// ============================================================================

/**
 * Share certificate to LinkedIn Profile
 * Adds certification to user's LinkedIn profile
 */
export function shareToLinkedInProfile(certificate: CertificateData): void {
  const issueDate = new Date(certificate.issueDate);
  const publicUrl = getCertificatePublicUrl(certificate.id);

  const linkedInUrl = new URL('https://www.linkedin.com/profile/add');
  linkedInUrl.searchParams.set('startTask', 'CERTIFICATION_NAME');
  linkedInUrl.searchParams.set('name', certificate.courseTitle);
  linkedInUrl.searchParams.set('organizationName', 'EduLearn');
  linkedInUrl.searchParams.set('issueYear', issueDate.getFullYear().toString());
  linkedInUrl.searchParams.set('issueMonth', (issueDate.getMonth() + 1).toString());
  linkedInUrl.searchParams.set('certUrl', publicUrl);
  linkedInUrl.searchParams.set('certId', certificate.certificateNumber);

  window.open(linkedInUrl.toString(), '_blank', 'width=600,height=600');
}

/**
 * Share certificate post to LinkedIn Feed
 */
export function shareToLinkedInFeed(certificate: CertificateData): void {
  const publicUrl = getCertificatePublicUrl(certificate.id);

  const linkedInUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
  linkedInUrl.searchParams.set('url', publicUrl);

  window.open(linkedInUrl.toString(), '_blank', 'width=600,height=600');
}

// ============================================================================
// TWITTER (X) SHARING
// ============================================================================

/**
 * Share certificate to Twitter/X
 */
export function shareToTwitter(certificate: CertificateData): void {
  const publicUrl = getCertificatePublicUrl(certificate.id);
  const text = `I just completed "${certificate.courseTitle}" on @EduLearn! 🎓`;

  const twitterUrl = new URL('https://twitter.com/intent/tweet');
  twitterUrl.searchParams.set('text', text);
  twitterUrl.searchParams.set('url', publicUrl);
  twitterUrl.searchParams.set('hashtags', 'EduLearn,OnlineLearning,Certificate');

  window.open(twitterUrl.toString(), '_blank', 'width=600,height=600');
}

// ============================================================================
// FACEBOOK SHARING
// ============================================================================

/**
 * Share certificate to Facebook
 */
export function shareToFacebook(certificate: CertificateData): void {
  const publicUrl = getCertificatePublicUrl(certificate.id);

  const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
  facebookUrl.searchParams.set('u', publicUrl);

  window.open(facebookUrl.toString(), '_blank', 'width=600,height=600');
}

// ============================================================================
// EMAIL SHARING
// ============================================================================

/**
 * Share certificate via email
 */
export function shareViaEmail(certificate: CertificateData): void {
  const publicUrl = getCertificatePublicUrl(certificate.id);
  const subject = encodeURIComponent(`Certificate: ${certificate.courseTitle}`);
  const body = encodeURIComponent(
    `I'm excited to share that I've earned a certificate in ${certificate.courseTitle} from EduLearn!\n\nView my certificate: ${publicUrl}\n\nCertificate ID: ${certificate.certificateNumber}`
  );

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// ============================================================================
// WHATSAPP SHARING
// ============================================================================

/**
 * Share certificate to WhatsApp
 */
export function shareToWhatsApp(certificate: CertificateData): void {
  const publicUrl = getCertificatePublicUrl(certificate.id);
  const text = encodeURIComponent(
    `I just completed "${certificate.courseTitle}" on EduLearn! 🎓\n\nView my certificate: ${publicUrl}`
  );

  const whatsappUrl = `https://api.whatsapp.com/send?text=${text}`;
  window.open(whatsappUrl, '_blank', 'width=600,height=600');
}

// ============================================================================
// NATIVE WEB SHARE API
// ============================================================================

/**
 * Share using native Web Share API (mobile-friendly)
 */
export async function shareViaWebShare(
  certificate: CertificateData
): Promise<{ success: boolean; method?: string }> {
  const publicUrl = getCertificatePublicUrl(certificate.id);

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Certificate: ${certificate.courseTitle}`,
        text: `I've earned a certificate in ${certificate.courseTitle} from EduLearn!`,
        url: publicUrl,
      });
      return { success: true, method: 'native' };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
      throw error;
    }
  } else {
    // Fallback: Copy to clipboard
    await navigator.clipboard.writeText(publicUrl);
    return { success: true, method: 'clipboard' };
  }
}

// ============================================================================
// COPY TO CLIPBOARD
// ============================================================================

/**
 * Copy certificate link to clipboard
 */
export async function copyCertificateLink(certificate: CertificateData): Promise<void> {
  const publicUrl = getCertificatePublicUrl(certificate.id);
  await navigator.clipboard.writeText(publicUrl);
}

/**
 * Copy verification link to clipboard (same as public URL without QR)
 */
export async function copyVerificationLink(certificate: CertificateData): Promise<void> {
  const publicUrl = getCertificatePublicUrl(certificate.id);
  await navigator.clipboard.writeText(publicUrl);
}

// ============================================================================
// DOWNLOAD AS IMAGE
// ============================================================================

/**
 * Download certificate as PNG image
 */
export async function downloadCertificateAsImage(
  elementId: string,
  certificate: CertificateData
): Promise<void> {
  // Dynamic import to reduce bundle size
  const html2canvas = (await import('html2canvas')).default;
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error('Certificate element not found');
  }
  // Save original styles
  const originalStyles = element.getAttribute('style') || '';

  // Force RGB-safe background
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${certificate.certificateNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } finally {
    // Restore original styles
    element.setAttribute('style', originalStyles);
  }
}

// ============================================================================
// EMBED CODE (REMOVED - Not needed without QR)
// ============================================================================

/**
 * Generate HTML embed code for certificate
 */
export function generateEmbedCode(certificate: CertificateData): string {
  const publicUrl = getCertificatePublicUrl(certificate.id);

  return `<iframe 
  src="${publicUrl}/embed" 
  width="800" 
  height="600" 
  frameborder="0" 
  allowfullscreen
  title="Certificate: ${certificate.courseTitle}"
></iframe>`;
}

/**
 * Copy embed code to clipboard
 */
export async function copyEmbedCode(certificate: CertificateData): Promise<void> {
  const embedCode = generateEmbedCode(certificate);
  await navigator.clipboard.writeText(embedCode);
}

// ============================================================================
// ANALYTICS TRACKING
// ============================================================================

interface ShareEvent {
  certificateId: string;
  platform: string;
  timestamp: string;
  userId?: string;
}

/**
 * Track certificate share event
 */
export async function trackCertificateShare(
  certificate: CertificateData,
  platform: string,
  userId?: string
): Promise<void> {
  const event: ShareEvent = {
    certificateId: certificate.id,
    platform,
    timestamp: new Date().toISOString(),
    userId,
  };

  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'share_certificate', {
      certificate_id: certificate.id,
      platform,
      course_title: certificate.courseTitle,
    });
  }

  // Send to backend analytics (fire and forget)
  try {
    await fetch('/api/analytics/certificate-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (error) {
    // Silently fail - don't block user action
    console.error('Failed to track share event:', error);
  }
}
