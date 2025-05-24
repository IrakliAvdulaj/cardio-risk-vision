
import React from 'react';
import { Card } from '@/components/ui/card';
import CardiovascularForm from '@/components/CardiovascularForm';
import PredictionHistory from '@/components/PredictionHistory';
import { Heart } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">CardioPredict</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced cardiovascular risk assessment using machine learning technology
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Heart className="h-6 w-6 text-red-500 mr-2" />
                Risk Assessment Form
              </h2>
              <CardiovascularForm />
            </Card>
          </div>

          {/* History Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Prediction History
              </h2>
              <PredictionHistory />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
