import React from 'react';

export const LiderLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="150"
    height="130"
    viewBox="0 0 150 130"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <g fill="none" fillRule="evenodd">
      <path
        d="M23.51,56.24V115h91.98v9.99H11.52V56.24H1v-9.99L74.5,1.75l74.5,44.5v9.99H23.51z M125.49,46.25v-4.5 L74.5,12.06L23.51,41.75v4.5H125.49z M135.48,115v-9.99h9.99v-9.99h-9.99V75.03h9.99v-9.99h-9.99V55.04h9.99V46.25l-2.99-1.79 L74.5,4.26l-67.99,40.2-2.99,1.79v8.79h9.99v9.99H3.51v9.99h9.99v19.99H3.51v9.99h9.99V125H3.51v9.99h121.97V125h9.99v-9.99h-9.99V95.02h9.99v-9.99h-9.99V65.04h9.99v-9.99h-9.99V46.25z"
        fill="#F97316"
      />
      <text
        fontFamily="sans-serif"
        fontSize="36"
        fontWeight="bold"
        fill="#F97316"
        x="28"
        y="90"
      >
        LIDER
      </text>
      <text
        fontFamily="sans-serif"
        fontSize="12"
        fill="#374151"
        x="28"
        y="108"
      >
        empreendimentos
      </text>
      <text
        fontFamily="sans-serif"
        fontSize="12"
        fill="#374151"
        x="28"
        y="122"
      >
        e construções
      </text>
    </g>
  </svg>
);
