import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertDialogCancel } from '@radix-ui/react-alert-dialog';

type ResendProps = { email: string; resendHandler: (email: string) => void };

export function ResendPage({ email, resendHandler }: ResendProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'outline'} className="ms-1 font-semibold text-primary hover:underline">
          Resend
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure ?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to resend the otp to {email}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => resendHandler(email)}>Resend</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
