export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingMinutes: number;
  // Array of simple content blocks so the renderer stays dumb — swap for
  // MDX or a CMS rich-text field later without touching the page shell.
  body: { heading?: string; paragraphs: string[] }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'self-paced-vs-cohort-based-learning',
    title: 'Self-Paced vs. Cohort-Based Learning: Which Actually Gets You Hired?',
    description:
      'A practical comparison of self-paced and cohort-based online courses — completion rates, cost, flexibility, and which format employers actually respond to.',
    category: 'Learning Strategy',
    author: 'EduLearn Team',
    publishedAt: '2026-06-02',
    readingMinutes: 7,
    body: [
      {
        paragraphs: [
          'Every course platform eventually asks you to pick a format: self-paced, where you work through material on your own schedule, or cohort-based, where you move through a fixed curriculum alongside a group on a set timeline. The format you choose affects completion rates, cost, and — for career changers specifically — how quickly you actually get hired.',
        ],
      },
      {
        heading: 'Completion rates favor cohorts, but not for the reason people assume',
        paragraphs: [
          'Cohort-based courses report meaningfully higher completion rates than self-paced ones. The usual explanation is "accountability," but the bigger factor is simpler: a fixed schedule removes the decision of when to study. Self-paced learners have to re-decide every single day, and that decision fatigue is where most drop-off happens.',
          'That said, self-paced formats win badly needed flexibility for anyone with irregular hours, caregiving responsibilities, or a job that doesn\u2019t allow for a fixed weekly commitment. The right answer depends more on your calendar than your discipline.',
        ],
      },
      {
        heading: 'What employers actually look at',
        paragraphs: [
          'Hiring managers rarely ask which format you used. They look at three things: a portfolio or project you can walk them through, a certificate or credential that maps to a skill they need right now, and how recently you completed it. Format is invisible in a resume screen — output is not.',
          'If you\u2019re self-paced, this means treating your own momentum as the product to manage: set a weekly minimum, not a vague "when I have time" plan, and track it the way a cohort deadline would force you to.',
        ],
      },
      {
        heading: 'Cost is the deciding factor for most people',
        paragraphs: [
          'Cohort programs typically cost 3-10x more than individual self-paced courses covering the same material, because you\u2019re paying for live instruction and a fixed instructor-to-student ratio. For a first skill in a new field, that premium is rarely justified. It starts to make sense for a second or third specialization, once you already know the material rewards the investment.',
        ],
      },
      {
        heading: 'The practical answer',
        paragraphs: [
          'Start self-paced for your first course in a subject to confirm it holds your interest before committing real money to a cohort. If you finish it and want deeper, faster progress with peer accountability, that\u2019s the signal to move to a cohort — not the other way around.',
        ],
      },
    ],
  },
  {
    slug: 'do-online-course-certificates-matter-to-employers',
    title: 'Do Online Course Certificates Actually Matter to Employers?',
    description:
      'What hiring managers really think about online course certificates, when they help, and how to present one so it strengthens your application instead of getting ignored.',
    category: 'Career',
    author: 'EduLearn Team',
    publishedAt: '2026-05-18',
    readingMinutes: 6,
    body: [
      {
        paragraphs: [
          'Ask ten hiring managers whether they care about online course certificates and you\u2019ll get ten different answers, which is itself the honest answer: it depends entirely on context, and most candidates present their certificates in a way that undersells them.',
        ],
      },
      {
        heading: 'The certificate is not the credential — the proof of skill is',
        paragraphs: [
          'A certificate by itself signals "I finished something." That\u2019s weak evidence on its own. What actually moves a hiring decision is the artifact behind it: the project you built, the problem you solved, the dataset you cleaned. Certificates that come bundled with a portfolio piece do real work; certificates that sit alone on a LinkedIn profile mostly don\u2019t.',
        ],
      },
      {
        heading: 'Where certificates carry the most weight',
        paragraphs: [
          'They matter most for career changers with no other evidence in the field, for compliance-adjacent skills where a specific credential is genuinely required (certain finance, healthcare, or security certifications), and for internal mobility, where a manager already trusts you and just needs a formal reason to justify a transfer.',
          'They matter least for competing against candidates with direct work experience in the exact role. At that point the certificate is a tie-breaker at best.',
        ],
      },
      {
        heading: 'How to present one so it actually helps',
        paragraphs: [
          'Don\u2019t list a certificate as a bullet point under "Education." Attach it to a specific accomplishment: "Completed EduLearn\u2019s Data Analysis certificate and used the skills to rebuild our team\u2019s reporting pipeline, cutting weekly report time from four hours to 40 minutes." The certificate becomes evidence for a claim instead of a claim by itself.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-choose-an-online-course-platform',
    title: 'How to Choose an Online Course Platform (Without Wasting Money)',
    description:
      'A checklist for evaluating online course platforms before you pay — refund policies, instructor credibility, content freshness, and the questions most people forget to ask.',
    category: 'Learning Strategy',
    author: 'EduLearn Team',
    publishedAt: '2026-04-30',
    readingMinutes: 8,
    body: [
      {
        paragraphs: [
          'The online course market is large enough that almost any subject has fifteen competing options, most of them presented with near-identical marketing pages. The differences that actually matter are rarely on the sales page — they\u2019re in policy details and instructor background you have to dig for.',
        ],
      },
      {
        heading: 'Check who actually teaches it',
        paragraphs: [
          'Search the instructor\u2019s name outside the platform. Are they currently working in the field, or did they stop practicing years ago and pivot to teaching full-time? Neither is automatically disqualifying, but a platform that hides instructor backgrounds behind a first name and a stock photo is a signal to look elsewhere.',
        ],
      },
      {
        heading: 'Ask when the content was last updated',
        paragraphs: [
          'Fast-moving fields — software, design tools, marketing platforms — go stale within 12-18 months. A course with no visible update history covering a tool that changed its interface two versions ago is teaching you to use software that no longer exists. Look for a stated revision schedule or a visible "last updated" date.',
        ],
      },
      {
        heading: 'Read the refund policy before you need it',
        paragraphs: [
          'A specific, time-bound refund window (say, 14 days, with a completion-percentage cap) is a good sign — it means the platform is confident enough in the product to offer real terms. Vague language like "refunds considered case by case" usually means they aren\u2019t.',
        ],
      },
      {
        heading: 'Look for a completion path, not just content',
        paragraphs: [
          'Video count isn\u2019t the same as a curriculum. Good platforms structure courses around a project or outcome you build toward, not just a stack of lectures. If you can\u2019t find a clear answer to "what will I be able to do when I finish this," that\u2019s the biggest warning sign of all.',
        ],
      },
      {
        heading: 'The five-minute test',
        paragraphs: [
          'Before paying, spend five minutes trying to find: the instructor\u2019s current job, the last content update date, the refund policy, and one specific thing you\u2019ll be able to build or do afterward. If a platform makes any of those hard to find, treat that difficulty itself as the answer.',
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
