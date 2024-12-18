const express = require('express');
const router = express.Router();

// Temporary database structure
let committeeMembers = [
  {
    name: 'Dr. John Doe',
    position: 'Chairman',
    intro: 'Leading the department with excellence.',
    photo: '/assets/john_doe.jpg',
    profileLink: 'https://www.iitrpr.ac.in/john-doe',
  },
  {
    name: 'Dr. Jane Smith',
    position: 'Vice Chairman',
    intro: 'Ensuring smooth operations across labs.',
    photo: '/assets/jane_smith.jpg',
    profileLink: 'https://www.iitrpr.ac.in/jane-smith',
  },
  {
    name: 'Dr. Alice Brown',
    position: 'Member',
    intro: 'Researcher in AI and ML.',
    photo: '/assets/alice_brown.jpg',
    profileLink: 'https://www.iitrpr.ac.in/alice-brown',
  },
];

// GET request to fetch committee members
router.get('/api/members', (req, res) => {
  res.json(committeeMembers);
});

// POST request to update members (Admin Panel)
router.post('/api/members/update', (req, res) => {
  const { updatedMembers } = req.body;
  if (!updatedMembers) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  committeeMembers = updatedMembers;
  res.json({ message: 'Members updated successfully', committeeMembers });
});

module.exports = router;
