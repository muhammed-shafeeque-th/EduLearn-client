'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageSquare, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FAQsSkeleton } from './skeletons/faq-skeleton';
import { cn } from '@/lib/utils';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isExpanded?: boolean;
}

const FAQ_CATEGORIES = [
  { id: 'general', label: 'General', color: 'bg-blue-500' },
  { id: 'courses', label: 'Courses', color: 'bg-emerald-500' },
  { id: 'enrollment', label: 'Enrollment', color: 'bg-amber-500' },
  { id: 'pricing', label: 'Pricing', color: 'bg-purple-500' },
  { id: 'technical', label: 'Technical Issues', color: 'bg-rose-500' },
  { id: 'support', label: 'Support', color: 'bg-slate-500' },
];

const FAQ_DATA: FAQ[] = [
  {
    id: '1',
    category: 'general',
    question: 'How do I start a course?',
    answer:
      "To start a course, simply click on the 'Enroll Now' button on any course page. Once you've completed the checkout process, the course will be available in your 'My Courses' dashboard.",
  },
  {
    id: '2',
    category: 'general',
    question: 'Are the courses self-paced?',
    answer:
      'Yes! All our courses are completely self-paced. Once you enroll, you have lifetime access to the content and can learn whenever it fits your schedule.',
  },
  {
    id: '3',
    category: 'enrollment',
    question: 'How do I enroll in a course?',
    answer:
      "Enrolling is simple! Browse our course catalog, select the course you want, click 'Enroll Now', and complete the payment process. Once enrolled, you'll have immediate access to all course materials and can start learning right away.",
  },
  {
    id: '4',
    category: 'pricing',
    question: 'What are the pricing options available?',
    answer:
      'We offer flexible pricing options: Individual courses, Monthly subscriptions for unlimited access, and Annual plans with significant savings. We also provide financial aid and student discounts.',
  },
  {
    id: '5',
    category: 'technical',
    question: 'What technical requirements do I need?',
    answer:
      'You need a stable internet connection, a modern web browser (Chrome, Firefox, Safari, or Edge), and a device. Some courses may require specific software which will be mentioned in the course description.',
  },
  {
    id: '6',
    category: 'support',
    question: 'How can I get help if I have issues?',
    answer:
      'Our support team is available 24/7 through live chat or email. We typically respond within 2-4 hours to ensure you stay on track with your learning.',
  },
];

export function FAQsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setFaqs(FAQ_DATA);
      setFilteredFaqs(FAQ_DATA);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = faqs;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredFaqs(filtered);
  }, [faqs, selectedCategory, searchQuery]);

  const toggleFAQ = (id: string) => {
    setFilteredFaqs((prev) =>
      prev.map((faq) => (faq.id === id ? { ...faq, isExpanded: !faq.isExpanded } : faq))
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success("Question submitted successfully! We'll get back to you soon.");
    setContactForm({ subject: '', message: '' });
  };

  const getCategoryLabel = (categoryId: string) => {
    return FAQ_CATEGORIES.find((cat) => cat.id === categoryId)?.label || categoryId;
  };

  if (isLoading) {
    return <FAQsSkeleton />;
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 border-b">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                Support Center
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground">
                How can we <span className="text-primary">help</span> you?
              </h1>
              <p className="text-muted-foreground text-lg">
                Search our knowledge base or browse by category.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <div className="relative flex items-center bg-card border rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Search className="ml-4 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Ask a question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-base h-12 bg-transparent"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-4">
                  Categories
                </h3>
                <nav className="flex flex-col gap-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-medium',
                      selectedCategory === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4" />
                      <span>All Categories</span>
                    </div>
                    <span>{faqs.length}</span>
                  </button>

                  {FAQ_CATEGORIES.map((category) => {
                    const count = faqs.filter((faq) => faq.category === category.id).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-medium',
                          selectedCategory === category.id
                            ? 'bg-secondary text-secondary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('w-2 h-2 rounded-full bg-primary/40')} />
                          <span>{category.label}</span>
                        </div>
                        <span>{count}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-9 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-sm">
                  Showing {filteredFaqs.length} results
                </p>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => (
                      <motion.div
                        key={faq.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          'border rounded-xl transition-all bg-card overflow-hidden',
                          faq.isExpanded ? 'ring-1 ring-primary/20 border-primary/30 shadow-sm' : ''
                        )}
                      >
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full p-5 text-left flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-primary/70">
                              {getCategoryLabel(faq.category)}
                            </span>
                            <h3 className="text-lg font-semibold text-foreground">
                              {faq.question}
                            </h3>
                          </div>
                          <ChevronDown
                            className={cn(
                              'w-5 h-5 text-muted-foreground transition-transform duration-300',
                              faq.isExpanded ? 'rotate-180 text-primary' : ''
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {faq.isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-5 pb-5 border-t bg-muted/30"
                            >
                              <p className="pt-4 text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                      <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <h3 className="text-xl font-semibold mb-2">No results found</h3>
                      <p className="text-muted-foreground mb-6">Try different search terms.</p>
                      <Button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 mt-12">
        <div className="bg-secondary/30 border rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Still have questions?</h2>
              <p className="text-muted-foreground text-lg">
                Our support team is here to help you around the clock.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="mailto:support@edulearn.com"
                  className="p-4 border rounded-xl bg-card hover:bg-muted transition-colors"
                >
                  <p className="font-semibold mb-1">Email Support</p>
                  <p className="text-xs text-muted-foreground">Response within 4h</p>
                </a>
                <a
                  href="/contact"
                  className="p-4 border rounded-xl bg-card hover:bg-muted transition-colors"
                >
                  <p className="font-semibold mb-1">Live Chat</p>
                  <p className="text-xs text-muted-foreground">Talk to us instantly</p>
                </a>
              </div>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="space-y-4 bg-card p-6 rounded-xl border shadow-sm"
            >
              <div className="space-y-2">
                <label htmlFor="faq-subject" className="text-xs font-semibold px-1">
                  Subject
                </label>
                <Input
                  id="faq-subject"
                  placeholder="What's it about?"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="faq-message" className="text-xs font-semibold px-1">
                  Message
                </label>
                <Textarea
                  id="faq-message"
                  placeholder="Describe your question..."
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                  className="rounded-lg resize-none"
                />
              </div>
              <Button type="submit" className="w-full font-semibold">
                Send Question
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
