'use client';

import React from 'react';
import { useUserCertificates } from '@/states/server/certificate/use-user-certificates';
import { CertificateCard } from './certificate-card';
import { Award } from 'lucide-react';
import Link from 'next/link';

export function CertificatesList() {
  const { data: certificates, isLoading, error } = useUserCertificates({ enabled: true });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-dashed text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <Award className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Error loading certificates</h3>
        <p className="text-muted-foreground mb-6">
          There was a problem fetching your achievements.
        </p>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-dashed text-center">
        <div className="bg-muted/50 p-4 rounded-full mb-4">
          <Award className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">No certificates found</h3>
        <p className="text-muted-foreground mb-6">Complete your courses to earn certifications!</p>
        <Link
          href="/courses"
          className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((cert) => (
        <CertificateCard key={cert.id} certificate={cert} />
      ))}
    </div>
  );
}
