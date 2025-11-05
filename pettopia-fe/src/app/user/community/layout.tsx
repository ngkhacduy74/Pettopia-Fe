'use client'
import React from 'react';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto">{children}</div>
  );
}
