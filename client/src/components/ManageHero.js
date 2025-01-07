import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ManageHero() {
  const [state, setState] = useState({ message: '', error: '' })
  const [activeTab, setActiveTab] = useState('slider')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
    const action = formData.get('action')

    try {
      const response = await fetch('/api/hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      const result = await response.json()
      setState({ message: result.message, error: '' })
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="action" value="updateSlider" />
            <div>
              <label htmlFor="src" className="block text-gray-700 text-sm font-bold mb-2">Image URL</label>
              <input id="src" name="src" type="url" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
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
              <textarea id="thought" name="thought" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"></textarea>
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Update Thought</button>
          </form>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-bold mb-2">Add News Item</h2>
          <p className="mb-4 text-gray-600">Add a new item to the news feed</p>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">Image URL</label>
              <input id="image" name="image" type="url" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label htmlFor="link" className="block text-gray-700 text-sm font-bold mb-2">Link</label>
              <input id="link" name="link" type="url" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add News Item</button>
          </form>
        </div>
      )}
    </motion.div>
  )
}

