import Link from 'next/link';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import FacebookIcon from './facebook-icon';
import GoogleIcon from './google-icon';
import { signIn } from 'next-auth/react';
import React from 'react';

/**
 * SocialAuthOptions provides social login buttons and legal links.
 * @returns {JSX.Element}
 */
const SocialAuthOptions: React.FC = () => {
  return (
    <section className="w-full max-w-md mx-auto" aria-label="Social authentication options">
      {/* Other sign up options heading with separators*/}
      <div className="relative flex items-center py-3">
        <Separator orientation="horizontal" className="flex-grow bg-gray-200 max-w-[30%]" />
        <span className="px-3 text-gray-500 text-xs font-medium whitespace-nowrap">
          Other sign options
        </span>
        <Separator orientation="horizontal" className="flex-grow bg-gray-200 max-w-[30%]" />
      </div>

      {/*Social media sign up options */}
      <div className="flex justify-center gap-10 my-1">
        <Button
          aria-label="Sign in with Google"
          onClick={() => signIn('google')}
          variant={'outline'}
          size={'icon'}
          className="w-12 h-12 border-violet-200"
        >
          <GoogleIcon className="h-6 w-10" />
        </Button>
        <Button
          aria-label="Sign in with Facebook"
          onClick={() => signIn('facebook')}
          variant={'outline'}
          size={'icon'}
          className="w-12 h-12 border-violet-200"
        >
          <FacebookIcon className="h-6 w-6" />
        </Button>
      </div>

      {/*Terms of service */}
      <p className="text-center text-xs text-gray-600 mt-4">
        By signing up, you agree to our{' '}
        <Link href={'/terms'} className="text-violet-600 hover:text-violet-800 font-medium">
          Terms of Use
        </Link>{' '}
        and{' '}
        <Link href={'/privacy'} className="text-violet-600 hover:text-violet-800 font-medium">
          Privacy Policy
        </Link>
      </p>
    </section>
  );
};

export default React.memo(SocialAuthOptions);
