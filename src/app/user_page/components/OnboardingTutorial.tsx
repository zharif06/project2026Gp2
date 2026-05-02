"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  X, 
  MapPin, 
  Search, 
  Filter, 
  Heart, 
  Star,
  CheckCircle,
  TrendingUp,
  Compass,
  User,
} from "lucide-react";

interface OnboardingTutorialProps {
  onClose: () => void;
  userId: string;
}

export default function OnboardingTutorial({ onClose, userId }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  const [showHighlight, setShowHighlight] = useState(true);
  
  const steps = [
    {
      title: "📍 Find Restaurants Near You",
      description: "Use the location picker to discover restaurants in your area.",
      icon: MapPin,
      color: "bg-blue-500",
      highlightText: "Look for the 'Use My Location' button on the Find Restaurants page"
    },
    {
      title: "🔍 Search for Food",
      description: "Search by restaurant name or cuisine to find what you're craving.",
      icon: Search,
      color: "bg-green-500",
      highlightText: "Type in the search box to find specific restaurants or cuisines"
    },
    {
      title: "🎯 Filter Your Results",
      description: "Use filters to narrow down by cuisine, price, rating, and more.",
      icon: Filter,
      color: "bg-teal-500",
      highlightText: "Click the 'Filters' button to see all filtering options"
    },
    {
      title: "❤️ Save Your Favorites",
      description: "Love a restaurant? Click the heart to save it to your favorites.",
      icon: Heart,
      color: "bg-pink-500",
      highlightText: "Click the heart icon on any restaurant card to save it"
    },
    {
      title: "✍️ Write Reviews",
      description: "Share your experience by rating and reviewing restaurants.",
      icon: Star,
      color: "bg-yellow-500",
      highlightText: "Click 'View Details' on any restaurant, then scroll to 'Write a Review'"
    },
    {
      title: "📊 Track Your Activity",
      description: "See your review history, favorite cuisines, and recommendations.",
      icon: TrendingUp,
      color: "bg-orange-500",
      highlightText: "Your stats are shown on the Dashboard page"
    },
    {
      title: "👤 Manage Your Profile",
      description: "Update your profile picture and account settings.",
      icon: User,
      color: "bg-purple-500",
      highlightText: "Click 'My Profile' in the sidebar to edit your information"
    },
    {
      title: "You're All Set! 🎉",
      description: "Start exploring restaurants and discover amazing food that fits your budget!",
      icon: CheckCircle,
      color: "bg-green-500",
      highlightText: ""
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHighlight(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [step]);

  const handleNext = async () => {
    if (step === steps.length - 1) {
      await updateDoc(doc(db, "users", userId), {
        hasSeenTutorial: true
      });
      onClose();
    } else {
      setStep(step + 1);
      setShowHighlight(true);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
      setShowHighlight(true);
    }
  };

  const handleSkip = async () => {
    await updateDoc(doc(db, "users", userId), {
      hasSeenTutorial: true
    });
    onClose();
  };

  const CurrentIcon = steps[step].icon;
  const currentStep = steps[step];

  return (
    <>
      {/* Tutorial Modal - No overlay, just floating window */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100 rounded-t-2xl overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className={`w-14 h-14 ${currentStep.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
              <CurrentIcon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{currentStep.title}</h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 leading-relaxed text-base">{currentStep.description}</p>

            {/* Highlight Tip */}
            {currentStep.highlightText && showHighlight && (
              <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-sm text-orange-700">
                  💡 <span className="font-semibold">Tip:</span> {currentStep.highlightText}
                </p>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === step ? "w-8 bg-orange-500" : "w-2 bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => {
                    setStep(idx);
                    setShowHighlight(true);
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePrevious}
                disabled={step === 0}
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium transition-colors ${
                  step === 0 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                ← Previous
              </button>
              
              <button
                onClick={handleNext}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  step === steps.length - 1
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                    : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                }`}
              >
                {step === steps.length - 1 ? (
                  <>Finish <CheckCircle className="w-4 h-4" /></>
                ) : (
                  <>Next →</>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Step {step + 1} of {steps.length}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}