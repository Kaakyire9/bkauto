"use client"
import { motion } from 'framer-motion'
import PrimaryButton from './PrimaryButton'

// Wrap the forwarded-ref PrimaryButton with framer-motion so it accepts motion props
// Use `motion.create()` per framer-motion deprecation notice
const MotionPrimaryButton = motion.create(PrimaryButton as any)

export default MotionPrimaryButton
