'use client';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, FileText, Heading, Loader2, Plus, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
// import MarkdownEditor from '@/app/instructor/courses/create/_/components/markdown-editor';
import { PersonalInfo } from '../schemas';
import { Textarea } from '@/components/ui/textarea';
import { useCheckUsername } from '../hooks/use-check-username';
import { Badge } from '@/components/ui/badge';

const PREDEFINED_TAGS = [
  'node.js',
  'python',
  'react.js',
  'watson',
  'c++',
  'express',
  'mongodb',
  'sql',
  'HTML',
  'CSS',
  'javascript',
  'typescript',
  'vue.js',
  'angular',
  'django',
  'flask',
  'postgresql',
  'mysql',
  'aws',
  'docker',
  'kubernetes',
  'git',
  'linux',
  'java',
  'spring',
  'machine learning',
  'data science',
  'artificial intelligence',
  'blockchain',
  'cybersecurity',
];

interface PersonalFormProps {
  personalForm: UseFormReturn<PersonalInfo>;
}

function PersonalForm({ personalForm }: PersonalFormProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = personalForm;

  // Watch bio value for the markdown editor
  const bioValue = watch('biography') || '';
  const watchedTags = watch('tags') || [];
  const prevTagsRef = useRef<string[]>(watchedTags);

  // Sync selectedTags with form state
  const [selectedTags, setSelectedTags] = useState<string[]>(watchedTags);
  const [customTag, setCustomTag] = useState('');

  // Sync local state with form state when form values change externally
  useEffect(() => {
    const tagsString = JSON.stringify(watchedTags);
    const prevTagsString = JSON.stringify(prevTagsRef.current);
    if (tagsString !== prevTagsString) {
      prevTagsRef.current = watchedTags;
      setSelectedTags(watchedTags);
    }
  }, [watchedTags]);

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setValue('tags', newTags, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setCustomTag(''); // Clear input after selection
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    setValue('tags', newTags, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  const handleCustomTagAdd = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newTags = [...selectedTags, customTag.trim()];
      setSelectedTags(newTags);
      setValue('tags', newTags, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setCustomTag('');
    }
  };

  const handleCustomTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomTagAdd();
    }
    if (e.key === 'Escape') {
      setCustomTag('');
    }
  };

  const availableTags = PREDEFINED_TAGS.filter((tag) => !selectedTags.includes(tag));

  const username = watch('username');
  const { isChecking, usernameExists, error: usernameError } = useCheckUsername(username);

  return (
    <motion.div
      key="personal"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* First Name and Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-1">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Instructor professional username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="username"
              {...register('username')}
              className={`pl-10 pr-10 ${
                errors.username || usernameExists ? 'border-destructive' : ''
              }`}
              placeholder="john_doe"
            />
            {isChecking && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400 w-4 h-4" />
            )}
          </div>
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          {!errors.username && usernameExists && (
            <p className="text-red-500 text-sm">This username is already taken.</p>
          )}
          {usernameError && <p className="text-gray-500 text-sm">{usernameError}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <div className="relative">
          <Heading className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="headline"
            {...register('headline')}
            className="pl-10"
            placeholder="Senior Software Engineer | Full-Stack Developer | React Expert"
          />
        </div>
        {errors.headline && <p className="text-red-500 text-sm">{errors.headline.message}</p>}
      </div>

      {/* New Instructor Tags Section */}
      <div className="space-y-3">
        <Label>Skills/Tags</Label>

        {/* Tag Input with Autocomplete */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter your area of Expertise/Specialization"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={handleCustomTagKeyPress}
            className="w-full"
          />

          {/* Suggestions dropdown */}
          {customTag.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
              {availableTags
                .filter(
                  (tag) =>
                    tag.toLowerCase().includes(customTag.toLowerCase()) &&
                    !selectedTags.includes(tag)
                )
                .slice(0, 8) // Limit to 8 suggestions
                .map((tag) => (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <div
                    role="button"
                    tabIndex={0}
                    key={tag}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </div>
                ))}

              {/* Show "Add as new tag" option if no exact match */}
              {customTag.trim() &&
                !availableTags.some((tag) => tag.toLowerCase() === customTag.toLowerCase()) &&
                !selectedTags.includes(customTag.trim()) && (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <div
                    role="button"
                    tabIndex={0}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 text-blue-600 font-medium"
                    onClick={handleCustomTagAdd}
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    Add &quot;{customTag}&quot; as new tag
                  </div>
                )}

              {/* No results message */}
              {availableTags.filter(
                (tag) =>
                  tag.toLowerCase().includes(customTag.toLowerCase()) && !selectedTags.includes(tag)
              ).length === 0 &&
                customTag.trim() &&
                !selectedTags.includes(customTag.trim()) && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Press Enter to add &quot;{customTag}&quot;
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Selected Tags:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="flex bg-accent text-accent-foreground rounded-md items-center gap-1 px-2 py-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="hover:bg-gray-400 rounded-xs p-0.5 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Hidden input to ensure RHF tracks the field - value is managed via setValue */}
        <input type="hidden" {...register('tags')} />

        {errors.tags && <p className="text-red-500 text-sm">{errors.tags.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Professional Bio
          </span>
        </Label>
        <Textarea
          id="biography"
          {...register('biography')}
          className="min-h-[100px]"
          placeholder="Tell us about your background, expertise, and what makes you a great instructor..."
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Minimum 50 characters</span>
          <span>{bioValue?.length || 0}/2000</span>
        </div>
        {errors.biography && <p className="text-red-500 text-sm">{errors.biography.message}</p>}
      </div>

      {/* Headline */}
      {/* <div className="space-y-2">
        <Label htmlFor="headline">Professional Headline</Label>
        <div className="relative">
          <Heading className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="headline"
            {...register('headline')}
            className="pl-10"
            placeholder="e.g., Senior Software Engineer | Full-Stack Developer | React Expert"
            maxLength={120}
          />
        </div>
        <p className="text-xs text-gray-500">
          A brief professional headline that summarizes your expertise (max 120 characters)
        </p>
        {errors.headline && <p className="text-red-500 text-sm">{errors.headline.message}</p>}
      </div> */}

      {/* Bio with Markdown Editor */}
      {/* <div className="space-y-2">
        <Label htmlFor="bio">
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Professional Bio
          </span>
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Write your professional biography. You can use markdown formatting for better
          presentation.
        </p>

        <MarkdownEditor
          value={bioValue}
          onChange={(value) => setValue('bio', value)}
          placeholder="Tell us about yourself, your experience, expertise, and what makes you a great instructor. You can use markdown formatting like **bold**, *italic*, lists, and links."
          height={200}
          maxLength={2000}
          showWordCount={true}
          error={errors.bio?.message}
          className="w-full"
        />

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Use markdown for formatting</span>
          <span>{bioValue.length}/2000 characters</span>
        </div>

        {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
      </div> */}
    </motion.div>
  );
}

export default PersonalForm;
