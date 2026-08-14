'use client';

import { motion } from 'framer-motion';
import { UseFormReturn, Controller, FieldValues, FieldError, Control, Path } from 'react-hook-form';

import { Agreement } from '../schemas';
import { CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ControlledCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  errors: Partial<Record<keyof T, FieldError>>;
}

function ControlledCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  errors,
}: ControlledCheckboxProps<T>) {
  // Fix: Get error message safely & type-correct
  const errorMessage =
    errors && errors[name] && 'message' in errors[name]!
      ? (errors[name] as FieldError)?.message
      : undefined;

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      render={({ field: { value, onChange, ref } }) => (
        <div className="flex items-start space-x-3">
          <Checkbox
            id={String(name)}
            checked={!!value}
            // shadcn/ui keys onCheckedChange => boolean | "indeterminate"
            onCheckedChange={(checked) =>
              onChange(checked === true, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            aria-required={required}
            aria-invalid={!!errorMessage}
            ref={ref}
          />
          <div className="space-y-1">
            <label
              htmlFor={String(name)}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
              {required && <span className="text-red-500">*</span>}
            </label>
            {description && <p className="text-xs text-gray-500">{description}</p>}
            {errorMessage && <p className="text-red-500 text-sm mt-1">{String(errorMessage)}</p>}
          </div>
        </div>
      )}
    />
  );
}

// Fix: Provide explicit prop typing for AgreementForm
function AgreementForm({ agreementForm }: { agreementForm: UseFormReturn<Agreement> }) {
  const {
    control,
    formState: { errors },
  } = agreementForm;

  return (
    <motion.div
      key="agreement"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <ControlledCheckbox
          control={control}
          errors={errors}
          name="agreeToTerms"
          label={<>I agree to the Terms and Conditions</>}
          description={
            <>
              By checking this box, you agree to our{' '}
              <a href="/terms" className="text-primary/80 hover:underline">
                Terms of Service
              </a>
            </>
          }
          required
        />
        <ControlledCheckbox
          control={control}
          errors={errors}
          name="agreeToPrivacy"
          label={<>I agree to the Privacy Policy</>}
          description={
            <>
              By checking this box, you agree to our{' '}
              <a href="/privacy" className="text-primary/80 hover:underline">
                Privacy Policy
              </a>
            </>
          }
          required
        />
        <ControlledCheckbox
          control={control}
          errors={errors}
          name="receiveUpdates"
          label={<>I want to receive updates and promotions (Optional)</>}
          description={<>Get notified about new features, course tips, and special offers</>}
        />
      </div>

      <div className="bg-orange-50 dark:bg-primary/40 border border-primary/20 dark:border-primary rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 dark:text-white text-primary/80 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-primary dark:text-white">What happens next?</h4>
            <ul className="text-sm text-primary dark:text-white space-y-1 list-disc list-inside">
              <li>We&apos;ll send you a verification email</li>
              <li>Your application will be reviewed within 24-48 hours</li>
              <li>You&apos;ll receive approval notification and can start creating courses</li>
              <li>Our team will provide onboarding support</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AgreementForm;
