import { API_BASED_URL } from '../config.js';
import { useState, useEffect } from 'react'

export default function ManagePublication() {
  const [publications, setPublications] = useState([])
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchPublications()
  }, [])

  const fetchPublications = async () => {
    const response = await fetch('/api/publications')
    const data = await response.json()
    setPublications(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await updatePublication()
    } else {
      await addPublication()
    }
    setTitle('')
    setLink('')
    setEditingId(null)
  }

  const addPublication = async () => {
    const response = await fetch('/api/publications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, link })
    })
    if (response.ok) {
      fetchPublications()
    } else {
      alert('Failed to add publication')
    }
  }

  const updatePublication = async () => {
    const response = await fetch(`/api/publications/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, link })
    })
    if (response.ok) {
      fetchPublications()
    } else {
      alert('Failed to update publication')
    }
  }

  const deletePublication = async (id) => {
    const response = await fetch(`/api/publications/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      fetchPublications()
    } else {
      alert('Failed to delete publication')
    }
  }

  const startEditing = (publication) => {
    setEditingId(publication.id)
    setTitle(publication.title)
    setLink(publication.link)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Publications</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link</label>
          <input
            type="text"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {editingId ? 'Update Publication' : 'Add Publication'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b text-left">Link</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {publications.map((pub) => (
              <tr key={pub.id}>
                <td className="py-2 px-4 border-b">{pub.title}</td>
                <td className="py-2 px-4 border-b">{pub.link}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => startEditing(pub)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePublication(pub.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

