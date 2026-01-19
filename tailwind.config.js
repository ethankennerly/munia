/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/contexts/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgba(var(--foreground) / <alpha-value>)',
        card: 'rgba(var(--card) / <alpha-value>)',
        'card-foreground': 'rgba(var(--card-foreground) / <alpha-value>)',
        popover: 'rgba(var(--popover) / <alpha-value>)',
        'popover-foreground': 'rgba(var(--popover-foreground) / <alpha-value>)',
        primary: 'rgba(var(--primary) / <alpha-value>)',
        'primary-foreground': 'rgba(var(--primary-foreground) / <alpha-value>)',
        'primary-accent': 'rgba(var(--primary-accent) / <alpha-value>)',
        secondary: 'rgba(var(--secondary) / <alpha-value>)',
        'secondary-foreground':
          'rgba(var(--secondary-foreground) / <alpha-value>)',
        'secondary-accent': 'rgba(var(--secondary-accent) / <alpha-value>)',
        muted: 'rgba(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgba(var(--muted-foreground) / <alpha-value>)',
        accent: 'rgba(var(--accent) / <alpha-value>)',
        'accent-foreground': 'rgba(var(--accent-foreground) / <alpha-value>)',
        success: 'rgba(var(--success) / <alpha-value>)',
        'success-foreground': 'rgba(var(--success-foreground) / <alpha-value>)',
        warning: 'rgba(var(--warning) / <alpha-value>)',
        'warning-foreground': 'rgba(var(--warning-foreground) / <alpha-value>)',
        destructive: 'rgba(var(--destructive) / <alpha-value>)',
        'destructive-foreground':
          'rgba(var(--destructive-foreground) / <alpha-value>)',
        border: 'rgba(var(--border) / <alpha-value>)',
        input: 'rgba(var(--input) / <alpha-value>)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'rgba(var(--foreground) / <alpha-value>)',
            maxWidth: 'none',
            fontSize: '0.9375rem', // 15px base on mobile for better proportions
            '@media (min-width: 768px)': {
              fontSize: '1rem', // 16px base on tablet+
            },
            a: {
              color: 'rgb(var(--primary))',
              textDecoration: 'underline',
              '&:hover': {
                color: 'rgb(var(--primary-accent))',
              },
            },
            h1: {
              color: 'rgba(var(--foreground) / <alpha-value>)',
              fontSize: '1.25rem', // 20px on mobile - better proportion to 15px base
              lineHeight: '1.4',
              fontWeight: '700',
              '@media (min-width: 768px)': {
                fontSize: '1.5rem', // 24px
              },
              '@media (min-width: 1024px)': {
                fontSize: '1.75rem', // 28px
              },
            },
            h2: {
              color: 'rgba(var(--foreground) / <alpha-value>)',
              fontSize: '1.0625rem', // 17px on mobile
              lineHeight: '1.4',
              fontWeight: '600',
              '@media (min-width: 768px)': {
                fontSize: '1.25rem', // 20px
              },
              '@media (min-width: 1024px)': {
                fontSize: '1.5rem', // 24px
              },
            },
            h3: {
              color: 'rgba(var(--foreground) / <alpha-value>)',
              fontSize: '0.9375rem', // 15px on mobile (same as base)
              lineHeight: '1.4',
              fontWeight: '600',
              '@media (min-width: 768px)': {
                fontSize: '1.0625rem', // 17px
              },
              '@media (min-width: 1024px)': {
                fontSize: '1.25rem', // 20px
              },
            },
            h4: {
              color: 'rgba(var(--foreground) / <alpha-value>)',
              fontSize: '0.875rem', // 14px on mobile
              lineHeight: '1.4',
              fontWeight: '600',
              '@media (min-width: 768px)': {
                fontSize: '1rem', // 16px
              },
              '@media (min-width: 1024px)': {
                fontSize: '1.125rem', // 18px
              },
            },
            strong: {
              color: 'rgba(var(--foreground) / <alpha-value>)',
            },
            code: {
              color: 'rgba(var(--foreground) / <alpha-value>)',
              backgroundColor: 'rgba(var(--muted) / 0.3)',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            blockquote: {
              borderLeftColor: 'rgba(var(--border) / <alpha-value>)',
              color: 'rgba(var(--muted-foreground) / <alpha-value>)',
            },
          },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [typography],
};
