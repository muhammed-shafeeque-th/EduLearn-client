'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { UserProfileType } from '../schemas';

// This would typically come from a countries API or static data
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  // Add more countries as needed
];

// Mock cities data - in production, this would come from an API
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'],
  CA: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'],
  GB: ['London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield'],
  IN: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Cochin'],
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
  DE: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart'],
  FR: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes'],
};

interface CountryCitySelectorProps {
  form: UseFormReturn<UserProfileType>;
}

export function CountryCitySelector({ form }: CountryCitySelectorProps) {
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const country = form.watch('country');

  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  useEffect(() => {
    if (country && CITIES_BY_COUNTRY[country!]) {
      setAvailableCities(CITIES_BY_COUNTRY[country!].sort());
    } else {
      setAvailableCities([]);
    }
  }, [country]);

  return (
    <>
      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue('city', '', { shouldDirty: true }); // Reset city when country changes
              }}
              defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {sortedCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
              }}
              defaultValue={field.value}
              disabled={!country || availableCities.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !country
                      ? 'Select country first'
                      : availableCities.length === 0
                        ? 'No cities available'
                        : 'Select your city'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
