'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ProfileUpload from './profile-uploader';
import { CountryCitySelector } from './country-city-selector';
import { PhoneNumberInput } from './phone-number-input';
import { LANGUAGES } from '@/lib/constants/languages';
import { useProfileForm } from '../hooks/use-profile';
import { useCurrentUser } from '@/states/server/user/use-current-user';
import { userProfileSchema, UserProfileType } from '../schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Gender } from '@/types/user';

// interface ProfileFormProps {
//   user: User;
// }

export function ProfileForm() {
  const { data: user } = useCurrentUser();
  const { isLoading, handleSubmit } = useProfileForm();

  const form = useForm<UserProfileType>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      biography: user?.profile?.bio || '',
      website: user?.profile?.website || '',
      language: user?.profile?.language || 'en',
      socials: {
        facebook: user?.socials?.find((social) => social.provider === 'facebook')?.profileUrl || '',
        instagram:
          user?.socials?.find((social) => social.provider === 'instagram')?.profileUrl || '',
        linkedin: user?.socials?.find((social) => social.provider === 'linkedin')?.profileUrl || '',
      },
      avatar: user?.avatar,
      country: user?.profile?.country || '',
      city: user?.profile?.city || '',
      phone: user?.profile?.phone || '',
      gender: (user?.profile?.gender as Gender) || 'male',
    },
    mode: 'onTouched',
  });

  const {
    formState: { errors },
  } = form;

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-10 py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12">
          {/* Basic Information Section */}
          <section className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col xl:flex-row gap-10 xl:gap-14">
              <div className="flex-1 min-w-0 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Public Profile
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    This information will be displayed on your public profile page.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="shafeeque"
                            className="rounded-xl border-slate-200 dark:border-slate-800 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Johnson"
                            className="rounded-xl border-slate-200 dark:border-slate-800 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-slate-700 dark:text-slate-300">Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          {['male', 'female', 'other'].map((option) => (
                            <FormItem
                              key={option}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={option}
                                  id={`gender-${option}`}
                                  className="border-slate-300 dark:border-slate-700"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`gender-${option}`}
                                className="text-sm font-medium capitalize cursor-pointer"
                              >
                                {option}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Bio</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="I'm a passionate learner and tech enthusiast..."
                            className="resize-none min-h-[140px] rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-blue-500 p-4"
                            maxLength={500}
                            {...field}
                          />
                          <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 dark:text-slate-600 bg-white/50 dark:bg-slate-900/50 px-2 py-0.5 rounded-full">
                            {field.value?.length || 0} / 500
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Preferred Language
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 h-11">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full xl:w-80 shrink-0 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Profile Photo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Click to update your avatar.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <ProfileUpload
                    error={errors.avatar}
                    currentAvatarUrl={form.watch('avatar')}
                    onUploadSuccess={(url) => form.setValue('avatar', url, { shouldDirty: true })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information Section */}
          <section className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Contact Information
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Where should we reach you? We&apos;ll use this for platform updates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CountryCitySelector form={form} />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <PhoneNumberInput
                        control={form.control}
                        onChange={field.onChange}
                        country={form.watch('country')}
                        placeholder="Select country first"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Social Links Section */}
          <section className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Social Presence</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Connect your profiles to build your student or instructor brand.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Personal Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://yourportfolio.com"
                        type="url"
                        {...field}
                        className="rounded-xl border-slate-200 dark:border-slate-800 h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">Facebook</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="https://facebook.com/muhammed.shafeeque"
                        {...field}
                        className="rounded-xl border-slate-200 dark:border-slate-800 h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="https://linkedin.com/in/shafeeque-j"
                        {...field}
                        className="rounded-xl border-slate-200 dark:border-slate-800 h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">Instagram</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="@muhammed_shafeeque"
                        {...field}
                        className="rounded-xl border-slate-200 dark:border-slate-800 h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              className="px-8 py-2 min-w-[120px]"
              type="submit"
              disabled={!form.formState.isDirty || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting || isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
