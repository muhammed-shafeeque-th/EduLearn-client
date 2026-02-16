'use client';

import { DashboardStats } from './_components/dashboard/_components/dashboard-stats';
import { RevenueChart } from './_components/dashboard/_components/revenue-chart';
import { CourseEnrollmentChart } from './_components/dashboard/_components/course-enrollment-chart';
// import { UserGrowthChart } from './_components/dashboard/_components/user-growth-chart';
// import { TopCoursesChart } from './_components/dashboard/_components/top-course-chart';
// import { InstructorPerformanceChart } from './_components/dashboard/_components/instructor-performance-chart';
// import { ReviewsChart } from './_components/dashboard/_components/reviews-chart';
// import { RecentActivity } from './_components/dashboard/_components/recent-activity';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back to EduLearn Admin - Here&apos;s what&apos;s happening today
        </p>
      </motion.div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts Grid */}
      <div className="grid gap-6">
        {/* Revenue and Enrollment Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <CourseEnrollmentChart />
        </div>

        {/* User Growth and Top Courses Row */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserGrowthChart />
          <TopCoursesChart />
        </div> */}

        {/* Instructor Performance and Reviews Row */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InstructorPerformanceChart />
          <ReviewsChart />
        </div> */}

        {/* Recent Activity */}
        {/* <RecentActivity /> */}
      </div>
    </div>
  );
}
