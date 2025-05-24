
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PredictionResultProps {
  prediction: {
    prediction: number;
    confidence: number;
  };
}

const PredictionResult: React.FC<PredictionResultProps> = ({ prediction }) => {
  const isHighRisk = prediction.prediction === 1;
  const confidence = Math.round(prediction.confidence * 100);
  const riskLevel = isHighRisk ? 'High' : 'Low';
  
  const getRiskColor = () => {
    if (isHighRisk) {
      return confidence > 70 ? 'text-red-600' : 'text-orange-500';
    }
    return confidence > 70 ? 'text-green-600' : 'text-blue-500';
  };

  const getRiskIcon = () => {
    if (isHighRisk) {
      return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
    return <CheckCircle className="h-8 w-8 text-green-500" />;
  };

  const getProgressColor = () => {
    if (isHighRisk) {
      return confidence > 70 ? 'bg-red-500' : 'bg-orange-500';
    }
    return confidence > 70 ? 'bg-green-500' : 'bg-blue-500';
  };

  return (
    <Card className="mt-6 p-6 bg-gradient-to-r from-white to-gray-50 border-l-4 border-l-blue-500 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <Heart className="h-6 w-6 text-red-500 mr-2" />
          Risk Assessment Result
        </h3>
        {getRiskIcon()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Level */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Risk Level</label>
            <div className={`text-3xl font-bold ${getRiskColor()}`}>
              {riskLevel} Risk
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Confidence: {confidence}%
            </label>
            <div className="relative">
              <Progress 
                value={confidence} 
                className="h-4 bg-gray-200"
              />
              <div 
                className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Visual Gauge */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={isHighRisk ? (confidence > 70 ? '#dc2626' : '#f97316') : (confidence > 70 ? '#16a34a' : '#2563eb')}
                strokeWidth="8"
                strokeDasharray={`${(confidence / 100) * 314.16} 314.16`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getRiskColor()}`}>
                {confidence}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <Alert className={`mt-4 ${isHighRisk ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
        <AlertDescription className="text-sm">
          {isHighRisk ? (
            <>
              <strong>High cardiovascular risk detected.</strong> We recommend consulting with a healthcare professional 
              for further evaluation and discussion of preventive measures.
            </>
          ) : (
            <>
              <strong>Low cardiovascular risk indicated.</strong> Continue maintaining healthy lifestyle habits 
              and regular check-ups with your healthcare provider.
            </>
          )}
        </AlertDescription>
      </Alert>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          * This prediction is for informational purposes only and should not replace professional medical advice.
          Always consult with qualified healthcare professionals for medical decisions.
        </p>
      </div>
    </Card>
  );
};

export default PredictionResult;
