import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { AlertCircle, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import PredictionResult from './PredictionResult';

const formSchema = z.object({
  age: z.number().min(1, 'Age must be at least 1 day').max(50000, 'Age seems unrealistic'),
  gender: z.enum(['1', '2'], { required_error: 'Please select gender' }),
  height: z.number().min(50, 'Height must be at least 50 cm').max(250, 'Height must be less than 250 cm'),
  weight: z.number().min(10, 'Weight must be at least 10 kg').max(300, 'Weight must be less than 300 kg'),
  ap_hi: z.number().min(70, 'Systolic pressure must be at least 70').max(250, 'Systolic pressure seems too high'),
  ap_lo: z.number().min(40, 'Diastolic pressure must be at least 40').max(150, 'Diastolic pressure seems too high'),
  cholesterol: z.enum(['1', '2', '3'], { required_error: 'Please select cholesterol level' }),
  gluc: z.enum(['1', '2', '3'], { required_error: 'Please select glucose level' }),
  smoke: z.enum(['0', '1'], { required_error: 'Please select smoking status' }),
  alco: z.enum(['0', '1'], { required_error: 'Please select alcohol consumption' }),
  active: z.enum(['0', '1'], { required_error: 'Please select physical activity level' }),
});

type FormData = z.infer<typeof formSchema>;

interface PredictionResponse {
  prediction: number;
  probability: number;
}

const CardiovascularForm = () => {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: '1',
      cholesterol: '1',
      gluc: '1',
      smoke: '0',
      alco: '0',
      active: '1',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      console.log('Submitting prediction request to FastAPI:', data);
      
      // Convert form data to match FastAPI expected format
      const requestData = {
        age: parseInt(data.age.toString()),
        gender: parseInt(data.gender),
        height: parseInt(data.height.toString()),
        weight: parseInt(data.weight.toString()),
        ap_hi: parseInt(data.ap_hi.toString()),
        ap_lo: parseInt(data.ap_lo.toString()),
        cholesterol: parseInt(data.cholesterol),
        gluc: parseInt(data.gluc),
        smoke: parseInt(data.smoke),
        alco: parseInt(data.alco),
        active: parseInt(data.active),
      };

      console.log('Formatted request data:', requestData);

      // Make actual API call to FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PredictionResponse = await response.json();
      console.log('FastAPI response:', result);
      
      setPrediction(result);
      
      // Save to session storage for history
      const history = JSON.parse(sessionStorage.getItem('cardio_history') || '[]');
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        data,
        result,
      };
      history.unshift(newEntry);
      sessionStorage.setItem('cardio_history', JSON.stringify(history.slice(0, 10))); // Keep last 10
      
      // Trigger history update
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "Prediction Complete",
        description: `Risk level: ${result.prediction === 1 ? 'High' : 'Low'} (${Math.round(result.probability * 100)}% confidence)`,
      });
      
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get prediction. Please check if FastAPI server is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const InfoTooltip = ({ children, info }: { children: React.ReactNode; info: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {children}
            <AlertCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{info}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4 bg-blue-50/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip info="Age in days since birth (e.g., 25 years = ~9125 days)">
                        <span>Age (days)</span>
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 9125"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2">Female</SelectItem>
                        <SelectItem value="1">Male</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip info="Height in centimeters">
                        <span>Height (cm)</span>
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 170"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip info="Weight in kilograms">
                        <span>Weight (kg)</span>
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 70"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Medical Measurements */}
          <Card className="p-4 bg-green-50/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ap_hi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip info="Systolic blood pressure (upper number, e.g., 120 in 120/80)">
                        <span>Systolic BP (mmHg)</span>
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 120"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ap_lo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip info="Diastolic blood pressure (lower number, e.g., 80 in 120/80)">
                        <span>Diastolic BP (mmHg)</span>
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 80"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Laboratory Values */}
          <Card className="p-4 bg-amber-50/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Laboratory Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cholesterol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cholesterol Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cholesterol level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Normal</SelectItem>
                        <SelectItem value="2">Above normal</SelectItem>
                        <SelectItem value="3">Well above normal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gluc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Glucose Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select glucose level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Normal</SelectItem>
                        <SelectItem value="2">Above normal</SelectItem>
                        <SelectItem value="3">Well above normal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Lifestyle Factors */}
          <Card className="p-4 bg-purple-50/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lifestyle Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="smoke"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Smoking</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Smoking status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Non-smoker</SelectItem>
                        <SelectItem value="1">Smoker</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alcohol Consumption</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Alcohol consumption" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Activity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Physical activity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Inactive</SelectItem>
                        <SelectItem value="1">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Risk...
              </>
            ) : (
              'Assess Cardiovascular Risk'
            )}
          </Button>
        </form>
      </Form>

      {prediction && <PredictionResult prediction={prediction} />}
    </div>
  );
};

export default CardiovascularForm;
