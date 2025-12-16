"use client"
import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import MotionPrimaryButton from './ui/MotionPrimaryButton'
import MotionGhostButton from './ui/MotionGhostButton'

type OrderStep = 'vehicle' | 'details' | 'preferences' | 'review'

interface OrderData {
  vehicleType: string
  budget: string
  make: string
  model: string
  year: string
  color: string
  condition: string
  priority: string
  timeline: string
  notes: string
  firstName: string
  lastName: string
  phone: string
}

const INITIAL_DATA: OrderData = {
  vehicleType: '',
  budget: '',
  make: '',
  model: '',
  year: '',
  color: '',
  condition: '',
  priority: '',
  timeline: '',
  notes: '',
  firstName: '',
  lastName: '',
  phone: ''
}

export default function OrderCarForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OrderStep>('vehicle')
  const [data, setData] = useState<OrderData>(INITIAL_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const steps: OrderStep[] = ['vehicle', 'details', 'preferences', 'review']
  const stepTitles = {
    vehicle: 'Vehicle Type',
    details: 'Vehicle Details',
    preferences: 'Your Preferences',
    review: 'Review Order'
  }

  const stepDescriptions = {
    vehicle: 'What type of vehicle are you looking for?',
    details: 'Tell us specific details about the car',
    preferences: 'Customize your sourcing preferences',
    review: 'Review and place your order'
  }

  const currentStepIndex = steps.indexOf(currentStep)
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100

  const isStepComplete = useMemo(() => {
    switch (currentStep) {
      case 'vehicle':
        return data.vehicleType && data.budget
      case 'details':
        return data.make && data.model && data.year && data.color
      case 'preferences':
        return data.condition && data.priority && data.timeline
      case 'review':
        return data.firstName && data.lastName && data.phone
      default:
        return false
    }
  }, [currentStep, data])

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1])
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!isStepComplete) {
      setError('Please complete all required fields')
      return
    }

    setLoading(true)
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('You must be signed in to place an order')
        router.push('/signin')
        return
      }

      // Save order to Supabase
      const { error: insertError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: session.user.id,
            vehicle_type: data.vehicleType,
            make: data.make,
            model: data.model,
            year: parseInt(data.year),
            color: data.color,
            condition: data.condition,
            budget: data.budget,
            priority: data.priority,
            timeline: data.timeline,
            notes: data.notes,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            status: 'pending'
          }
        ])

      if (insertError) {
        setError(insertError.message || 'Failed to save order to database')
        console.error('Order insert error:', insertError)
        return
      }
      
        // Create notification for the user: order pending
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: session.user.id,
              title: 'Order Received',
              body: 'Your order is pending. We have started processing it.',
              type: 'info'
            })
        } catch (e) {
          // Non-blocking if notification insert fails
          console.warn('Notification insert failed', e)
        }

      setMessage('Order placed successfully! Redirecting to your dashboard...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (e: any) {
      setError(e?.message || 'Failed to place order')
      console.error('Order submission error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl bg-[rgba(4,17,35,0.7)] backdrop-blur-xl border border-[#D4AF37]/20 rounded-3xl p-12 shadow-2xl"
      style={{
        boxShadow: '0 25px 60px rgba(2,6,23,0.8), inset 0 1px 0 rgba(212,175,55,0.05), 0 0 40px rgba(212,175,55,0.08)'
      }}
    >
      {/* Header */}
      <div className="space-y-4 mb-10 border-b border-[#D4AF37]/10 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#D4AF37] to-transparent rounded-full"></div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight">Order Your Vehicle</h1>
        </div>
        <p className="text-sm text-[#C6CDD1]/60 ml-4">{stepDescriptions[currentStep]}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">Progress</span>
          <span className="text-xs text-[#C6CDD1]/60">{currentStepIndex + 1} of {steps.length}</span>
        </div>
        <div className="relative h-2 bg-[#041123]/40 rounded-full overflow-hidden border border-[#D4AF37]/10">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="mb-10 flex justify-between">
        {steps.map((step, index) => (
          <button
            key={step}
            onClick={() => index <= currentStepIndex && setCurrentStep(step)}
            disabled={index > currentStepIndex}
            className="flex flex-col items-center gap-2 flex-1 group"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                index < currentStepIndex
                  ? 'bg-[#10B981] text-white'
                  : index === currentStepIndex
                  ? 'bg-[#D4AF37] text-[#041123]'
                  : 'bg-[#041123]/40 text-[#C6CDD1]/60 border border-[#D4AF37]/10'
              }`}
            >
              {index < currentStepIndex ? '✓' : index + 1}
            </div>
            <span
              className={`text-xs font-medium text-center transition-colors ${
                index <= currentStepIndex ? 'text-[#D4AF37]' : 'text-[#C6CDD1]/50'
              }`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </span>
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 text-sm text-[#FFC7C7] bg-[#3a1b1b]/50 border border-[#E11D48]/30 p-4 rounded-lg">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-6 text-sm text-[#DFF7E6] bg-[#0b271a]/50 border border-[#10B981]/30 p-4 rounded-lg">
          {message}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Vehicle Type */}
        {currentStep === 'vehicle' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Vehicle Type</span>
                <select
                  name="vehicleType"
                  value={data.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white"
                >
                  <option value="">Select a vehicle type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="coupe">Coupe</option>
                  <option value="van">Van</option>
                </select>
              </label>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Budget Range</span>
                <select
                  name="budget"
                  value={data.budget}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white"
                >
                  <option value="">Select your budget</option>
                  <option value="10k-25k">$10,000 - $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k+">$100,000+</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: Vehicle Details */}
        {currentStep === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0">
            <label className="block">
              <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Make</span>
              <input
                type="text"
                name="make"
                value={data.make}
                onChange={handleInputChange}
                placeholder="e.g., BMW, Mercedes"
                className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Model</span>
              <input
                type="text"
                name="model"
                value={data.model}
                onChange={handleInputChange}
                placeholder="e.g., 3 Series, E-Class"
                className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Year</span>
              <input
                type="text"
                name="year"
                value={data.year}
                onChange={handleInputChange}
                placeholder="e.g., 2023"
                className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Preferred Color</span>
              <input
                type="text"
                name="color"
                value={data.color}
                onChange={handleInputChange}
                placeholder="e.g., Black, Silver"
                className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
              />
            </label>
          </div>
        )}

        {/* STEP 3: Preferences */}
        {currentStep === 'preferences' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Vehicle Condition</span>
                <select
                  name="condition"
                  value={data.condition}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white"
                >
                  <option value="">Select condition preference</option>
                  <option value="new">New</option>
                  <option value="certified">Certified Pre-Owned</option>
                  <option value="excellent">Excellent (Low Mileage)</option>
                  <option value="good">Good (Average Mileage)</option>
                </select>
              </label>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Priority Level</span>
                <select
                  name="priority"
                  value={data.priority}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white"
                >
                  <option value="">Select priority</option>
                  <option value="urgent">Urgent (ASAP)</option>
                  <option value="high">High (Within 2 weeks)</option>
                  <option value="medium">Medium (Within 1 month)</option>
                  <option value="low">Low (Flexible timeline)</option>
                </select>
              </label>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Timeline</span>
                <select
                  name="timeline"
                  value={data.timeline}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white"
                >
                  <option value="">Select timeline</option>
                  <option value="1week">Within 1 week</option>
                  <option value="2weeks">Within 2 weeks</option>
                  <option value="1month">Within 1 month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Additional Notes</span>
              <textarea
                name="notes"
                value={data.notes}
                onChange={handleInputChange}
                placeholder="Any special requests or additional details..."
                rows={4}
                className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40 resize-none"
              />
            </label>
          </div>
        )}

        {/* STEP 4: Review */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-[#D4AF37] mb-3 block">First Name</span>
                <input
                  type="text"
                  name="firstName"
                  value={data.firstName}
                  onChange={handleInputChange}
                  placeholder="Your first name"
                  className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Last Name</span>
                <input
                  type="text"
                  name="lastName"
                  value={data.lastName}
                  onChange={handleInputChange}
                  placeholder="Your last name"
                  className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-[#D4AF37] mb-3 block">Phone Number</span>
              <input
                type="tel"
                name="phone"
                value={data.phone}
                onChange={handleInputChange}
                placeholder="(123) 456-7890"
                className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
              />
            </label>

            {/* Order Summary */}
            <div className="bg-[#041123]/40 border border-[#D4AF37]/15 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-[#D4AF37] mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm text-[#C6CDD1]/80">
                <div className="flex justify-between">
                  <span>Vehicle Type:</span>
                  <span className="text-[#D4AF37] font-medium">{data.vehicleType || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Make & Model:</span>
                  <span className="text-[#D4AF37] font-medium">{data.make && data.model ? `${data.make} ${data.model}` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span className="text-[#D4AF37] font-medium">{data.budget || 'Not selected'}</span>
                </div>
                <div className="flex justify-between border-t border-[#D4AF37]/10 pt-2">
                  <span>Priority:</span>
                  <span className="text-[#D4AF37] font-medium">{data.priority || 'Not selected'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between pt-8 border-t border-[#D4AF37]/10">
          <MotionGhostButton
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-6 py-3 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </MotionGhostButton>

          {currentStepIndex < steps.length - 1 ? (
            <MotionPrimaryButton
              type="button"
              onClick={handleNext}
              disabled={!isStepComplete}
              className="px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </MotionPrimaryButton>
          ) : (
            <MotionPrimaryButton
              type="submit"
              disabled={!isStepComplete || loading}
              className="px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order…' : 'Place Order'}
            </MotionPrimaryButton>
          )}
        </div>
      </form>

      {/* Trust badge */}
      <div className="mt-8 pt-6 border-t border-[#D4AF37]/10 flex items-center justify-center gap-2 text-xs text-[#C6CDD1]/60">
        <svg className="w-4 h-4 text-[#10B981]" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0l-5.25 5.25a.75.75 0 101.06 1.06L11 3.87v16.658a.75.75 0 001.5 0V3.87l4.97 4.97a.75.75 0 101.06-1.06l-5.25-5.25z" clipRule="evenodd" />
        </svg>
        Your information is secure and encrypted
      </div>
    </div>
  )
}
