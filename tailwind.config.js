/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F6F8FB',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#0F766E',
          hover: '#115E59',
          light: '#F0FDFA',
          border: '#CCFBF1',
        },
        'text-strong': '#102A43',
        'text-muted': '#667085',
        border: '#E4E7EC',
        success: {
          DEFAULT: '#15803D',
          light: '#F0FDF4',
          border: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#B45309',
          light: '#FFFBEB',
          border: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#B42318',
          light: '#FEF2F2',
          border: '#FEE2E2',
        },
        info: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
          border: '#DBEAFE',
        }
      },
      borderRadius: {
        'control': '12px',
        'panel': '16px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 42, 67, 0.05), 0 1px 2px 0 rgba(16, 42, 67, 0.03)',
        'elevated': '0 4px 6px -1px rgba(16, 42, 67, 0.08), 0 2px 4px -1px rgba(16, 42, 67, 0.04)',
      }
    },
  },
  plugins: [],
}
