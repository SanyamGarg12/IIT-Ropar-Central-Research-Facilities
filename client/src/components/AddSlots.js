import React, { useState, useEffect } from 'react';
const AddSlots = () => {
//     const [facilities, setFacilities] = useState([]);
//     const [newSlot, setNewSlot] = useState('');
//     const userId = localStorage.getItem('userId');
//     const userToken = localStorage.getItem('userToken');
//     const userEmail = localStorage.getItem('userEmail');

//     useEffect(() => {
//         // Fetch existing facilities and their slots from the server
//         fetch('/api/facilities', {
//             headers: {
//                 'Authorization': `${userToken}`
//             }
//         })
//             .then(response => response.json())
//             .then(data => setFacilities(data))
//             .catch(error => console.error('Error fetching facilities:', error));
//     }, [userToken]);

//     const handleAddSlot = (facilityId) => {
//         if (newSlot.trim() === '') return;

//         const slot = { id: Date.now(), name: newSlot };

//         // Send the new slot to the server
//         fetch(`/api/facilities/${facilityId}/slots`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${userToken}`
//             },
//             body: JSON.stringify(slot)
//         })
//             .then(response => response.json())
//             .then(data => {
//                 setFacilities(facilities.map(facility => 
//                     facility.id === facilityId ? { ...facility, slots: [...facility.slots, data] } : facility
//                 ));
//             })
//             .catch(error => console.error('Error adding slot:', error));

//         setNewSlot('');
//     };

//     const handleDeleteSlot = (facilityId, slotId) => {
//         // Send the delete request to the server
//         fetch(`/api/facilities/${facilityId}/slots/${slotId}`, {
//             method: 'DELETE',
//             headers: {
//                 'Authorization': `Bearer ${userToken}`
//             }
//         })
//             .then(() => {
//                 setFacilities(facilities.map(facility => 
//                     facility.id === facilityId ? { ...facility, slots: facility.slots.filter(slot => slot.id !== slotId) } : facility
//                 ));
//             })
//             .catch(error => console.error('Error deleting slot:', error));
//     };

//     return (
//         <div>
//             <h1>Manage Slots</h1>
//             {facilities.map(facility => (
//                 <div key={facility.id}>
//                     <h2>{facility.name}</h2>
//                     <div>
//                         <input
//                             type="text"
//                             value={newSlot}
//                             onChange={(e) => setNewSlot(e.target.value)}
//                             placeholder="Enter new slot"
//                         />
//                         <button onClick={() => handleAddSlot(facility.id)}>Add Slot</button>
//                     </div>
//                     <ul>
//                         {facility.slots.map(slot => (
//                             <li key={slot.id}>
//                                 {slot.name}
//                                 <button onClick={() => handleDeleteSlot(facility.id, slot.id)}>Delete</button>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             ))}
//         </div>
//     );
};

export default AddSlots;

