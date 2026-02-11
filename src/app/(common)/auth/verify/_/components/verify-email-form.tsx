'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle, ArrowRight, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOTP } from '../hooks/use-verify';
import { Label } from '@/components/ui/label';

const OTP_LENGTH = 6 as const;

function getGmailRedirect(email: string): string | null {
  const FROM_MAIL = 'study.edulearn@gmail.com';

  if (!email) return null;
  const matches = email.match(/^([^@]+)@((?:gmail|googlemail)\.com)$/i);
  if (!matches) return null;

  return `https://mail.google.com/mail/u/0/#search/from%3A${encodeURIComponent(FROM_MAIL)}`;
}

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? 'your email';
  const userId = searchParams.get('_id') ?? 'userId';
  const name = searchParams.get('name') ?? 'username';
  const {
    otpValues,
    timeLeft,
    useFormReturn: { handleSubmit },
    onSubmit,
    handleInputChange,
    setInputRef,
    shakeError,
    focusedIndex,
    updateOtpValue,
    isLoading,
    isVerified,
    isComplete,
    handleFocus,
    handleKeyDown,
    handlePaste,
    handleResendCode,
    canResend,
    isResending,
    formatTime,
    focusInput,
  } = useOTP(OTP_LENGTH, email, name, userId);

  const otpIndexes = Array.from({ length: OTP_LENGTH }, (_, i) => i);

  const gmailRedirect = getGmailRedirect(email);

  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Email Verified!</h2>
          <p className="text-muted-foreground">
            Your account has been successfully verified. You can now access all features of
            EduLearn.
          </p>
        </div>

        <div className="space-y-4">
          <Button className="w-full bg-primary/80 hover:bg-primary text-white" size="lg" asChild>
            <Link href="/" aria-label="Continue to Home">
              Continue to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/login" aria-label="Back to Sign In">
              Back to Sign In
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Email Info */}
      <div className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg gap-2">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Code sent to <span className="font-semibold">{email}</span>
          </span>
        </div>
        {/* Gmail "Go to inbox" shortcut link */}
        {!!gmailRedirect && (
          <a
            href={gmailRedirect}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-primary underline font-medium mt-1 hover:opacity-80 transition-opacity"
            aria-label={`Go to Gmail inbox for ${email}`}
          >
            Open this Gmail inbox&nbsp;
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
        {/* OTP Input */}
        <div className="space-y-4">
          <Label htmlFor="verify-otp-input-0" className="block text-sm font-medium text-center">
            Enter 6-digit verification code
          </Label>

          <motion.div
            className="flex justify-center space-x-3"
            animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            role="group"
            aria-label="6 digit verification code inputs"
          >
            {otpIndexes.map((index) => {
              const hasValue = otpValues[index] !== '';
              const hasError = shakeError;
              const isFocused = focusedIndex === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative"
                >
                  <Input
                    id={`verify-otp-input-${index}`}
                    ref={setInputRef(index)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    aria-label={`Digit ${index + 1}`}
                    value={otpValues[index]}
                    onChange={(e) => handleInputChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    className={`
                      w-14 h-14 text-center text-xl font-bold border-2 rounded-xl
                      transition-all duration-200 ease-in-out
                      ${
                        hasValue
                          ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                          : hasError
                            ? 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : isFocused
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-200 dark:ring-blue-800'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }
                      ${hasValue ? 'scale-105' : ''}
                    `}
                    style={{
                      caretColor: 'transparent',
                    }}
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    tabIndex={0}
                  />

                  {/* Animated background for filled inputs */}
                  {hasValue && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-green-100 dark:bg-green-900 rounded-xl -z-10"
                      aria-hidden="true"
                    />
                  )}

                  {/* Clear button for filled inputs */}
                  {hasValue && (
                    <button
                      type="button"
                      aria-label={`Clear digit ${index + 1}`}
                      onClick={() => {
                        updateOtpValue(index, '');
                        focusInput(index);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-opacity"
                      tabIndex={-1}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Progress indicator */}
          <div className="flex justify-center mt-4" aria-label="OTP code entry progress">
            <div className="flex space-x-2">
              {otpIndexes.map((index) => {
                const isFilled = otpValues[index] !== '';
                return (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isFilled ? 'bg-green-500 shadow-lg' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    animate={{
                      scale: isFilled ? 1.3 : 1,
                      y: isFilled ? -2 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
          </div>

          {/* Completion indicator */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <p
                  className="text-sm text-green-600 dark:text-green-400 font-medium"
                  aria-live="polite"
                >
                  ✓ Code complete - Verifying...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Manual Submit Button (hidden when auto-submitting) */}
        {!isComplete && (
          <Button
            type="submit"
            className="w-full bg-primary/80 hover:bg-primary text-white"
            size="lg"
            disabled={!isComplete || isLoading}
            aria-disabled={!isComplete || isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="ml-2 h-4 w-4" />
            )}
            {isLoading ? 'Verifying Email...' : 'Verify Email'}
          </Button>
        )}
      </form>

      {/* Resend Section */}
      <div className="text-center space-y-4">
        <AnimatePresence mode="wait">
          {!canResend ? (
            <motion.p
              key="timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
              aria-live="polite"
            >
              Resend code in{' '}
              <span className="font-mono font-semibold text-primary/80 dark:text-primary/40">
                {formatTime(timeLeft)}
              </span>
            </motion.p>
          ) : (
            <motion.div
              key="resend"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleResendCode(email, userId, name)}
                disabled={isResending}
                className="w-full"
                aria-disabled={isResending}
                aria-label="Resend verification code"
              >
                {isResending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {isResending ? 'Sending...' : 'Resend Code'}
              </Button>
              {/* On resend, show again gmail shortcut if relevant */}
              {!!gmailRedirect && (
                <a
                  href={gmailRedirect}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-primary underline font-medium mt-2 hover:opacity-80 transition-opacity"
                  aria-label={`Go to Gmail inbox for ${email}`}
                >
                  Open this Gmail inbox&nbsp;
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help Text */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Check your spam folder if you don&apos;t see the email
        </p>
        <p className="text-xs text-muted-foreground">
          Wrong email address?{' '}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            Go back and correct it
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
