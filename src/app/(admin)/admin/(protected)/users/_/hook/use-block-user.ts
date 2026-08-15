import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { adminService } from '@/services/admin';

export const useBlockUser = () => {
  const handleBlock = async (userId: string) => {
    try {
      await adminService.blockAccount(userId);
      toast.success({ title: 'User blocked successfully' });
    } catch (error) {
      toast.error({ title: getErrorMessage(error, 'Something went wrong while blocking user') });
    }
  };
  const handleUnBlock = async (userId: string) => {
    try {
      await adminService.unblockAccount(userId);
      toast.success({ title: 'User unBlocked successfully ' });
    } catch (error) {
      toast.error({ title: getErrorMessage(error, 'Something went wrong while un blocking user') });
    }
  };

  return { handleBlock, handleUnBlock };
};
