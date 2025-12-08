"use client"
import React, { useState, useRef, useEffect } from 'react'

interface ImageCropperModalProps {
  imageFile: File
  onCrop: (croppedBlob: Blob) => void
  onCancel: () => void
}

export default function ImageCropperModal({ imageFile, onCrop, onCancel }: ImageCropperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Load image
    const reader = new FileReader()
    reader.onload = (e) => {
      if (imageRef.current) {
        imageRef.current.src = e.target?.result as string
      }
    }
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  useEffect(() => {
    if (!imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = imageRef.current
    const size = Math.min(canvas.width, canvas.height)
    const cropSize = size * 0.8

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fill with dark background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save context state
    ctx.save()

    // Draw circle crop area
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = cropSize / 2

    // Clear circle area (make it transparent)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.clip()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image
    if (image.complete) {
      const imgWidth = image.naturalWidth
      const imgHeight = image.naturalHeight
      const scaledWidth = imgWidth * scale
      const scaledHeight = imgHeight * scale

      // Center image with offset
      const drawX = centerX - scaledWidth / 2 + offsetX
      const drawY = centerY - scaledHeight / 2 + offsetY

      ctx.drawImage(image, drawX, drawY, scaledWidth, scaledHeight)
    }

    ctx.restore()

    // Draw circle border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
  }, [scale, offsetX, offsetY])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffsetX(e.clientX - dragStart.x)
    setOffsetY(e.clientY - dragStart.y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCrop = () => {
    if (!canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onCrop(blob)
      }
    }, 'image/jpeg', 0.95)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#041123] border border-[#D4AF37]/30 rounded-3xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Crop Your Profile Picture</h2>

        {/* Canvas for preview */}
        <div className="mb-6">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full border border-[#D4AF37]/20 rounded-2xl cursor-move bg-[#010812]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Hidden image for reference */}
        <img ref={imageRef} className="hidden" alt="crop" />

        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#D4AF37] mb-2">
              Zoom: {Math.round(scale * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#041123] rounded-lg appearance-none cursor-pointer accent-[#D4AF37] border border-[#D4AF37]/20"
            />
            <p className="text-xs text-[#C6CDD1]/60 mt-2">Drag to move • Scroll to zoom</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl bg-[#041123]/50 border border-[#C6CDD1]/20 text-[#C6CDD1] hover:bg-[#041123]/80 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123] hover:from-[#E5C158] hover:to-[#FFED99] transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              Save & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
