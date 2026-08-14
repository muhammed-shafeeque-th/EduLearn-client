'use client';

import { useState, useEffect } from 'react';
import { Category } from '../types';

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Development',
    icon: '💻',
    subcategories: [
      { id: '1-1', name: 'Web Development', courseCount: 245 },
      { id: '1-2', name: 'Mobile Development', courseCount: 156 },
      { id: '1-3', name: 'Programming Languages', courseCount: 189 },
      { id: '1-4', name: 'Game Development', courseCount: 78 },
    ],
  },
  {
    id: '2',
    name: 'Business',
    icon: '💼',
    subcategories: [
      { id: '2-1', name: 'Entrepreneurship', courseCount: 134 },
      { id: '2-2', name: 'Communication', courseCount: 89 },
      { id: '2-3', name: 'Management', courseCount: 156 },
      { id: '2-4', name: 'Sales', courseCount: 67 },
    ],
  },
  {
    id: '3',
    name: 'Finance & Accounting',
    icon: '💰',
    subcategories: [
      { id: '3-1', name: 'Accounting & Bookkeeping', courseCount: 98 },
      { id: '3-2', name: 'Cryptocurrency & Blockchain', courseCount: 45 },
      { id: '3-3', name: 'Finance', courseCount: 123 },
      { id: '3-4', name: 'Financial Modeling & Analysis', courseCount: 34 },
    ],
  },
  {
    id: '4',
    name: 'IT & Software',
    icon: '🔧',
    subcategories: [
      { id: '4-1', name: 'IT Certifications', courseCount: 167 },
      { id: '4-2', name: 'Network & Security', courseCount: 89 },
      { id: '4-3', name: 'Hardware', courseCount: 45 },
      { id: '4-4', name: 'Operating Systems', courseCount: 56 },
    ],
  },
  {
    id: '5',
    name: 'Office Productivity',
    icon: '📊',
    subcategories: [
      { id: '5-1', name: 'Microsoft', courseCount: 234 },
      { id: '5-2', name: 'Apple', courseCount: 67 },
      { id: '5-3', name: 'Google', courseCount: 89 },
      { id: '5-4', name: 'SAP', courseCount: 23 },
    ],
  },
  {
    id: '6',
    name: 'Personal Development',
    icon: '🌱',
    subcategories: [
      { id: '6-1', name: 'Personal Transformation', courseCount: 145 },
      { id: '6-2', name: 'Personal Productivity', courseCount: 89 },
      { id: '6-3', name: 'Leadership', courseCount: 167 },
      { id: '6-4', name: 'Career Development', courseCount: 123 },
    ],
  },
  {
    id: '7',
    name: 'Design',
    icon: '🎨',
    subcategories: [
      { id: '7-1', name: 'Web Design', courseCount: 198 },
      { id: '7-2', name: 'Graphic Design & Illustration', courseCount: 156 },
      { id: '7-3', name: 'Design Tools', courseCount: 134 },
      { id: '7-4', name: 'User Experience Design', courseCount: 89 },
    ],
  },
  {
    id: '8',
    name: 'Marketing',
    icon: '📈',
    subcategories: [
      { id: '8-1', name: 'Digital Marketing', courseCount: 267 },
      { id: '8-2', name: 'Search Engine Optimization', courseCount: 145 },
      { id: '8-3', name: 'Social Media Marketing', courseCount: 189 },
      { id: '8-4', name: 'Branding', courseCount: 78 },
    ],
  },
];
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCategories(mockCategories);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { categories, isLoading };
}
