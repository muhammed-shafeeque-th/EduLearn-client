'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export function CartEmpty() {
  return (
    <div className="container mx-auto px-4 py-12">
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
              <ShoppingCart className="w-12 h-12 text-primary dark:text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-4"
            >
              Your Cart is Empty
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-8 max-w-md mx-auto"
            >
              Explore our courses and add them to your cart to start your learning journey.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-primary/90 hover:bg-primary text-white" asChild>
                <Link href="/courses">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Courses
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link href="#">
                  <BookOpen className="w-5 h-5 mr-2" />
                  View Categories
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
