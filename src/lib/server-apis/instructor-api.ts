import { Instructor, InstructorMeta, User } from '@/types/user';
import { fetchApi, FetchOptions } from './fetch-api';
import { UsersParams } from '@/services/instructor';

export async function getInstructorById(
  id: string,
  options?: FetchOptions
): Promise<Instructor | null> {
  try {
    const userResponse = await fetchApi<User>(`users/${id}`, options);

    if (!userResponse.success) return null;
    if (userResponse.data?.role !== 'instructor') return null;

    return userResponse.data as Instructor;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getServerInstructors(params: Partial<UsersParams>, options?: FetchOptions) {
  const searchParams = new URLSearchParams();

  // Pagination
  if (params.page !== undefined) {
    searchParams.set('page', params.page.toString());
  } else {
    searchParams.set('page', '1');
  }
  if (params.pageSize !== undefined) {
    searchParams.set('pageSize', params.pageSize.toString());
  } else {
    searchParams.set('pageSize', '50');
  }

  const queryString = searchParams.toString();
  const endpoint = `instructors?${queryString}`;

  try {
    const instructors = await fetchApi<InstructorMeta[]>(endpoint, options);

    if (!instructors?.success) return [];
    return instructors.data;
  } catch {
    return [];
  }
}
