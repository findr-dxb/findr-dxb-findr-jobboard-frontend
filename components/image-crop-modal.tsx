"use client"

import { useState, useCallback, useRef } from "react"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCcw, Upload, Loader2 } from "lucide-react"

interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropModalProps {
  open: boolean
  onClose: () => void
  onCropComplete: (croppedBlob: Blob) => void
  uploading?: boolean
}

async function getCroppedImage(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener("load", () => resolve(img))
    img.addEventListener("error", reject)
    img.src = imageSrc
  })

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Canvas toBlob failed"))
    }, "image/jpeg", 0.92)
  })
}

export function ImageCropModal({ open, onClose, onCropComplete, uploading = false }: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropChange = (crop: { x: number; y: number }) => setCrop(crop)
  const onZoomChange = (zoom: number) => setZoom(zoom)

  const onCropCompleteHandler = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    const blob = await getCroppedImage(imageSrc, croppedAreaPixels)
    onCropComplete(blob)
  }

  const handleReset = () => {
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-5 pb-2">
            <DialogTitle className="text-lg font-semibold">
              {imageSrc ? "Crop your photo" : "Choose a photo"}
            </DialogTitle>
          </DialogHeader>

          {!imageSrc ? (
            /* Step 1 — pick a file */
            <div className="flex flex-col items-center justify-center px-6 pb-8 pt-4 gap-4">
              <div
                className="w-48 h-48 rounded-full border-4 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center px-4">Click to select a photo</p>
              </div>
              <p className="text-xs text-gray-400">JPG, PNG or WEBP · Max 5 MB</p>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button className="flex-1 gradient-bg text-white" onClick={() => fileInputRef.current?.click()}>
                  Browse
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2 — crop */
            <div className="flex flex-col">
              {/* Crop area — fixed square container */}
              <div className="relative w-full" style={{ height: 320, background: "#111" }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onCropComplete={onCropCompleteHandler}
                />
              </div>

              {/* Controls */}
              <div className="px-6 py-4 space-y-4 bg-white">
                {/* Zoom slider */}
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-4 h-4 text-gray-400 shrink-0" />
                  <Slider
                    min={1}
                    max={3}
                    step={0.05}
                    value={[zoom]}
                    onValueChange={([v]) => setZoom(v)}
                    className="flex-1"
                  />
                  <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Change photo
                  </Button>
                  <Button
                    className="flex-1 gradient-bg text-white"
                    onClick={handleConfirm}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      "Save photo"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
