import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import {API_BASED_URL} from '../config.js'; 

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${API_BASED_URL}uploads/${imagePath}`;
};

export default function ManageHero() {
  const [state, setState] = useState({ message: '', error: '' })
  const [activeTab, setActiveTab] = useState('slider')
  const [sliderImages, setSliderImages] = useState([])
  const [thought, setThought] = useState('')
  const [newsFeed, setNewsFeed] = useState([])
  const [imageValidation, setImageValidation] = useState({ isValid: true, message: '' })
  const [imagePreview, setImagePreview] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const formRef = React.useRef(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const [sliderResponse, thoughtResponse, newsResponse] = await Promise.all([
        fetch('/api/getsliderimages'),
        fetch('/api/getthought'),
        fetch('/api/getnews')
      ])

      if (!sliderResponse.ok || !thoughtResponse.ok || !newsResponse.ok) {
        throw new Error('Failed to fetch content')
      }

      const sliderData = await sliderResponse.json()
      const thoughtData = await thoughtResponse.json()
      const newsData = await newsResponse.json()

      setSliderImages(sliderData)
      setThought(thoughtData[0]?.thought_text || '')
      setNewsFeed(newsData)
    } catch (error) {
      setState({ message: '', error: 'Failed to fetch content' })
    }
  }

  const validateImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const width = img.width
        const height = img.height
        const aspectRatio = width / height
        const targetAspectRatio = 16 / 9 // 16:9 aspect ratio
        
        // Check if aspect ratio is close to 16:9 (within 10% tolerance)
        const tolerance = 0.1
        const isAspectRatioValid = Math.abs(aspectRatio - targetAspectRatio) <= tolerance
        
        // Check minimum dimensions
        const isSizeValid = width >= 1200 && height >= 675
        
        if (!isAspectRatioValid) {
          resolve({
            isValid: false,
            message: `Image aspect ratio should be close to 16:9. Current ratio: ${width}:${height}`
          })
        } else if (!isSizeValid) {
          resolve({
            isValid: false,
            message: `Image dimensions should be at least 1200×675 pixels. Current: ${width}×${height}`
          })
        } else {
          resolve({ 
            isValid: true, 
            message: `Image dimensions: ${width}×${height} - Perfect! ✓` 
          })
        }
      }
      img.onerror = () => {
        resolve({ isValid: false, message: 'Failed to load image for validation' })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      setIsValidating(true)
      const validation = await validateImage(file)
      setImageValidation(validation)
      setIsValidating(false)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
      setImageValidation({ isValid: true, message: '' })
      setIsValidating(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
    const action = formData.get('action')

    // Check image validation before submitting
    if (action === 'updateSlider') {
      const imageFile = formData.get('image')
      if (imageFile && imageFile.size > 0) {
        const validation = await validateImage(imageFile)
        if (!validation.isValid) {
          setState({ message: '', error: validation.message })
          return
        }
      }
    }

    try {
      const response = await fetch('/api/homecontent', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      const result = await response.json()
      setState({ message: result.message, error: '' })
      setImageValidation({ isValid: true, message: '' })
      setImagePreview(null)

      // Reset form
      if (formRef.current) {
        formRef.current.reset()
      }

      // Refresh the content after successful operation
      fetchContent()
    } catch (error) {
      setState({ message: '', error: error.message })
    }
  }

  const handleDelete = async (id, type) => {
    try {
      const response = await fetch('/api/homecontent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'delete', type, id }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}`)
      }

      const result = await response.json()
      setState({ message: result.message, error: '' })

      // Refresh the content after successful deletion
      fetchContent()
    } catch (error) {
      setState({ message: '', error: error.message })
    }
  }

  return (
    <motion.div
      className="container mx-auto p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Manage Hero Content</h1>

      {state.message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <CheckCircle2 className="inline-block h-4 w-4 mr-2" />
          <span className="font-bold">Success:</span> {state.message}
        </div>
      )}

      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <AlertCircle className="inline-block h-4 w-4 mr-2" />
          <span className="font-bold">Error:</span> {state.error}
        </div>
      )}

      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'slider' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('slider')}
          >
            Slider Images
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'thought' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('thought')}
          >
            Thought of the Day
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'news' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            News Feed
          </button>
        </div>
      </div>

      {activeTab === 'slider' && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-bold mb-2">Update Slider Image</h2>
          <p className="mb-4 text-gray-600">Add or update a slider image</p>
          
          {/* Image Dimension Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">📏 Recommended Image Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-700">Optimal Size:</p>
                <p className="text-blue-600">1920 × 1080 pixels (16:9 aspect ratio)</p>
                <p className="text-blue-600">Minimum: 1200 × 675 pixels</p>
              </div>
              <div>
                <p className="font-medium text-blue-700">File Format:</p>
                <p className="text-blue-600">JPG, PNG, WebP</p>
                <p className="text-blue-600">Max size: 5MB</p>
              </div>
            </div>
            <p className="text-blue-600 mt-2 text-xs">
              💡 <strong>Tip:</strong> Images will be automatically cropped to maintain consistent 16:9 aspect ratio for uniform slider appearance.
            </p>
          </div>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <input type="hidden" name="action" value="updateSlider" />
            <div>
              <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">Image</label>
              <input 
                id="image" 
                name="image" 
                type="file" 
                accept="image/*" 
                required 
                onChange={handleImageChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  !imageValidation.isValid ? 'border-red-500' : ''
                }`}
              />
              {isValidating && (
                <p className="text-blue-500 text-sm mt-1">⏳ Validating image dimensions...</p>
              )}
              {!isValidating && !imageValidation.isValid && (
                <p className="text-red-500 text-sm mt-1">{imageValidation.message}</p>
              )}
              {!isValidating && imageValidation.isValid && imageValidation.message && (
                <p className="text-green-500 text-sm mt-1">✓ {imageValidation.message}</p>
              )}
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative w-full h-48 overflow-hidden rounded border">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This is how your image will appear in the slider
                  </p>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
              <input id="title" name="title" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label htmlFor="subtitle" className="block text-gray-700 text-sm font-bold mb-2">Subtitle</label>
              <input id="subtitle" name="subtitle" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <button 
              type="submit" 
              disabled={!imageValidation.isValid || isValidating}
              className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                imageValidation.isValid && !isValidating
                  ? 'bg-blue-500 hover:bg-blue-700 text-white' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isValidating ? 'Validating...' : 'Update Slider Image'}
            </button>
          </form>

          <h2 className="text-xl font-bold mb-2 mt-8">Existing Slider Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sliderImages.map((image) => (
              <div key={image.id} className="border rounded p-4">
                <div className="relative w-full h-48 mb-2 overflow-hidden rounded">
                  <img 
                    src={getImageUrl(image.imagepath)} 
                    alt={image.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-bold">{image.title}</h3>
                <p className="text-sm text-gray-600">{image.subtitle}</p>
                <button
                  onClick={() => handleDelete(image.id, 'sliderImages')}
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
                >
                  <Trash2 className="inline-block h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'thought' && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-bold mb-2">Update Thought of the Day</h2>
          <p className="mb-4 text-gray-600">Change the current thought of the day</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="action" value="updateThought" />
            <div>
              <label htmlFor="thought" className="block text-gray-700 text-sm font-bold mb-2">Thought</label>
              <textarea 
                id="thought" 
                name="thought" 
                required 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                defaultValue={thought}
              ></textarea>
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Update Thought</button>
          </form>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-bold mb-2">Add News Item</h2>
          <p className="mb-4 text-gray-600">Add a new item to the news feed</p>
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <input type="hidden" name="action" value="addNews" />
            <div>
              <label htmlFor="newsTitle" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
              <input id="newsTitle" name="title" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label htmlFor="summary" className="block text-gray-700 text-sm font-bold mb-2">Summary</label>
              <textarea id="summary" name="summary" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"></textarea>
            </div>
            <div>
              <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">Image</label>
              <input 
                id="image" 
                name="image" 
                type="file" 
                accept="image/*" 
                required 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <div>
              <label htmlFor="link" className="block text-gray-700 text-sm font-bold mb-2">Link (Optional)</label>
              <input 
                id="link" 
                name="link" 
                type="url" 
                placeholder="https://iitrpr.ac.in" 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add News Item</button>
          </form>

          <h2 className="text-xl font-bold mb-2 mt-8">Existing News Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsFeed.map((item) => (
              <div key={item.id} className="border rounded p-4">
                <img src={getImageUrl(item.imagepath)} alt={item.news_title} className="w-full h-40 object-cover mb-2" />
                <h3 className="font-bold">{item.news_title}</h3>
                <p className="text-sm text-gray-600">{item.summary}</p>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">Read More</a>
                <button
                  onClick={() => handleDelete(item.id, 'NewsFeed')}
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
                >
                  <Trash2 className="inline-block h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

