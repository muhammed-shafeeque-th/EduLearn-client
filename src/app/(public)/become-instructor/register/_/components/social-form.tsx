'use client';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { UseFormReturn } from 'react-hook-form';

import { SocialInfo } from '../schemas';
import { memo } from 'react';

function SocialForm({ socialForm }: { socialForm: UseFormReturn<SocialInfo> }) {
  return (
    <motion.div
      key="social"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn Profile (Optional)</Label>
          <Input
            id="linkedinUrl"
            {...socialForm.register('linkedinUrl')}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          {socialForm.formState.errors.linkedinUrl && (
            <p className="text-red-500 text-sm">
              {socialForm.formState.errors.linkedinUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Personal Website (Optional)</Label>
          <Input
            id="websiteUrl"
            {...socialForm.register('websiteUrl')}
            placeholder="https://yourwebsite.com"
          />
          {socialForm.formState.errors.websiteUrl && (
            <p className="text-red-500 text-sm">{socialForm.formState.errors.websiteUrl.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram Profile (Optional)</Label>
          <Input
            id="instagramUrl"
            {...socialForm.register('instagramUrl')}
            placeholder="https://instagram.com/in/yourprofile"
          />
          {socialForm.formState.errors.instagramUrl && (
            <p className="text-red-500 text-sm">
              {socialForm.formState.errors.instagramUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebookUrl">Facebook (Optional)</Label>
          <Input
            id="facebookUrl"
            {...socialForm.register('facebookUrl')}
            placeholder="https://facebook.com"
          />
          {socialForm.formState.errors.facebookUrl && (
            <p className="text-red-500 text-sm">
              {socialForm.formState.errors.facebookUrl.message}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(SocialForm);
