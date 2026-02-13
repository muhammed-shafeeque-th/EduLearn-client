'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Award,
  Download,
  Share2,
  CheckCircle,
  Lock,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
  Linkedin,
  Twitter,
  Facebook,
  // Mail,
  // MessageCircle,
  // Image as ImageIcon,
  Code,
  Printer,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, getErrorMessage } from '@/lib/utils';
import { useCertificate } from '../../hooks/use-certificate';
import { CertificatePreview } from '../certificate-preview';
import type { EnrollmentDetail } from '@/types/enrollment/enrollment.type';

// Import utilities
import { downloadCertificatePDF, printCertificate } from '../certificate/utils';

import {
  shareToLinkedInProfile,
  shareToLinkedInFeed,
  shareToTwitter,
  shareToFacebook,
  // shareViaEmail,
  // shareToWhatsApp,
  // shareViaWebShare,
  copyCertificateLink,
  copyVerificationLink,
  // downloadCertificateAsImage,
  copyEmbedCode,
  trackCertificateShare,
} from '../certificate/utils/share-utils';
import { toast } from '@/hooks/use-toast';

interface CourseCertificateTabProps {
  enrollmentId: string;
  enrollment: EnrollmentDetail;
  overallProgress: number;
  userName: string;
}

export function CourseCertificateTab({
  enrollmentId,
  enrollment,
  overallProgress,
  userName,
}: CourseCertificateTabProps) {
  const { certificate, hasCertificate, isLoading, isGenerating, generateCertificate } =
    useCertificate(enrollmentId);

  const [showNameForm, setShowNameForm] = useState(false);
  const [studentName, setStudentName] = useState(userName || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const isCompleted = enrollment.status === 'COMPLETED' || overallProgress === 100;
  const isEligible = isCompleted;

  // ============================================================================
  // GENERATION HANDLERS
  // ============================================================================

  const handleGenerateClick = () => {
    setShowNameForm(true);
    setStudentName(userName || '');
    setValidationError(null);
  };

  const handleSubmitName = async () => {
    const trimmedName = studentName.trim();

    if (!trimmedName) {
      setValidationError('Please enter your name');
      return;
    }

    if (trimmedName.length < 2) {
      setValidationError('Name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 100) {
      setValidationError('Name must be less than 100 characters');
      return;
    }

    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(trimmedName)) {
      setValidationError('Name can only contain letters, spaces, hyphens, and apostrophes');
      return;
    }

    try {
      setValidationError(null);
      await generateCertificate(trimmedName);
      toast.success({ title: 'Certificate generated successfully! 🎉' });
      setShowNameForm(false);
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast.error({
        title: 'Failed to generate certificate. Please try again.',
        description: getErrorMessage(error),
      });
    }
  };

  // ============================================================================
  // DOWNLOAD HANDLERS
  // ============================================================================

  const handleDownloadPDF = async () => {
    if (!certificate) return;

    setIsDownloading(true);
    try {
      await downloadCertificatePDF(certificate);
      await trackCertificateShare(certificate, 'download_pdf');
      toast.success({ title: 'Certificate downloaded as PDF!' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error({
        title: 'Failed to download certificate. Please try again.',
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // const handleDownloadImage = async () => {
  //   if (!certificate) return;

  //   setIsDownloading(true);
  //   try {
  //     await downloadCertificateAsImage('certificate-preview', certificate);
  //     await trackCertificateShare(certificate, 'download_image');
  //     toast.success({ title: 'Certificate downloaded as image!' });
  //   } catch (error) {
  //     console.error('Download error:', error);
  //     toast.error({
  //       title: 'Failed to download image. Please try again.',
  //       description: getErrorMessage(error),
  //     });
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  const handlePrint = async () => {
    if (!certificate) return;

    try {
      await printCertificate(certificate);
      await trackCertificateShare(certificate, 'print');
      toast.success({ title: 'Opening print dialog...' });
    } catch (error) {
      console.error('Print error:', error);
      toast.error({ title: 'Failed to print certificate.', description: getErrorMessage(error) });
    }
  };

  // ============================================================================
  // SHARING HANDLERS
  // ============================================================================

  // const handleShareNative = async () => {
  //   if (!certificate) return;

  //   try {
  //     const result = await shareViaWebShare(certificate);
  //     if (result.success) {
  //       await trackCertificateShare(certificate, result.method || 'native_share');
  //       if (result.method === 'clipboard') {
  //         toast.success({ title: 'Certificate link copied to clipboard!' });
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Share error:', error);
  //     toast.error({ title: 'Failed to share certificate', description: getErrorMessage(error) });
  //   }
  // };

  const handleLinkedInProfile = async () => {
    if (!certificate) return;
    shareToLinkedInProfile(certificate);
    await trackCertificateShare(certificate, 'linkedin_profile');
    toast.success({ title: 'Opening LinkedIn...' });
  };

  const handleLinkedInFeed = async () => {
    if (!certificate) return;
    shareToLinkedInFeed(certificate);
    await trackCertificateShare(certificate, 'linkedin_feed');
    toast.success({ title: 'Opening LinkedIn...' });
  };

  const handleTwitterShare = async () => {
    if (!certificate) return;
    shareToTwitter(certificate);
    await trackCertificateShare(certificate, 'twitter');
    toast.success({ title: 'Opening Twitter...' });
  };

  const handleFacebookShare = async () => {
    if (!certificate) return;
    shareToFacebook(certificate);
    await trackCertificateShare(certificate, 'facebook');
    toast.success({ title: 'Opening Facebook...' });
  };

  // const handleEmailShare = async () => {
  //   if (!certificate) return;
  //   shareViaEmail(certificate);
  //   await trackCertificateShare(certificate, 'email');
  // };

  // const handleWhatsAppShare = async () => {
  //   if (!certificate) return;
  //   shareToWhatsApp(certificate);
  //   await trackCertificateShare(certificate, 'whatsapp');
  //   toast.success({ title: 'Opening WhatsApp...' });
  // };

  // ============================================================================
  // COPY HANDLERS
  // ============================================================================

  const handleCopyLink = async () => {
    if (!certificate) return;

    try {
      await copyCertificateLink(certificate);
      await trackCertificateShare(certificate, 'copy_link');
      toast.success({ title: 'Certificate link copied to clipboard!' });
    } catch (error) {
      toast.error({ title: 'Failed to copy link', description: getErrorMessage(error) });
    }
  };

  const handleCopyVerificationLink = async () => {
    if (!certificate) return;

    try {
      await copyVerificationLink(certificate);
      await trackCertificateShare(certificate, 'copy_verification');
      toast.success({ title: 'Verification link copied to clipboard!' });
    } catch (error) {
      toast.error({
        title: 'Failed to copy verification link',
        description: getErrorMessage(error),
      });
    }
  };

  const handleCopyEmbedCode = async () => {
    if (!certificate) return;

    try {
      await copyEmbedCode(certificate);
      await trackCertificateShare(certificate, 'copy_embed');
      toast.success({ title: 'Embed code copied to clipboard!' });
    } catch (error) {
      toast.error({ title: 'Failed to copy embed code', description: getErrorMessage(error) });
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isEligible) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Certificate Locked</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Complete all course requirements to unlock your certificate of accomplishment.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  overallProgress === 100 ? 'bg-green-500' : 'bg-orange-500'
                )}
              />
              <span>Progress: {Math.round(overallProgress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasCertificate && certificate) {
    return (
      <div className="space-y-6">
        {/* Success Banner with Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Congratulations! 🎉
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    You&apos;ve successfully completed the course. Your certificate is ready!
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* Download Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" disabled={isDownloading}>
                          {isDownloading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={handleDownloadPDF}>
                          <Download className="h-4 w-4 mr-2" />
                          Download as PDF
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={handleDownloadImage}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Download as Image
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handlePrint}>
                          <Printer className="h-4 w-4 mr-2" />
                          Print Certificate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Share Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={handleLinkedInProfile}>
                          <Linkedin className="h-4 w-4 mr-2" />
                          Add to LinkedIn Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLinkedInFeed}>
                          <Linkedin className="h-4 w-4 mr-2" />
                          Share on LinkedIn
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleTwitterShare}>
                          <Twitter className="h-4 w-4 mr-2" />
                          Share on Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleFacebookShare}>
                          <Facebook className="h-4 w-4 mr-2" />
                          Share on Facebook
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={handleWhatsAppShare}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Share on WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleEmailShare}>
                          <Mail className="h-4 w-4 mr-2" />
                          Share via Email
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* More Options */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={handleCopyLink}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Public Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyVerificationLink}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Copy Verification Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyEmbedCode}>
                          <Code className="h-4 w-4 mr-2" />
                          Copy Embed Code
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Certificate Preview */}
        <div id="certificate-preview">
          <CertificatePreview certificate={certificate} />
        </div>

        {/* Certificate Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certificate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Certificate Number" value={certificate.certificateNumber} />
              <DetailRow
                label="Issue Date"
                value={new Date(certificate.issueDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
              <DetailRow label="Recipient Name" value={certificate.studentName} />
              <DetailRow
                label="Completed On"
                value={new Date(certificate.completedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate certificate state
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  You&apos;re Eligible for a Certificate!
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Congratulations on completing the course! Generate your official certificate of
                  accomplishment.
                </p>
                {!showNameForm && (
                  <Button onClick={handleGenerateClick} disabled={isGenerating}>
                    <Award className="h-4 w-4 mr-2" />
                    Generate Certificate
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Name Form */}
      <AnimatePresence>
        {showNameForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Customize Your Certificate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="student-name">Name to appear on certificate</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enter your full name as you&apos;d like it to appear on your certificate
                  </p>
                  <Input
                    id="student-name"
                    value={studentName}
                    onChange={(e) => {
                      setStudentName(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="e.g., John Doe"
                    className={cn(validationError && 'border-red-500 focus-visible:ring-red-500')}
                    disabled={isGenerating}
                  />
                  {validationError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationError}
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <p className="text-lg font-serif italic text-center">
                    {studentName.trim() || 'Your Name Here'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handleSubmitName} disabled={isGenerating || !studentName.trim()}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Generate Certificate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNameForm(false);
                      setValidationError(null);
                    }}
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      {!showNameForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            title="Official Certificate"
            description="Recognized certificate of course completion"
          />
          <InfoCard
            icon={<Download className="h-5 w-5 text-blue-500" />}
            title="PDF Download"
            description="Download and print your certificate anytime"
          />
          <InfoCard
            icon={<Share2 className="h-5 w-5 text-purple-500" />}
            title="Easy Sharing"
            description="Share on LinkedIn, Twitter, and more"
          />
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0">{icon}</div>
          <div>
            <h4 className="font-medium text-sm mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
