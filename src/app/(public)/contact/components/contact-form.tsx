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
      className="space-y-5 bg-card p-6 md:p-8 rounded-2xl border shadow-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label
            htmlFor="contact-name"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Name
          </label>
          <Input
            id="contact-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Jordan Lee"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="contact-email"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Email
          </label>
          <Input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="jordan@example.com"
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="contact-subject"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Subject
        </label>
        <Input
          id="contact-subject"
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          placeholder="What's this about?"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="contact-message"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Message
        </label>
        <Textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          placeholder="Tell us how we can help."
          className="rounded-xl resize-none"
        />
      </div>

      {/* No color override here — Button's default variant already reads
          the app's real primary (blue) theme token, so it matches the
          Sign Up / Start your instructor journey buttons elsewhere. */}
      <Button type="submit" disabled={submitting} className="w-full font-medium rounded-xl">
        {submitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
