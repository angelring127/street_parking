"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onGetCurrentLocation: () => void;
}

export default function SearchBar({
  onSearch,
  onGetCurrentLocation,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="주소 또는 지역명 검색..."
          className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          검색
        </button>
        <button
          type="button"
          onClick={onGetCurrentLocation}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
          title="현재 위치로 이동"
        >
          📍 내 위치
        </button>
      </form>
    </div>
  );
}
