import { Course } from '@/types/course';

export default function CourseJsonLd({ course }: { course: Course }) {
  //   const breadcrumbJsonLd = {
  //     '@context': 'https://schema.org',
  //     '@type': 'BreadcrumbList',
  //     itemListElement: [
  //       {
  //         '@type': 'ListItem',
  //         position: 1,
  //         name: 'Home',
  //         item: 'https://edulearn.com',
  //       },
  //       {
  //         '@type': 'ListItem',
  //         position: 2,
  //         name: 'Courses',
  //         item: 'https://edulearn.com/courses',
  //       },
  //       {
  //         '@type': 'ListItem',
  //         position: 3,
  //         name: course.title,
  //         item: `https://edulearn.com/courses/${course.slug}`,
  //       },
  //     ],
  //   };

  //   const faqJsonLd = {
  //     '@context': 'https://schema.org',
  //     '@type': 'FAQPage',
  //     mainEntity: [
  //       {
  //         '@type': 'Question',
  //         name: 'Do I need programming experience?',
  //         acceptedAnswer: {
  //           '@type': 'Answer',
  //           text: 'No. This course is designed for complete beginners.',
  //         },
  //       },
  //       {
  //         '@type': 'Question',
  //         name: 'How long does the course take?',
  //         acceptedAnswer: {
  //           '@type': 'Answer',
  //           text: 'Approximately 20 hours of video content.',
  //         },
  //       },
  //     ],
  //   };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',

    name: course.title,
    description: course.description.slice(0, 100),

    provider: {
      '@type': 'Organization',
      name: 'EduLearn',
      url: 'https://edulearn.com',
    },

    instructor: {
      '@type': 'Person',
      name: course.instructor.name,
      url: course.instructor.avatar,
    },

    educationalLevel: course.level,
    inLanguage: course.language,

    timeRequired: `PT${course.durationValue + course.durationValue}`,

    image: course.thumbnail,

    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.rating,
      reviewCount: course.totalRatings,
    },

    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: course.currency,
      availability: 'https://schema.org/InStock',
      url: `https://edulearn.com/courses/${course.slug}`,
    },

    dateModified: course.updatedAt,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
