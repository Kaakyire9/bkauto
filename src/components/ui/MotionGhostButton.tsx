"use client"
import { motion } from 'framer-motion'
import GhostButton from './GhostButton'

// Motion-enabled wrapper for GhostButton
// Use `motion.create()` per framer-motion deprecation notice
const MotionGhostButton = motion.create(GhostButton as any)

export default MotionGhostButton
