'use client';

import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  className?: string;
  onToggle: () => void;
  isOpen: boolean;
}

export function MobileNav({ className, onToggle, isOpen }: MobileNavProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onToggle}
      className={cn("lg:hidden", className)}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      <span className="sr-only">Toggle navigation menu</span>
    </Button>
  );
}