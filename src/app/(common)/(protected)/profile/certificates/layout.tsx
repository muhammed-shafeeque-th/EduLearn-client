import React from 'react';

interface CertificatesLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function CertificatesLayout({ children, modal }: CertificatesLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
