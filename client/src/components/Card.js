import React from 'react';

export function Card({ children, className = '' }) {
  return <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-xl font-semibold text-gray-800 ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
