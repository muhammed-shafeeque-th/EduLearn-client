'use client';

// import { Plus } from 'lucide-react';
// import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function UsersHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">Manage student accounts and user data</p>
      </div>
      {/* <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add User
      </Button> */}
    </motion.div>
  );
}
