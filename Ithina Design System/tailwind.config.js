/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ithina: {
                    // Core background and structural colors
                    bg: '#0A0E17',
                    sidebar: '#0F1523',
                    panel: '#131C31',
                    border: '#1E293B',

                    // Primary Brand (Purple)
                    purple: {
                        DEFAULT: '#a855f7',
                        hover: '#9333ea',
                        10: 'rgba(168,85,247,0.10)',
                        20: 'rgba(168,85,247,0.20)',
                        35: 'rgba(168,85,247,0.35)',
                    },

                    // Semantic Colors (Flat/Solid and 10% Opacities for Badges)
                    emerald: {
                        DEFAULT: '#34d399',
                        10: 'rgba(52,211,153,0.10)',
                    },
                    amber: {
                        DEFAULT: '#fbbf24',
                        10: 'rgba(251,191,36,0.10)',
                    },
                    rose: {
                        DEFAULT: '#fb7185',
                        10: 'rgba(251,113,133,0.10)',
                    }
                }
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            boxShadow: {
                'modal': '0 10px 40px rgba(0, 0, 0, 0.3)',
            },
            borderRadius: {
                'md': '10px',
                'lg': '14px',
                'xl': '18px',
            },
            keyframes: {
                pulseDot: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                typingBounce: {
                    '0%, 80%, 100%': { transform: 'scale(0.4)', opacity: '0.3' },
                    '40%': { transform: 'scale(1)', opacity: '1' },
                },
                scanDown: {
                    '0%': { top: '0%' },
                    '100%': { top: '100%' },
                }
            },
            animation: {
                'pulse-dot': 'pulseDot 2s ease-in-out infinite',
                'typing': 'typingBounce 1.2s ease-in-out infinite',
                'scanline': 'scanDown 2.4s linear infinite',
            }
        },
    },
    plugins: [],
}