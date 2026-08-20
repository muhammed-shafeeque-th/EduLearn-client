'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, Twitter, Youtube, User, Mail, Linkedin, Github, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Instructor } from '@/types/user';
import { MarkdownRenderer } from './markdown-renderer';

interface InstructorHeaderProps {
  instructor: Instructor;
}

const socialIcons = {
  website: Globe,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  email: Mail,
};

export function InstructorHeader({ instructor }: InstructorHeaderProps) {
  const [imageError, setImageError] = useState(false);

  const socialLinks = [
    { type: 'website', url: instructor.profile?.website, label: 'Website' },
    {
      type: 'twitter',
      url: instructor.socials?.find((social) => social.provider == 'twitter')?.profileUrl,
      label: 'Twitter',
    },
    {
      type: 'youtube',
      url: instructor.socials?.find((social) => social.provider == 'youtube')?.profileUrl,
      label: 'YouTube',
    },
    {
      type: 'linkedin',
      url: instructor.socials?.find((social) => social.provider == 'linkedin')?.profileUrl,
      label: 'LinkedIn',
    },
    {
      type: 'github',
      url: instructor.socials?.find((social) => social.provider == 'github')?.profileUrl,
      label: 'GitHub',
    },
  ].filter((link) => link.url);

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Header Info */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-800">
                Course Instructor
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  {instructor.username}
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-2xl">
                  {instructor.instructorProfile?.expertise}
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-12 py-8 border-y border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Total Students
                  </p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {instructor.instructorProfile?.totalStudents.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Average Rating
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {instructor.instructorProfile?.rating.toFixed(1)}
                    </p>
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400 mb-1" />
                  </div>
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Courses Published
                  </p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {instructor.instructorProfile?.totalCourses || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  About {instructor.username?.split(' ')[0]}
                </h2>
              </div>
              {instructor.instructorProfile?.bio ? (
                <div className="prose prose-lg max-w-none dark:prose-invert prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:font-medium prose-headings:font-black">
                  <MarkdownRenderer markdown={instructor.instructorProfile.bio} />
                </div>
              ) : null}
            </div>

            {/* Expertise */}
            {instructor.instructorProfile?.tags &&
              instructor.instructorProfile?.tags.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Specialties & Expertise
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {instructor.instructorProfile.tags.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-xl font-bold text-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-8">
              {/* Profile Image */}
              <div className="relative group mx-auto w-48 h-48">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                <div className="relative w-48 h-48 rounded-full p-1.5 border-4 border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 transition-transform duration-700 group-hover:scale-105">
                  {instructor.avatar && !imageError ? (
                    <Image
                      src={instructor.avatar}
                      alt={instructor.username}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover rounded-full"
                      onError={() => setImageError(true)}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                      <User size={80} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Button */}
              <Button
                className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 dark:shadow-none"
                size="lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Instructor
              </Button>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((link) => {
                    const Icon = socialIcons[link.type as keyof typeof socialIcons];
                    return (
                      <Button
                        key={link.type}
                        variant="outline"
                        className="h-12 justify-center border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500 hover:text-blue-500 transition-all font-bold"
                        asChild
                      >
                        <Link
                          href={link.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Icon size={16} />
                          <span className="text-xs">{link.label}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Quick Stats */}
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Response Rate
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Response Time
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    Within 2h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Member Since
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {instructor.createdAt ? new Date(instructor.createdAt).getFullYear() : '2025'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
