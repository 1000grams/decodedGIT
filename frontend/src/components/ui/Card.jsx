import React from 'react';

export function Card({ children, className = '' }) {
  return <div className={`bg-[#222] rounded-lg shadow-md ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`p-4 border-t border-gray-700 ${className}`}>{children}</div>;
}
