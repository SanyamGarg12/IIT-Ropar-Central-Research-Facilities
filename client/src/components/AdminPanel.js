import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import axios from 'axios';

const AdminPanel = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [credentials, setCredentials] = useState({ id: '', password: '' });
    const [activeTab, setActiveTab] = useState('home');
    const [members, setMembers] = useState([]);
    const [newMember, setNewMember] = useState({ name: '', description: '', image: null });
    const [editMember, setEditMember] = useState(null);

    // Fetch members from the backend on login or load
    const fetchMembers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/members');
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    // Handle Login
    const handleLogin = () => {
        if (credentials.id === 'admin' && credentials.password === 'admin123') {
            setAuthenticated(true);
            fetchMembers(); // Fetch members after authentication
        } else {
            alert('Invalid ID or password');
        }
    };

    // Handle Add Member
    const handleAddMember = async () => {
        try {
            const formData = new FormData();
            formData.append('name', newMember.name);
            formData.append('description', newMember.description);
            formData.append('image', newMember.image); // Send the image file

            await axios.post('http://localhost:3001/insert-member', formData); // Ensure this matches the backend route
            setNewMember({ name: '', description: '', image: null }); // Reset new member state
            fetchMembers(); // Refresh members list
        } catch (error) {
            console.error('Error adding new member:', error);
        }
    };

    // Handle Edit Member
    const handleEditMember = async () => {
        try {
            const formData = new FormData();
            formData.append('name', editMember.name);
            formData.append('description', editMember.description);
            if (editMember.image) {
                formData.append('image', editMember.image); // Send the new image if uploaded
            }

            await axios.put(`http://localhost:3001/update-member/${editMember.id}`, formData); // Ensure this matches the backend route
            setEditMember(null); // Reset edit member state
            fetchMembers(); // Refresh members list
        } catch (error) {
            console.error('Error editing member:', error);
        }
    };

    // Handle Remove Member
    const handleRemoveMember = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/delete-member/${id}`);
            fetchMembers(); // Refresh members list
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    // Handle Image Upload
    const handleImageUpload = (e, setter) => {
        const file = e.target.files[0];
        setter(file);
    };

    // Render Content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <div className="editor-content">Edit Home Page Content Here</div>;
            case 'about':
                return <div className="editor-content">Edit About Page Content Here</div>;
            case 'people':
                return (
                    <div className="editor-content">
                        <h2>Manage Members</h2>
                        <div className="member-list">
                            {members.map((member) => (
                                <div key={member.id} className="member-item">
                                    <h3>{member.name}</h3>
                                    <p>{member.description}</p>
                                    {member.image && (
                                        <img
                                            src={`data:image/jpeg;base64,${Buffer.from(member.image).toString('base64')}`}
                                            alt={member.name}
                                            className="member-image"
                                        />
                                    )}
                                    <button onClick={() => handleRemoveMember(member.id)}>Remove</button>
                                    <button onClick={() => setEditMember(member)}>Edit</button>
                                </div>
                            ))}
                        </div>

                        <h3>Add New Member</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={newMember.description}
                            onChange={(e) => setNewMember({ ...newMember, description: e.target.value })}
                        />
                        <input type="file" onChange={(e) => handleImageUpload(e, (file) => setNewMember({ ...newMember, image: file }))} />
                        <button onClick={handleAddMember}>Add Member</button>

                        {editMember && (
                            <div>
                                <h3>Edit Member</h3>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={editMember.name}
                                    onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={editMember.description}
                                    onChange={(e) => setEditMember({ ...editMember, description: e.target.value })}
                                />
                                <input type="file" onChange={(e) => handleImageUpload(e, (file) => setEditMember({ ...editMember, image: file }))} />
                                <button onClick={handleEditMember}>Save Changes</button>
                                <button onClick={() => setEditMember(null)}>Cancel</button>
                            </div>
                        )}
                    </div>
                );
            default:
                return <div>Welcome to the Admin Panel</div>;
        }
    };

    // If not authenticated, show the login form
    if (!authenticated) {
        return (
            <div className="login-screen">
                <h1>Admin Panel Login</h1>
                <div className="login-form">
                    <input
                        type="text"
                        placeholder="Enter ID"
                        value={credentials.id}
                        onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    />
                    <button onClick={handleLogin}>Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <header className="admin-header">
                <h1>Admin Panel</h1>
                <button onClick={() => setAuthenticated(false)} className="logout-button">Logout</button>
            </header>
            <nav className="admin-tabs">
                <ul>
                    <li
                        className={activeTab === 'home' ? 'active' : ''}
                        onClick={() => setActiveTab('home')}
                    >
                        Home
                    </li>
                    <li
                        className={activeTab === 'about' ? 'active' : ''}
                        onClick={() => setActiveTab('about')}
                    >
                        About
                    </li>
                    <li
                        className={activeTab === 'people' ? 'active' : ''}
                        onClick={() => setActiveTab('people')}
                    >
                        People
                    </li>
                </ul>
            </nav>
            <div className="tab-content">{renderContent()}</div>
        </div>
    );
};

export default AdminPanel;
