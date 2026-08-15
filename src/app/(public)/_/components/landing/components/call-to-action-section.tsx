import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section
      className="py-20 bg-gradient-to-r from-blue-600 to-primary text-white text-center"
      aria-label="Call to Action"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-lg sm:text-xl text-blue-100 mb-6 max-w-xl mx-auto">
          Join millions of learners and advance your career with expert-led courses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Start Learning Today
          </Button>
          <Button
            variant="default"
            size="lg"
            className="border-white text-white bg-primary hover:bg-white hover:text-primary"
          >
            Browse Courses
          </Button>
        </div>
      </div>
    </section>
  );
}
