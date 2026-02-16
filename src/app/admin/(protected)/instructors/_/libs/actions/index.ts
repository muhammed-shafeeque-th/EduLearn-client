'use server';

import { serverAdminService } from '@/services/server-service-clients';
import { userService } from '@/services/user.service';
import { unstable_cache, revalidateTag } from 'next/cache';
import { z } from 'zod';

// Schema for instructor actions
const instructorActionSchema = z.object({
  instructorId: z.string(),
  action: z.enum(['approve', 'block', 'unblock', 'delete']),
});

// Cache function to fetch instructor by ID
export const fetchInstructor = unstable_cache(
  async (instructorId: string) => {
    return userService.getUser(instructorId);
  },
  ['fetchInstructor'],
  {
    tags: ['instructors'],
  }
);

// Handles instructor actions such as approve, block, unblock, delete
export async function handleInstructorAction(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _prevState: any,
  formData: FormData
) {
  try {
    const data = {
      instructorId: formData.get('instructorId'),
      action: formData.get('action'),
    };

    // Type refinement & validation
    const { instructorId, action } = instructorActionSchema.parse(data);

    let response;
    switch (action) {
      case 'approve':
        // response = await serverAdminService.updateUser(instructorId, { status: 'approved' });
        break;
      case 'block':
        response = await serverAdminService.blockUser(instructorId);
        break;
      case 'unblock':
        response = await serverAdminService.unBlockUser(instructorId);
        break;
      case 'delete':
        response = await serverAdminService.deleteUser(instructorId);
        break;
      default:
        throw new Error('Unknown action');
    }

    // Revalidate instructor data and related stats for UI consistency
    revalidateTag('instructors');
    revalidateTag('stats');

    if (response?.success === false) {
      return {
        success: false,
        message: response?.message || 'Operation failed',
      };
    }

    const actionVerb =
      action === 'approve'
        ? 'approved'
        : action === 'block'
          ? 'blocked'
          : action === 'unblock'
            ? 'unblocked'
            : 'deleted';

    return {
      success: true,
      message: `Instructor ${actionVerb} successfully`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Invalid form data',
        errors: error.errors,
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}
