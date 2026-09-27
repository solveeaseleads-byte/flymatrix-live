'use client';
import { useState } from 'react';

export default function BudgetPlanner() {
  const [dest, setDest] = useState(20);
  const [accom, setAccom] = useState(15);
  const [food, setFood] = useState(10);

  const total = Number(dest) + Number(accom) + Number(food);

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm font-sans">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Custom Travel Budget Planner</h3>

      <div className="mb-4">
        <label className="block font-semibold text-sm mb-1 text-gray-700">Target Destination</label>
        <select onChange={(e) => setDest(e.target.value)} className="w-full p-2 border rounded-md">
          <option value="20">Southeast Asia (Low) - $20/day base</option>
          <option value="35">Latin America (Low-Med) - $35/day base</option>
          <option value="50">Eastern Europe (Med) - $50/day base</option>
          <option value="80">Southern Europe (High) - $80/day base</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold text-sm mb-1 text-gray-700">Accommodation Style</label>
        <select onChange={(e) => setAccom(e.target.value)} className="w-full p-2 border rounded-md">
          <option value="15">Hostel ($15/night)</option>
          <option value="45">Budget Hotel ($45/night)</option>
          <option value="110">Standard Hotel ($110/night)</option>
          <option value="250">Luxury Resort ($250/night)</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block font-semibold text-sm mb-1 text-gray-700">Food & Dining</label>
        <select onChange={(e) => setFood(e.target.value)} className="w-full p-2 border rounded-md">
          <option value="10">Street Food ($10/day)</option>
          <option value="25">Casual Dining ($25/day)</option>
          <option value="55">Mixed Restaurants ($55/day)</option>
          <option value="100">Fine Dining ($100/day)</option>
        </select>
      </div>

      <div className="p-4 bg-blue-50 rounded-md text-center">
        <p className="text-sm text-gray-600 font-medium">Estimated Daily Total</p>
        <p className="text-2xl font-bold text-blue-600">${total} / day</p>
      </div>
    </div>
  );
}
