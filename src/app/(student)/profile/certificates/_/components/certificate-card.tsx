'use client';

import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Eye, Download, Share2 } from 'lucide-react';
import Link from 'next/link';
import type { CertificateData } from '@/types/enrollment/enrollment-certificate.type';
import { format } from 'date-fns';
import { downloadCertificatePDF } from '@/lib/certificate/utils';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { shareToLinkedInProfile } from '@/lib/certificate/utils/share-utils';
import { ROUTES } from '@/lib/constants/routes';

interface CertificateCardProps {
  certificate: CertificateData;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const issueDate = new Date(certificate.issueDate || certificate.completedAt);

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

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 border border-border rounded-xl">
      <Link href={ROUTES.student.profile.certificate(certificate.id)}>
        <div className="relative h-40 bg-muted/30 flex items-center justify-center border-b">
          <div className="relative">
            <Award className="h-16 w-16 text-primary/20 transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="absolute top-3 right-3">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm font-bold text-[10px]"
            >
              Verified
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {certificate.courseTitle}
          </h3>
          <p className="text-xs text-muted-foreground">
            Issued on {format(issueDate, 'MMM dd, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Link href={ROUTES.student.profile.certificate(certificate.id)} className="flex-1">
            <Button variant="outline" className="w-full text-xs font-semibold gap-2 rounded-lg h-9">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary"
            onClick={handleLinkedInProfile}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
