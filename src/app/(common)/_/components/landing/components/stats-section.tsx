// This could fetch from CMS or database
async function getStats() {
  // Simulate API call - replace with actual data fetching
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    { number: '250+', label: 'Courses for our first members' },
    { number: '1000+', label: 'Courses for our first members' },
    { number: '15+', label: 'Courses for our first members' },
    { number: '2400+', label: 'Courses for our best members' },
  ];
}

export default async function StatsSection() {
  const stats = await getStats();

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
