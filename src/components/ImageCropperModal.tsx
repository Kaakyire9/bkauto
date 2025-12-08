"use client"
import React, { useState, useRef, useEffect } from 'react'

interface ImageCropperModalProps {
  imageFile: File
  onCrop: (croppedBlob: Blob) => void
  onCancel: () => void
}

export default function ImageCropperModal({ imageFile, onCrop, onCancel }: ImageCropperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isProcessing, setIsProcessing] = useState(false)

  // Load image from file
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        // Auto-fit the image in the crop circle
        if (canvasRef.current) {
          const canvas = canvasRef.current
          const cropSize = Math.min(canvas.width, canvas.height) * 0.7
          const imgSize = Math.max(img.width, img.height)
          const fitScale = cropSize / imgSize
          setScale(fitScale * 1.2) // Slightly larger than crop area
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  // Draw on canvas whenever image or transforms change
  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasSize = canvas.width
    const centerX = canvasSize / 2
    const centerY = canvasSize / 2
    const radius = canvasSize * 0.35

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Fill background
    ctx.fillStyle = '#010812'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // Calculate image dimensions with scale
    const drawWidth = image.width * scale
    const drawHeight = image.height * scale

    // Calculate position with offset
    const drawX = centerX - drawWidth / 2 + offsetX
    const drawY = centerY - drawHeight / 2 + offsetY

    // Draw the full image first
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)

    // Draw dark overlay everywhere
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // Cut out circle to reveal image underneath
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    // Draw circle border on top
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = '#D4AF37'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
  }, [image, scale, offsetX, offsetY])

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

  const handleCrop = async () => {
    if (!image || !canvasRef.current) return

    setIsProcessing(true)
    try {
      // Create a new canvas for the final cropped circular image
      const outputCanvas = document.createElement('canvas')
      const outputSize = 400
      outputCanvas.width = outputSize
      outputCanvas.height = outputSize
      const outputCtx = outputCanvas.getContext('2d')
      if (!outputCtx) return

      const canvas = canvasRef.current
      const canvasSize = canvas.width
      const centerX = canvasSize / 2
      const centerY = canvasSize / 2
      const radius = canvasSize * 0.35

      // Calculate what portion of the image is visible in the circle
      const drawWidth = image.width * scale
      const drawHeight = image.height * scale
      const drawX = centerX - drawWidth / 2 + offsetX
      const drawY = centerY - drawHeight / 2 + offsetY

      // Calculate source rectangle (what's inside the circle)
      const sourceX = (centerX - radius - drawX) / scale
      const sourceY = (centerY - radius - drawY) / scale
      const sourceSize = (radius * 2) / scale

      // Create circular clip on output canvas
      outputCtx.beginPath()
      outputCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
      outputCtx.clip()

      // Draw the cropped portion
      outputCtx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        outputSize,
        outputSize
      )

      // Convert to blob and call onCrop
      outputCanvas.toBlob((blob) => {
        if (blob) {
          onCrop(blob)
        }
        setIsProcessing(false)
      }, 'image/jpeg', 0.95)
    } catch (error) {
      console.error('Crop error:', error)
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#041123] border border-[#D4AF37]/30 rounded-3xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Crop Your Profile Picture</h2>

        {/* Canvas for preview */}
        <div className="mb-6 flex justify-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="border border-[#D4AF37]/20 rounded-2xl cursor-move"
            style={{ maxWidth: '100%', height: 'auto' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#D4AF37] mb-2">
              Zoom: {Math.round(scale * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#041123] rounded-lg appearance-none cursor-pointer accent-[#D4AF37] border border-[#D4AF37]/20"
            />
            <p className="text-xs text-[#C6CDD1]/60 mt-2">Drag image to reposition • Use slider to zoom</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 rounded-xl bg-[#041123]/50 border border-[#C6CDD1]/20 text-[#C6CDD1] hover:bg-[#041123]/80 transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123] hover:from-[#E5C158] hover:to-[#FFED99] transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Save & Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
