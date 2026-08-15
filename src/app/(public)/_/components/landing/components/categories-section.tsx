import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants/routes';
import { Code, Megaphone, Heart, Briefcase } from 'lucide-react';
import Link from 'next/link';

async function getCategories() {
  return [
    {
      id: 1,
      name: 'Business & Management',
      slug: 'business-management',
      courses: 11,
      icon: Briefcase,
      color: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600',
    },
    {
      id: 2,
      name: 'Development',
      slug: 'development',
      courses: 12,
      icon: Code,
      color: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600',
    },
    {
      id: 3,
      name: 'Marketing',
      slug: 'marketing',
      courses: 12,
      icon: Megaphone,
      color: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600',
    },
    {
      id: 4,
      name: 'Health & Fitness',
      slug: 'health-fitness',
      courses: 14,
      icon: Heart,
      color: 'bg-orange-100 dark:bg-orange-900/20',
      iconColor: 'text-orange-600',
    },
  ];
}

export default async function CategoriesSection() {
  const categories = await getCategories();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Top Categories
          </h2>
          {/* <Button variant="ghost" className="text-primary hover:text-primary/80">
            See All
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button> */}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer border-0 shadow-md hover:shadow-lg transition-shadow duration-300 group"
            >
              <Link href={`${ROUTES.public.courses.root}?category=${category.slug}`}>
                <CardContent className="p-8 text-center space-y-4 group-hover:-translate-y-1 transition-transform duration-300">
                  <div
                    className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto`}
                  >
                    <category.icon className={`h-8 w-8 ${category.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {category.courses} Courses
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
