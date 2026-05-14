'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CertificatePreview } from '@/components/certificate/certificate-preview';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, Share2, Award, Printer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCertificate } from '@/states/server/certificate/use-certificate';
import { downloadCertificatePDF } from '@/lib/certificate/utils';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { shareToLinkedInProfile } from '@/lib/certificate/utils/share-utils';

interface CertificatePageProps {
  params: Promise<{ id: string }>;
}

export default function CertificatePage({ params }: CertificatePageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const { certificate, isLoading } = useCertificate(id);

  const handleDownloadPDF = useCallback(async () => {
    if (!certificate) return;

    try {
      await downloadCertificatePDF(certificate);
      // await trackCertificateShare(certificate, 'download_pdf');
      toast.success({ title: 'Certificate downloaded as PDF!' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error({
        title: 'Failed to download certificate. Please try again.',
        description: getErrorMessage(error),
      });
    }
  }, [certificate]);

  const handleLinkedInProfile = useCallback(async () => {
    if (!certificate) return;
    shareToLinkedInProfile(certificate);
    // await trackCertificateShare(certificate, 'linkedin_profile');
    toast.success({ title: 'Opening LinkedIn...' });
  }, [certificate]);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="bg-muted p-6 rounded-full mb-6">
          <Award className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Certificate not found</h2>
        <p className="text-muted-foreground mb-8">
          We couldn&apos;t find the certificate you&apos;re looking for.
        </p>
        <Button
          onClick={() => router.push('/profile/certificates')}
          variant="outline"
          className="rounded-xl"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to My Certificates
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/profile/certificates')}
            className="rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground line-clamp-1">
              {certificate.courseTitle}
            </h1>
            <p className="text-sm text-muted-foreground">Achievement Certificate</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl gap-2 font-bold hidden sm:flex">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button className="rounded-xl gap-2 font-bold" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={handleLinkedInProfile}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="shadow-2xl rounded-2xl overflow-hidden border border-border/50">
        <CertificatePreview certificate={certificate} />
      </div>

      <div className="mt-12 p-8 bg-card rounded-2xl border border-dashed text-center">
        <h4 className="font-bold mb-2">How to share your achievement?</h4>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Add this certificate to your LinkedIn profile or share the public link with employers to
          showcase your new skills.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" className="rounded-xl font-bold">
            Add to LinkedIn
          </Button>
          <Button variant="ghost" className="rounded-xl font-bold">
            Copy Public Link
          </Button>
        </div>
      </div>
    </div>
  );
}
