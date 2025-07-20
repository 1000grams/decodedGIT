import React, { useState } from "react";

export default function FilterSidebar({ onChange }) {
  const [filters, setFilters] = useState({
    genre: "",
    mood: "",
    bpmMin: "",
    bpmMax: "",
    durationMin: "",
    durationMax: "",
    license: "",
  });

  function update(name, value) {
    const next = { ...filters, [name]: value };
    setFilters(next);
    if (onChange) onChange(next);
  }

  function handleChange(e) {
    update(e.target.name, e.target.value);
  }

  function clearFilters() {
    const cleared = {
      genre: "",
      mood: "",
      bpmMin: "",
      bpmMax: "",
      durationMin: "",
      durationMax: "",
      license: "",
    };
    setFilters(cleared);
    if (onChange) onChange(cleared);
  }

  return (
    <aside className="w-64 p-4 border-r space-y-4">
      <div>
        <label className="block font-semibold mb-1">Genre</label>
        <input
          name="genre"
          value={filters.genre}
          onChange={handleChange}
          className="p-2 border rounded w-full"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Mood</label>
        <input
          name="mood"
          value={filters.mood}
          onChange={handleChange}
          className="p-2 border rounded w-full"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">BPM</label>
        <div className="flex space-x-2">
          <input
            name="bpmMin"
            value={filters.bpmMin}
            onChange={handleChange}
            placeholder="Min"
            className="p-2 border rounded w-full"
          />
          <input
            name="bpmMax"
            value={filters.bpmMax}
            onChange={handleChange}
            placeholder="Max"
            className="p-2 border rounded w-full"
          />
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1">Duration (sec)</label>
        <div className="flex space-x-2">
          <input
            name="durationMin"
            value={filters.durationMin}
            onChange={handleChange}
            placeholder="Min"
            className="p-2 border rounded w-full"
          />
          <input
            name="durationMax"
            value={filters.durationMax}
            onChange={handleChange}
            placeholder="Max"
            className="p-2 border rounded w-full"
          />
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1">License</label>
        <select
          name="license"
          value={filters.license}
          onChange={handleChange}
          className="p-2 border rounded w-full"
        >
          <option value="">Any</option>
          <option value="exclusive">Exclusive</option>
          <option value="non-exclusive">Non-Exclusive</option>
        </select>
      </div>
      <button
        type="button"
        onClick={clearFilters}
        className="px-3 py-2 bg-gray-200 rounded"
      >
        Clear
      </button>
    </aside>
  );
}
