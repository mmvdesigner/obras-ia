import { Home } from 'lucide-react';
import React from 'react';

export const LiderLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <Home className={className} {...props} />
);
