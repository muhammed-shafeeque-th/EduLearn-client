import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import type { CertificateData } from '@/types/enrollment/enrollment-certificate.type';
import { CertificateLogoPDF } from './logo/certificate-logo.pdf';

// --- FONT REGISTRATION ---
// Only src and supported styles/weights; fontWeight and fontStyle supported values: 'normal', 'bold', 'italic' or numbers
Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Roboto-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
  ],
});

Font.register({
  family: 'Playfair Display',
  fonts: [
    { src: '/fonts/PlayfairDisplay-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/PlayfairDisplay-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/PlayfairDisplay-Italic.ttf', fontStyle: 'italic' },
  ],
});

const styles = StyleSheet.create({
  page: {
    width: 842,
    height: 595,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  title: {
    fontSize: 42,
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    color: '#1e293b',
    textAlign: 'center',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03, // Supported
  },
  outerBorder: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    bottom: 24,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
  },

  innerBorder: {
    position: 'absolute',
    top: 36,
    left: 36,
    right: 36,
    bottom: 36,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
  },
  content: {
    position: 'absolute',
    top: 60,
    left: 60,
    right: 60,
    bottom: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderStyle: 'solid',
    borderColor: '#ffffff',
    borderWidth: 4,
    // boxShadow not supported in @react-pdf/renderer
  },
  logoText: {
    fontSize: 36,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#ffffff',
  },
  // title: {
  //   fontSize: 42,
  //   fontFamily: 'Playfair Display',
  //   fontWeight: 700,
  //   color: '#1e293b',
  //   textAlign: 'center',
  // },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: 600,
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 40,
  },
  presentedToLabel: {
    fontSize: 12,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#64748b',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  studentName: {
    fontSize: 36,
    fontFamily: 'Playfair Display',
    fontStyle: 'italic',
    color: '#1e293b',
    marginBottom: 15,
    textAlign: 'center',
  },
  nameLine: {
    width: 300,
    height: 2,
    backgroundColor: '#cbd5e1',
    marginBottom: 30,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 1.6,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  footerSection: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 9,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#94a3b8',
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 12,
    fontFamily: 'Roboto',
    fontWeight: 600,
    color: '#475569',
    marginBottom: 2,
  },
  footerSmall: {
    fontSize: 9,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#94a3b8',
    marginTop: 4,
  },
  signature: {
    fontSize: 24,
    fontFamily: 'Playfair Display',
    fontStyle: 'italic',
    color: '#475569',
    marginBottom: 8,
  },
  signatureLine: {
    width: 200,
    height: 1,
    backgroundColor: '#cbd5e1',
    marginBottom: 4,
  },
  signatureTitle: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#64748b',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 9,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  watermark: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.02,
  },
  watermarkText: {
    fontSize: 100,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#94a3b8',
  },
});

interface CertificatePDFProps {
  certificate: CertificateData;
}

export function CertificatePDF({ certificate }: CertificatePDFProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page
        // size="A4"
        // orientation="landscape"
        size={{ width: 842, height: 595 }}
        style={styles.page}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <Svg width="100%" height="100%" viewBox="0 0 60 60">
            <Path
              d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"
              fill="#9C92AC"
              fillOpacity="0.4"
            />
          </Svg>
        </View>

        {/* Decorative Borders */}
        <View style={styles.outerBorder} />
        <View style={styles.innerBorder} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo */}
          <CertificateLogoPDF />

          {/* Title */}
          <Text style={styles.title}>Certificate of Accomplishment</Text>

          {/* Course Badge */}
          <Text style={styles.subtitle}>{certificate.courseTitle}</Text>

          {/* Presented To */}
          <Text style={styles.presentedToLabel}>Presented To</Text>

          {/* Student Name */}
          <Text style={styles.studentName}>{certificate.studentName}</Text>
          <View style={styles.nameLine} />

          {/* Description */}
          <Text style={styles.description}>
            The bearer of this certificate has successfully passed the EduLearn skill certification
            test and demonstrated proficiency in the subject matter.
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Date Section */}
            <View style={[styles.footerSection, { alignItems: 'flex-start' }]}>
              <Text style={styles.footerLabel}>Earned on:</Text>
              <Text style={styles.footerValue}>{formatDate(certificate.issueDate)}</Text>
              <Text style={styles.footerSmall}>ID: {certificate.certificateNumber}</Text>
            </View>

            {/* Signature Section */}
            <View style={[styles.footerSection, { alignItems: 'flex-end' }]}>
              <Text style={styles.signature}>EduLearn Team</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureTitle}>CTO, EduLearn</Text>
            </View>
          </View>
        </View>

        {/* Verification Badge */}
        <View style={styles.verificationBadge}>
          <Text style={styles.verificationText}>
            Verified Certificate • {certificate.certificateNumber}
          </Text>
        </View>

        {/* Watermark */}
        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>EDULEARN</Text>
        </View>
      </Page>
    </Document>
  );
}
