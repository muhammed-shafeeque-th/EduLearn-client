export interface CertificateData {
  id: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  studentName: string; // Display name for certificate
  completedAt: string;
  certificateNumber: string; // Unique identifier
  issueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateCertificateRequest {
  enrollmentId: string;
  studentName: string; // User-provided name
}

export interface GenerateCertificateResponse {
  certificate: CertificateData;
  downloadUrl: string;
}

export interface VerifyCertificateResponse {
  valid: boolean;
  certificate?: CertificateData;
  message?: string;
}
