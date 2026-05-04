"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function FixOpeningDays() {
  const [status, setStatus] = useState("Starting...");
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    const fixOpeningDays = async () => {
      setStatus("Fetching restaurants...");
      const restaurantsRef = collection(db, "restaurants");
      const snapshot = await getDocs(restaurantsRef);
      
      let updated = 0;
      
      for (const restaurantDoc of snapshot.docs) {
        const data = restaurantDoc.data();
        if (!data.openingDays || data.openingDays.length === 0) {
          setStatus(`Updating ${data.name}...`);
          await updateDoc(doc(db, "restaurants", restaurantDoc.id), {
            openingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
          });
          updated++;
          setResults(prev => [...prev, `✅ Updated: ${data.name}`]);
        } else {
          setResults(prev => [...prev, `⏭️ Already had days: ${data.name}`]);
        }
      }
      
      setStatus(`✅ Complete! Updated ${updated} restaurants.`);
    };
    
    fixOpeningDays();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Fix Opening Days</h1>
        <div className="p-3 bg-blue-50 rounded-lg mb-4">
          <p className="font-semibold">Status: {status}</p>
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {results.map((result, i) => (
            <p key={i} className="text-sm font-mono">{result}</p>
          ))}
        </div>
      </div>
    </div>
  );
}