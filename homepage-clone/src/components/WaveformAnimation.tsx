import React from 'react'
import { motion } from 'framer-motion'

interface WaveformAnimationProps {
  isActive: boolean
  barCount?: number
  color?: string
  height?: number
}

/**
 * WaveformAnimation Component
 *
 * Displays an animated waveform visualization with vertical bars.
 * Perfect for voice assistant speaking indicators.
 *
 * @param isActive - Whether the animation should be playing
 * @param barCount - Number of bars to display (default: 10)
 * @param color - Primary color for the bars (default: #8b5cf6 violet)
 * @param height - Maximum height of bars in pixels (default: 80)
 */
export const WaveformAnimation: React.FC<WaveformAnimationProps> = ({
  isActive,
  barCount = 10,
  color = '#8b5cf6',
  height = 80,
}) => {
  // Generate array of bars
  const bars = Array.from({ length: barCount }, (_, i) => i)

  // Calculate darker shade for gradient (90% brightness)
  const darkerColor = adjustColorBrightness(color, 0.9)

  return (
    <div className="flex items-center justify-center gap-1 h-20">
      {bars.map((index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full"
          style={{
            background: `linear-gradient(to top, ${color}, ${darkerColor})`,
            boxShadow: isActive ? `0 0 8px ${color}40` : 'none',
          }}
          animate={
            isActive
              ? {
                  height: [20, height, 20],
                }
              : {
                  height: 20,
                }
          }
          transition={{
            duration: 1.2,
            repeat: isActive ? Infinity : 0,
            ease: 'easeInOut',
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Helper function to adjust color brightness
 * @param color - Hex color string (e.g., '#8b5cf6')
 * @param factor - Brightness factor (0.9 = 90% brightness)
 * @returns Adjusted hex color
 */
function adjustColorBrightness(color: string, factor: number): string {
  // Remove '#' if present
  const hex = color.replace('#', '')

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Adjust brightness
  const adjustedR = Math.round(r * factor)
  const adjustedG = Math.round(g * factor)
  const adjustedB = Math.round(b * factor)

  // Convert back to hex
  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(adjustedR)}${toHex(adjustedG)}${toHex(adjustedB)}`
}
