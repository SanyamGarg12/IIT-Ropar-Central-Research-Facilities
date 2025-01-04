import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { PrinterIcon as Printer3d, Info, Settings, User, Mail, Phone, ExternalLink } from 'lucide-react';

// Function to construct image URL dynamically
const getImageUrl = (imagePath) => {
  if (!imagePath) return null; // No image available
  return `http://localhost:5000/uploads/${imagePath}`; // URL for the server's uploads folder
};

export default function FacilityDetail() {
  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacilityDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/facility/${id}`);
        const data = await response.json();

        if (data) {
          setFacility(data);
        } else {
          alert('Facility not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching facility details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl font-semibold text-gray-600">No facility data available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{facility.name}</h1>
        <p className="text-lg text-gray-600">{facility.category_name}</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <img
          src={getImageUrl(facility.image_url)}
          alt={facility.name}
          className="w-full h-64 object-cover rounded-lg shadow-lg"
        />
        <Card>
          <CardHeader>
            <CardTitle>Key Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-2">
              <Printer3d className="text-blue-600" />
              <span className="font-semibold">Model:</span> {facility.model}
            </div>
            <div className="flex items-center gap-2">
              <Info className="text-blue-600" />
              <span className="font-semibold">Make Year:</span> {facility.make_year}
            </div>
            <div className="flex items-center gap-2">
              <Settings className="text-blue-600" />
              <span className="font-semibold">Specifications:</span> {facility.specifications}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{facility.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{facility.usage_details}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Faculty In-Charge</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex items-center gap-2">
              <User className="text-blue-600" />
              <span>{facility.faculty_in_charge}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-blue-600" />
              <span>{facility.faculty_email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-blue-600" />
              <span>{facility.faculty_contact}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operator Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex items-center gap-2">
              <User className="text-blue-600" />
              <span>{facility.operator_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-blue-600" />
              <span>{facility.operator_contact}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-blue-600" />
              <span>{facility.operator_email}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {facility.publications && facility.publications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Publications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {facility.publications.map((publication, index) => (
                <li key={index} className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-500" />
                  <a
                    href={publication.publication_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {publication.publication_title}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

