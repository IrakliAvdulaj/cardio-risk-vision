
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Clock, Heart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HistoryEntry {
  id: string;
  timestamp: string;
  data: any;
  result: {
    prediction: number;
    probability: number;
  };
}

const PredictionHistory = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      const stored = sessionStorage.getItem('cardio_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    };

    loadHistory();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const clearHistory = () => {
    sessionStorage.removeItem('cardio_history');
    setHistory([]);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskBadge = (prediction: number, probability: number) => {
    const isHighRisk = prediction === 1;
    const confidence = Math.round(probability * 100);
    
    if (isHighRisk) {
      return (
        <Badge variant="destructive" className="text-xs">
          High Risk ({confidence}%)
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
        Low Risk ({confidence}%)
      </Badge>
    );
  };

  if (history.length === 0) {
    return (
      <Alert>
        <Heart className="h-4 w-4" />
        <AlertDescription>
          No prediction history yet. Complete a risk assessment to see your results here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-600">
            {history.length} prediction{history.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {history.map((entry) => (
            <Card key={entry.id} className="p-4 border-l-4 border-l-blue-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="text-xs text-gray-500">
                  {formatDate(entry.timestamp)}
                </div>
                {getRiskBadge(entry.result.prediction, entry.result.probability)}
              </div>
              
              <div className="text-sm space-y-1">
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                  <span>Age: {Math.round(entry.data.age / 365)} years</span>
                  <span>Gender: {entry.data.gender === '1' ? 'Male' : 'Female'}</span>
                  <span>BP: {entry.data.ap_hi}/{entry.data.ap_lo}</span>
                  <span>BMI: {(entry.data.weight / Math.pow(entry.data.height / 100, 2)).toFixed(1)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PredictionHistory;
