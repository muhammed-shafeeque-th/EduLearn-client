import { pdf } from '@react-pdf/renderer';
import type { CertificateData } from '@/types/enrollment/enrollment-certificate.type';
import { CertificatePDF } from '../certificate-pdf';

/**
 * Generate PDF blob from certificate data
 */
export async function generateCertificatePDF(certificate: CertificateData): Promise<Blob> {
  const doc = <CertificatePDF certificate={certificate} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

/**
 * Download certificate as PDF
 * Uses client-side PDF generation
 */
export async function downloadCertificatePDF(certificate: CertificateData): Promise<void> {
  try {
    const blob = await generateCertificatePDF(certificate);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${certificate.certificateNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download certificate:', error);
    throw new Error('Failed to download certificate');
  }
}

/**
 * Download certificate from backend (gRPC stream)
 * Alternative: Fetch from API Gateway which transforms gRPC stream to HTTP
 */
export async function downloadCertificatePDFFromBackend(certificateId: string): Promise<void> {
  try {
    const response = await fetch(`/api/certificates/${certificateId}/download`, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download certificate');
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'certificate.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Get blob from response
    const blob = await response.blob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download certificate from backend:', error);
    throw new Error('Failed to download certificate');
  }
}

/**
 * Print certificate
 */
export async function printCertificate(certificate: CertificateData): Promise<void> {
  try {
    const blob = await generateCertificatePDF(certificate);
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 100);
    };
  } catch (error) {
    console.error('Failed to print certificate:', error);
    throw new Error('Failed to print certificate');
  }
}

/**
 * Get PDF data URL for preview
 */
export async function getCertificatePDFDataUrl(certificate: CertificateData): Promise<string> {
  const blob = await generateCertificatePDF(certificate);
  return URL.createObjectURL(blob);
}
