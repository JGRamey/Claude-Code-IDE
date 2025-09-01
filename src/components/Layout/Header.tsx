/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Claude Code IDE Custom Colors
        'claude-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'claude-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          750: '#2d3748', // Custom shade
          800: '#1f2937',
          850: '#1a202c', // Custom shade
          900: '#111827',
          950: '#0f0f23', // Custom shade
        },
        // Agent-specific colors
        'agent-frontend': '#10b981',
        'agent-backend': '#f59e0b',
        'agent-database': '#8b5cf6',
        'agent-testing': '#ef4444',
        'agent-deployment': '#06b6d4',
        'agent-security': '#f97316',
      },
      fontFamily: {
        'mono': [
          'JetBrains Mono',
          'Fira Code', 
          'Consolas', 
          'Monaco', 
          'Courier New', 
          'monospace'
        ],
        'sans': [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ]
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'typing': 'typing 1.5s steps(3, end) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        typing: {
          '0%': { width: '0' },
          '50%': { width: '100%' },
          '100%': { width: '0' },
        }
      },
      boxShadow: {
        'claude': '0 10px 25px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
        'agent': '0 4px 12px -2px rgba(139, 92, 246, 0.15)',
        'terminal': '0 8px 25px -5px rgba(0, 0, 0, 0.3)',
        'editor': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      gridTemplateColumns: {
        'ide': '256px 1fr 384px',
        'ide-collapsed': '64px 1fr 384px',
        'ide-no-sidebar': '1fr 384px',
        'ide-full': '1fr',
      },
      gridTemplateRows: {
        'ide': '48px 1fr 256px',
        'ide-no-terminal': '48px 1fr',
        'ide-terminal-full': '48px 256px',
      },
      zIndex: {
        'modal': '1000',
        'popover': '2000',
        'tooltip': '3000',
        'notification': '4000',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    
    // Custom plugin for IDE-specific utilities
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': `${theme('colors.gray.400')} ${theme('colors.gray.200')}`,
        },
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.drag-none': {
          '-webkit-user-drag': 'none',
          '-khtml-user-drag': 'none',
          '-moz-user-drag': 'none',
          '-o-user-drag': 'none',
          'user-drag': 'none'
        },
        '.glass-effect': {
          'backdrop-filter': 'blur(10px)',
          'background': 'rgba(255, 255, 255, 0.1)',
          'border': '1px solid rgba(255, 255, 255, 0.2)'
        }
      };

      const newComponents = {
        '.btn-claude': {
          '@apply px-4 py-2 bg-claude-blue-600 text-white rounded-lg hover:bg-claude-blue-700 transition-colors duration-200 font-medium text-sm': {},
          '&:disabled': {
            '@apply bg-gray-400 cursor-not-allowed': {}
          }
        },
        '.panel-glass': {
          '@apply bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg': {}
        },
        '.editor-panel': {
          '@apply bg-gray-900 border border-gray-700 rounded-lg overflow-hidden': {}
        },
        '.agent-indicator': {
          '@apply flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200': {}
        },
        '.file-tree-node': {
          '@apply flex items-center gap-1 py-1 px-2 hover:bg-gray-100 cursor-pointer rounded text-sm select-none': {}
        },
        '.terminal-line': {
          '@apply font-mono text-sm leading-relaxed py-0.5': {}
        },
        '.workflow-node': {
          '@apply bg-white rounded-lg shadow-lg border-2 border-transparent hover:border-blue-300 transition-all duration-200 cursor-move': {}
        }
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    }
  ],
  
  // Safelist important classes that might be generated dynamically
  safelist: [
    'bg-agent-frontend',
    'bg-agent-backend', 
    'bg-agent-database',
    'bg-agent-testing',
    'bg-agent-deployment',
    'bg-agent-security',
    'text-agent-frontend',
    'text-agent-backend',
    'text-agent-database', 
    'text-agent-testing',
    'text-agent-deployment',
    'text-agent-security',
    'border-agent-frontend',
    'border-agent-backend',
    'border-agent-database',
    'border-agent-testing', 
    'border-agent-deployment',
    'border-agent-security'
  ]
};