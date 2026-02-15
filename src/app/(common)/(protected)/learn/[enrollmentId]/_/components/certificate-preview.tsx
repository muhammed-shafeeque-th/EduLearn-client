'use client';

import * as React from 'react';
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CertificateData } from '@/types/enrollment/enrollment-certificate.type';
import { CertificateLogoWeb } from './certificate/logo/certificate-logo.web';
import { BRAND } from './certificate/logo/constants';

interface CertificatePreviewProps {
  certificate: CertificateData;
}

export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div
        ref={certificateRef}
        className="relative p-8 md:p-12"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg" />
        <div className="absolute inset-6 border border-slate-200 dark:border-slate-700 rounded-lg" />

        {/* Content */}
        <div className="relative z-10 text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <CertificateLogoWeb />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
              Certificate of Accomplishment
            </h1>
            <div className="inline-block">
              <Badge
                className="text-base px-4 py-1"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.GRADIENT.FROM}, ${BRAND.GRADIENT.TO})`,
                  color: 'white',
                  border: 'none',
                }}
              >
                {certificate.courseTitle}
              </Badge>
            </div>
          </div>

          {/* Presented To */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Presented To
            </p>
            <div className="py-4">
              <h2 className="text-3xl md:text-4xl font-serif italic text-slate-800 dark:text-slate-100">
                {certificate.studentName}
              </h2>
              <div className="mt-3 w-64 mx-auto border-b-2 border-slate-300 dark:border-slate-600" />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The bearer of this certificate has successfully passed the EduLearn skill certification
            test
          </p>

          {/* Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 max-w-2xl mx-auto">
            {/* Date */}
            <div className="text-left">
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Earned on:</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {certificate.issueDate
                  ? new Date(certificate.issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                ID: {certificate.certificateNumber}
              </p>
            </div>

            {/* Signature */}
            <div className="text-right">
              <div className="mb-2">
                <div className="text-2xl font-serif italic text-slate-700 dark:text-slate-300">
                  EduLearn Team
                </div>
              </div>
              <div className="w-48 border-t border-slate-300 dark:border-slate-600 pt-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">CTO, EduLearn</p>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="pt-4">
            <Badge variant="outline" className="text-xs">
              Verified Certificate • {certificate.certificateNumber}
            </Badge>
          </div>
        </div>

        {/* EduLearn Watermark */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
          <div className="text-8xl font-bold text-slate-500">EduLearn</div>
        </div>
      </div>
    </Card>
  );
}
