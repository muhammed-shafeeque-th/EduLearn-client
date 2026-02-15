'use client';

import { Input } from '@/components/ui/input';
import { UserProfileType } from '../schemas';
import { Control } from 'react-hook-form';

interface PhoneNumberInputProps {
  control: Control<UserProfileType>;
  value?: string;
  onChange: (value: string) => void;
  country?: string;
  placeholder?: string;
}

// Country code mappings
const COUNTRY_PHONE_CODES: Record<string, string> = {
  US: '+1',
  CA: '+1',
  GB: '+44',
  IN: '+91',
  AU: '+61',
  DE: '+49',
  FR: '+33',
};

export function PhoneNumberInput({
  control,
  // value,
  // onChange,
  country,
  placeholder = 'Enter phone number',
}: PhoneNumberInputProps) {
  // const [displayValue, setDisplayValue] = useState(value);
  if (!country) return;
  const countryCode = COUNTRY_PHONE_CODES[country!] || '';

  // useEffect(() => {
  //   setDisplayValue(value);
  // }, [value]);

  // const formatPhoneNumber = (input: string, countryCode: string) => {
  //   // Remove all non-digits
  //   const digits = input.replace(/\D/g, '');

  //   // If country code is present and the number doesn't start with it
  //   if (countryCode && !input.startsWith(`+${countryCode}`)) {
  //     return countryCode + ' ' + digits;
  //   }

  //   return digits;
  // };

  // const handleChange = useCallback(
  //     const inputValue = e.target.value;
  //     const formattedValue = formatPhoneNumber(inputValue, countryCode);

  //     setDisplayValue(formattedValue);
  //     onChange(formattedValue);
  //   },
  //   [countryCode, onChange]
  // );

  return (
    <div className="relative">
      {countryCode && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
          {countryCode}
        </span>
      )}
      <Input
        type="tel"
        {...control.register('phone')}
        placeholder={placeholder}
        className={countryCode ? 'pl-12' : ''}
      />
    </div>
  );
}
