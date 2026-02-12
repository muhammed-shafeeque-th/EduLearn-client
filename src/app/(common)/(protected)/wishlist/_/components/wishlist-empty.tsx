'use client';

import { motion } from 'framer-motion';
import { Heart, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export function WishlistEmpty() {
  return (
    <div className="min-h-screen bg-background">
      {/* Empty State */}
      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-0 shadow-none">
            <CardContent className="text-center py-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 dark:bg-primary rounded-full mb-6"
              >
                <Heart className="w-12 h-12 dark:text-white text-primary" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold text-foreground mb-4"
              >
                Your Wishlist is Empty
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-lg mb-8 max-w-md mx-auto"
              >
                Start exploring courses and add your favorites to your wishlist.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href={'/courses'}>
                  <Button size="lg" className="bg-primary/80 hover:bg-primary text-white">
                    <Search className="w-5 h-5 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  View Categories
                </Button>
              </motion.div>

              {/* Popular Categories */}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Popular Categories</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'Web Development',
                    'Digital Marketing',
                    'Data Science',
                    'UI/UX Design',
                    'Mobile Development',
                    'Photography',
                  ].map((category) => (
                    <Button key={category} variant="secondary" size="sm" className="rounded-full">
                      {category}
                    </Button>
                  ))}
                </div>
              </motion.div> */}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
