'use client';

import { toast } from 'sonner';
import { useBlockUser } from '../hook/use-block-user';
// import { useRouter } from 'next/navigation';

export const useHandleDelete = (userId: string, status: 'active' | 'blocked') => {
  // const router = useRouter();
  const { handleBlock, handleUnBlock } = useBlockUser();
  // interface BlockUserAlertProps {
  //   t: string | number;
  // }

  // interface UseHandleDelete {
  //   (userId: string, status: 'active' | 'blocked'): void;
  // }

  toast.custom(
    () => (
      <div className="flex flex-col gap-2 h-16">
        <p>Are you sure you want to {status === 'active' ? 'block ' : 'unblock '} the user?</p>
        <div className="flex justify-between items-center w-full mx-auto">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={async (): Promise<void> => {
              if (status === 'active') {
                await handleBlock(userId);
              } else {
                await handleUnBlock(userId);
              }
              toast.dismiss();
              toast.success(
                status === 'active' ? 'User blocked successfully!' : 'User unblocked successfully!'
              );
              // router.refresh();
            }}
          >
            Confirm
          </button>
          <button
            className="bg-gray-300 px-3 py-1 rounded"
            onClick={(): void => {
              toast.dismiss();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      position: 'top-center' as const,
      duration: 10000, // give user time to decide
    }
  );
};
