import { Metadata } from 'next';
import { aboutPageJsonLd, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { PageHero } from '@/components/layout/page-hero';
import { NumberedSection } from '@/components/layout/numbered-section';
import { ROUTES } from '@/lib/constants/routes';

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: 'About EduLearn',
  description:
    'EduLearn builds self-paced, practitioner-taught courses in development, design, business, and finance. Learn who we are and how we work.',
  path: ROUTES.public.about,
  keywords: ['about EduLearn', 'online learning company', 'EduLearn mission'],
});

const STATS = [
  { value: '1,200+', label: 'Courses published' },
  { value: '480,000', label: 'Learners enrolled' },
  { value: '92%', label: 'Completion satisfaction' },
  { value: '46', label: 'Countries reached' },
];

export default function AboutPage() {
  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={aboutPageJsonLd()} />

      <PageHero
        eyebrow="About EduLearn"
        title="Courses built by people who still do the work"
        description="We started EduLearn because most online courses are taught by people who stopped practicing years ago. Ours aren't."
        breadcrumb={[
          { label: 'Home', path: ROUTES.public.home },
          { label: 'About', path: ROUTES.public.about },
        ]}
      />

      <section className="max-w-4xl mx-auto px-6 py-6">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-b">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                {stat.label}
              </dt>
              <dd className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="py-4">
          <NumberedSection index={1} title="What we do">
            <p>
              EduLearn publishes self-paced courses across development, design, business, and
              finance. Every course is built and maintained by an instructor currently working in
              the field it teaches, and revised on a fixed schedule so the material doesn&rsquo;t go
              stale.
            </p>
          </NumberedSection>

          <NumberedSection index={2} title="How courses are made">
            <p>
              Each course goes through a three-stage review: a technical accuracy pass by a second
              practitioner, an instructional-design pass for pacing and clarity, and a learner pilot
              with a small cohort before public release.
            </p>
          </NumberedSection>

          <NumberedSection index={3} title="Who it's for">
            <p>
              Career changers who need a structured path, working professionals filling a specific
              skill gap, and teams standardizing training across a department. Courses are priced
              individually or by subscription so either use case is affordable.
            </p>
          </NumberedSection>

          <NumberedSection index={4} title="Where we're headed">
            <p>
              We&apos;re expanding into cohort-based live courses alongside the self-paced catalog,
              and building employer partnerships so certificates carry more weight in hiring
              conversations.
            </p>
          </NumberedSection>
        </div>
      </section>
    </main>
  );
}
