export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FaqCategoryId;
}

export type FaqCategoryId =
  | 'general'
  | 'courses'
  | 'enrollment'
  | 'pricing'
  | 'technical'
  | 'support';

export const FAQ_CATEGORIES: { id: FaqCategoryId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'courses', label: 'Courses' },
  { id: 'enrollment', label: 'Enrollment' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'technical', label: 'Technical Issues' },
  { id: 'support', label: 'Support' },
];

export const FAQ_DATA: FAQ[] = [
  {
    id: '1',
    category: 'general',
    question: 'How do I start a course?',
    answer:
      'Click \u201cEnroll Now\u201d on any course page and complete checkout. The course appears immediately in your \u201cMy Courses\u201d dashboard, ready to begin.',
  },
  {
    id: '2',
    category: 'general',
    question: 'Are the courses self-paced?',
    answer:
      'Yes. Every course is self-paced with lifetime access once enrolled, so you can study on whatever schedule fits your life.',
  },
  {
    id: '3',
    category: 'enrollment',
    question: 'How do I enroll in a course?',
    answer:
      'Browse the catalog, choose a course, select \u201cEnroll Now,\u201d and complete payment. You receive immediate access to all materials.',
  },
  {
    id: '4',
    category: 'enrollment',
    question: 'Can I switch or cancel a course after enrolling?',
    answer:
      'You can switch to a different course within 14 days of enrollment at no charge. Cancellations within that window are refunded in full to your original payment method.',
  },
  {
    id: '5',
    category: 'pricing',
    question: 'What are the pricing options available?',
    answer:
      'Choose single-course purchases, a monthly subscription for unlimited access, or an annual plan at a reduced rate. Financial aid and student discounts are available on request.',
  },
  {
    id: '6',
    category: 'pricing',
    question: 'Do you offer refunds?',
    answer:
      'Yes. Individual course purchases are eligible for a full refund within 14 days if you have completed less than 20% of the content.',
  },
  {
    id: '7',
    category: 'technical',
    question: 'What technical requirements do I need?',
    answer:
      'A stable internet connection, a current version of Chrome, Firefox, Safari, or Edge, and any device from the last five years. Individual courses will list additional software where relevant.',
  },
  {
    id: '8',
    category: 'technical',
    question: 'Why won\u2019t my video lessons load?',
    answer:
      'Most playback issues resolve by clearing your browser cache or switching networks. If the problem persists, our support team can check your account directly.',
  },
  {
    id: '9',
    category: 'courses',
    question: 'Do I receive a certificate on completion?',
    answer:
      'Every course awards a certificate of completion once all modules and the final assessment are finished. Certificates can be downloaded or shared directly to LinkedIn.',
  },
  {
    id: '10',
    category: 'support',
    question: 'How can I get help if I have issues?',
    answer:
      'Our support team is available through live chat or email at any hour. Typical response time is two to four hours.',
  },
];

export function faqsByCategory(categoryId: FaqCategoryId) {
  return FAQ_DATA.filter((faq) => faq.category === categoryId);
}
