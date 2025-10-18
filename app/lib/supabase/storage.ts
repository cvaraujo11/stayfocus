import { createSupabaseClient } from './client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/**
 * Resize an image file before upload to optimize storage and performance
 * @param file - The image file to resize
 * @param maxWidth - Maximum width in pixels (default: 1200)
 * @param quality - JPEG quality 0-1 (default: 0.85)
 * @returns Resized image file
 */
async function resizeImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw resized image
      ctx?.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to resize image'))
            return
          }
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(resizedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Validate file before upload
 * @param file - File to validate
 * @throws Error if validation fails
 */
function validateFile(file: File): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP')
  }
}

/**
 * Upload a photo to Supabase Storage
 * @param userId - User ID for folder organization
 * @param file - Image file to upload
 * @param bucket - Storage bucket name (default: 'user-photos')
 * @returns Public URL of uploaded file, or null if upload fails
 */
export async function uploadPhoto(
  userId: string,
  file: File,
  bucket: string = 'user-photos'
): Promise<string | null> {
  try {
    // Validate file
    validateFile(file)

    // Resize image
    const resizedFile = await resizeImage(file)

    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload to Supabase Storage
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, resizedFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error('Erro ao fazer upload da foto')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading photo:', error)
    if (error instanceof Error) {
      throw error
    }
    return null
  }
}

/**
 * Delete a photo from Supabase Storage
 * @param url - Public URL of the photo to delete
 * @param bucket - Storage bucket name (default: 'user-photos')
 * @returns true if deletion was successful, false otherwise
 */
export async function deletePhoto(
  url: string,
  bucket: string = 'user-photos'
): Promise<boolean> {
  try {
    // Extract file path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/user-photos/userId/filename.jpg
    const urlParts = url.split(`/${bucket}/`)
    if (urlParts.length < 2) {
      console.error('Invalid photo URL format')
      return false
    }

    const filePath = urlParts[1]

    // Delete from Supabase Storage
    const supabase = createSupabaseClient()
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting photo:', error)
    return false
  }
}

/**
 * Upload multiple photos at once
 * @param userId - User ID for folder organization
 * @param files - Array of image files to upload
 * @param bucket - Storage bucket name (default: 'user-photos')
 * @returns Array of public URLs for uploaded files
 */
export async function uploadMultiplePhotos(
  userId: string,
  files: File[],
  bucket: string = 'user-photos'
): Promise<(string | null)[]> {
  const uploadPromises = files.map((file) => uploadPhoto(userId, file, bucket))
  return Promise.all(uploadPromises)
}

/**
 * Delete multiple photos at once
 * @param urls - Array of public URLs to delete
 * @param bucket - Storage bucket name (default: 'user-photos')
 * @returns Array of boolean results for each deletion
 */
export async function deleteMultiplePhotos(
  urls: string[],
  bucket: string = 'user-photos'
): Promise<boolean[]> {
  const deletePromises = urls.map((url) => deletePhoto(url, bucket))
  return Promise.all(deletePromises)
}
