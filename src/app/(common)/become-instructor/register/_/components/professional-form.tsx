'use client';

import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { UseFormReturn, Controller } from 'react-hook-form';

import { ProfessionalInfo } from '../schemas';
import { educationLevels, experienceLevels, expertiseAreas } from '../constants';
import { LANGUAGES } from '@/lib/constants/languages';

function ProfessionalForm({
  professionalForm,
}: {
  professionalForm: UseFormReturn<ProfessionalInfo>;
}) {
  const {
    control,
    formState: { errors },
  } = professionalForm;

  return (
    <motion.div
      key="professional"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="expertise">Area of Expertise</Label>
        <Controller
          name="expertise"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || ''}
              onValueChange={(value) => {
                field.onChange(value);
                field.onBlur();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your main expertise" />
              </SelectTrigger>
              <SelectContent>
                {expertiseAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.expertise && <p className="text-red-500 text-sm">{errors.expertise.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="experience">Teaching Experience</Label>
          <Controller
            name="experience"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  field.onBlur();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.experience && <p className="text-red-500 text-sm">{errors.experience.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Education Level</Label>
          <Controller
            name="education"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  field.onBlur();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.education && <p className="text-red-500 text-sm">{errors.education.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Controller
          name="language"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || ''}
              onValueChange={(value) => {
                field.onChange(value);
                field.onBlur();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.language && <p className="text-red-500 text-sm">{errors.language.message}</p>}
      </div>
    </motion.div>
  );
}

export default ProfessionalForm;
