import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollment.service';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { CertificateData } from '@/types/enrollment/enrollment-certificate.type';

export function useCertificate(enrollmentId: string) {
  const queryClient = useQueryClient();

  /**
   * Query: Get certificate for enrollment
   */
  const certificateQuery = useQuery({
    queryKey: QUERY_KEYS.certificates.enrollment(enrollmentId),
    queryFn: async () => {
      try {
        const result = await enrollmentService.getCertificate(enrollmentId);
        if (!result.success || !result.data) {
          throw new Error(result.message);
        }
        return result.data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  /**
   * Mutation: Generate certificate
   */
  const generateMutation = useMutation({
    mutationFn: async (studentName: string) => {
      try {
        const result = await enrollmentService.generateCertificate(enrollmentId, studentName);
        if (!result.success || !result.data) {
          throw new Error(result.message);
        }
        return result.data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    onSuccess: (_data) => {
      // Update cache with new certificate
      // queryClient.setQueryData(QUERY_KEYS.certificates.enrollment(enrollmentId), data?.certificate);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.certificates.enrollment(enrollmentId) });
    },
  });

  /**
   * Download certificate PDF
   */
  const downloadCertificate = useCallback((certificateId: string) => {
    const url = enrollmentService.downloadCertificate(certificateId);
    window.open(url, '_blank');
  }, []);

  /**
   * Get shareable URL
   */
  const getShareUrl = useCallback((certificateId: string): string => {
    return enrollmentService.getShareUrl(certificateId);
  }, []);

  /**
   * Share certificate
   */
  const shareCertificate = useCallback(
    async (certificate: CertificateData) => {
      const shareUrl = getShareUrl(certificate.id);

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Certificate of Accomplishment - ${certificate.courseTitle}`,
            text: `I've completed ${certificate.courseTitle} on EduLearn!`,
            url: shareUrl,
          });
        } catch (error) {
          // User cancelled or share failed
          console.log('Share cancelled or failed:', error);
        }
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        return 'copied'; // Signal that URL was copied
      }
    },
    [getShareUrl]
  );

  return {
    // Data
    certificate: certificateQuery.data,
    hasCertificate: certificateQuery.data !== null,

    // Loading states
    isLoading: certificateQuery.isLoading,
    isGenerating: generateMutation.isPending,

    // Error states
    error: certificateQuery.error || generateMutation.error,

    // Actions
    generateCertificate: (studentName: string) => generateMutation.mutateAsync(studentName),
    downloadCertificate,
    shareCertificate,
    getShareUrl,
    refetch: certificateQuery.refetch,
  };
}
