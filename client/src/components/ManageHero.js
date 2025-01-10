import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'

export default function ManageHero() {
  const [state, setState] = useState({ message: '', error: '' })
  const [activeTab, setActiveTab] = useState('slider')
  const [sliderImages, setSliderImages] = useState([])
  const [thought, setThought] = useState('')
  const [newsFeed, setNewsFeed] = useState([])

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
      console.log('Error fetching content:', error);
      setState({ message: '', error: 'Failed to fetch content' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
    const action = formData.get('action')

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

      // Refresh the content after successful operation
      fetchContent()
    } catch (error) {
      setState({ message: '', error: error.message })
    }
  }

  const handleDelete = async (id, type) => {
    console.log('Deleting', type, id)
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
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <input type="hidden" name="action" value="updateSlider" />
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
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
              <input id="title" name="title" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label htmlFor="subtitle" className="block text-gray-700 text-sm font-bold mb-2">Subtitle</label>
              <input id="subtitle" name="subtitle" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Update Slider Image</button>
          </form>

          <h2 className="text-xl font-bold mb-2 mt-8">Existing Slider Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sliderImages.map((image) => (
              <div key={image.id} className="border rounded p-4">
                <img src={image.imagepath} alt={image.title} className="w-full h-40 object-cover mb-2" />
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
              <label htmlFor="link" className="block text-gray-700 text-sm font-bold mb-2">Link</label>
              <input id="link" name="link" type="url" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add News Item</button>
          </form>

          <h2 className="text-xl font-bold mb-2 mt-8">Existing News Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsFeed.map((item) => (
              <div key={item.id} className="border rounded p-4">
                <img src={item.imagepath} alt={item.news_title} className="w-full h-40 object-cover mb-2" />
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

