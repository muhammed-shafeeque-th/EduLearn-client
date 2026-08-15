'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CertificatePreview } from '@/components/certificate/certificate-preview';
import { useUserCertificates } from '@/states/server/certificate/use-user-certificates';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { X, Download, Share2, Award } from 'lucide-react';
import * as React from 'react';
import { downloadCertificatePDF } from '@/lib/certificate/utils';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { shareToLinkedInProfile } from '@/lib/certificate/utils/share-utils';

interface CertificateInterceptPageProps {
  params: Promise<{ id: string }>;
}

export default function CertificateInterceptPage({ params }: CertificateInterceptPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const { certificates, isLoading } = useUserCertificates();

  const certificate = certificates?.find((c) => c.id === id);

  const handleDownloadPDF = React.useCallback(async () => {
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

  const handleLinkedInProfileShare = React.useCallback(async () => {
    if (!certificate) return;
    shareToLinkedInProfile(certificate);
    // await trackCertificateShare(certificate, 'linkedin_profile');
    toast.success({ title: 'Opening LinkedIn...' });
  }, [certificate]);

  const onDismiss = () => {
    router.back();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-2xl">
        <DialogTitle className="sr-only">Certificate Preview</DialogTitle>

        <div className="relative group">
          {/* Close Button Style Polish */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="absolute top-4 right-4 z-50 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/20"
          >
            <X className="h-4 w-4" />
          </Button>

          {isLoading ? (
            <div className="bg-card w-full aspect-[1.414/1] flex flex-col items-center justify-center p-12">
              <Skeleton className="h-[80%] w-full rounded-lg" />
            </div>
          ) : certificate ? (
            <div className="relative">
              <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                <CertificatePreview certificate={certificate} />
              </div>

              {/* Floating Actions */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl">
                <Button
                  variant="default"
                  className="font-bold gap-2 rounded-xl"
                  onClick={handleDownloadPDF}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <div className="w-px h-6 bg-border" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl"
                  onClick={handleLinkedInProfileShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card p-12 text-center rounded-3xl">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold">Certificate Not Found</h3>
              <p className="text-muted-foreground">
                The certificate you&apos;re looking for could not be found.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
