'use client';

import React from 'react';
import { Book } from 'lucide-react';

export default function CookbookPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
        <Book size={48} />
      </div>
      <h1 className="font-serif text-4xl text-text-main m-0">Under Maintenance</h1>
      <p className="text-text-light text-lg max-w-md">
        The Book View feature is currently undergoing maintenance and upgrades. Please check back later!
      </p>
    </div>
  );
}
