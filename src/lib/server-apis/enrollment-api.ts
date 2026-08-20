'use server';

import { serverEnrollmentService } from '@/services/server-service-clients';
import { cache } from 'react';
import { RequestOptions } from '@/services/base-service';

export interface CourseParams {
  page?: string;
  pageSize?: string;
  search?: string;
  categories?: string;
  rating?: string;
  level?: string;
  priceMin?: string;
  priceMax?: string;
  free?: string;
  paid?: string;
  sortBy?: string;
}

export const fetchServerEnrollment = cache(
  async (enrollmentId: string, options?: RequestOptions) => {
    try {
      const enrollmentRes = await serverEnrollmentService.getEnrollment(enrollmentId, options);

      if (!enrollmentRes.success) {
        throw new Error(enrollmentRes.message);
      }
      return {
        enrollment: enrollmentRes.data,
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        enrollment: null,
        success: false,
      };
    }
  }
);
export const checkServerEnrollment = cache(
  async (enrollmentId: string, options?: RequestOptions) => {
    try {
      const enrollmentRes = await serverEnrollmentService.checkEnrollment(enrollmentId, options);

      if (!enrollmentRes.success) {
        throw new Error(enrollmentRes.message);
      }
      return {
        enrolled: enrollmentRes.data.enrolled,
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        enrolled: false,
        success: false,
      };
    }
  }
);
