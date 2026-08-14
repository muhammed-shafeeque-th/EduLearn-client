'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    try {
      // Wire this up to your API route / email provider.
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Message sent. We'll reply within one business day.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white p-6 md:p-8 rounded-sm border border-[#14213D]/10"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label
            htmlFor="contact-name"
            className="font-mono text-xs uppercase tracking-wide text-slate-500"
          >
            Name
          </label>
          <Input
            id="contact-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Jordan Lee"
            className="rounded-sm"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="contact-email"
            className="font-mono text-xs uppercase tracking-wide text-slate-500"
          >
            Email
          </label>
          <Input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="jordan@example.com"
            className="rounded-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="contact-subject"
          className="font-mono text-xs uppercase tracking-wide text-slate-500"
        >
          Subject
        </label>
        <Input
          id="contact-subject"
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          placeholder="What's this about?"
          className="rounded-sm"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="contact-message"
          className="font-mono text-xs uppercase tracking-wide text-slate-500"
        >
          Message
        </label>
        <Textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          placeholder="Tell us how we can help."
          className="rounded-sm resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full font-medium bg-[#14213D] hover:bg-[#14213D]/90 text-[#F8F7F2] rounded-sm"
      >
        {submitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
