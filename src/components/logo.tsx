import { Wrench } from 'lucide-react';
import React from 'react';

export const LiderLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <Wrench className={className} {...props} />
);
