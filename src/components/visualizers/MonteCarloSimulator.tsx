
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runMonteCarloSimulation, type Task, type SimulationResult } from "@/utils/algorithms";
import { Clock, BarChart, AlertTriangle, CheckCircle, Play } from "lucide-react";

const DEFAULT_TASK_A: Task = {
  name: "Task A",
  minDuration: 2,
  maxDuration: 4
};

const DEFAULT_TASK_B: Task = {
  name: "Task B",
  minDuration: 3,
  maxDuration: 6
};

const DEFAULT_AVAILABLE_HOURS = 8;
const DEFAULT_TRIALS = 1000;

export function MonteCarloSimulator() {
  const [taskA, setTaskA] = useState<Task>(DEFAULT_TASK_A);
  const [taskB, setTaskB] = useState<Task>(DEFAULT_TASK_B);
  const [availableHours, setAvailableHours] = useState(DEFAULT_AVAILABLE_HOURS);
  const [trials, setTrials] = useState(DEFAULT_TRIALS);
  const [inputError, setInputError] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const validateInputs = (): boolean => {
    if (taskA.minDuration < 0 || taskA.maxDuration < 0) {
      setInputError("Task A durations must be positive");
      return false;
    }
    
    if (taskB.minDuration < 0 || taskB.maxDuration < 0) {
      setInputError("Task B durations must be positive");
      return false;
    }
    
    if (taskA.minDuration > taskA.maxDuration) {
      setInputError("Task A minimum duration must be less than or equal to maximum");
      return false;
    }
    
    if (taskB.minDuration > taskB.maxDuration) {
      setInputError("Task B minimum duration must be less than or equal to maximum");
      return false;
    }
    
    if (availableHours <= 0) {
      setInputError("Available hours must be positive");
      return false;
    }
    
    if (trials < 100 || trials > 10000) {
      setInputError("Number of trials must be between 100 and 10,000");
      return false;
    }
    
    setInputError("");
    return true;
  };

  const runSimulation = () => {
    if (!validateInputs()) return;
    
    setIsAnimating(true);
    setAnimationProgress(0);
    
    // Animation to show progress
    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnimating(false);
          
          // Run actual simulation after animation
          const simulationResult = runMonteCarloSimulation(
            taskA,
            taskB,
            availableHours,
            trials
          );
          setResult(simulationResult);
          
          return 100;
        }
        return prev + 4;
      });
    }, 50);
  };

  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate histogram data from simulation durations
  const getHistogramData = () => {
    if (!result) return [];
    
    const minDuration = Math.min(...result.durations);
    const maxDuration = Math.max(...result.durations);
    const range = maxDuration - minDuration;
    const numBins = 10;
    const binSize = range / numBins;
    
    const bins = Array(numBins).fill(0);
    
    result.durations.forEach(duration => {
      const binIndex = Math.min(
        Math.floor((duration - minDuration) / binSize),
        numBins - 1
      );
      bins[binIndex]++;
    });
    
    return bins.map((count, index) => {
      const binStart = minDuration + index * binSize;
      const binEnd = binStart + binSize;
      return {
        range: `${binStart.toFixed(1)} - ${binEnd.toFixed(1)}`,
        count,
        percentage: (count / result.totalTrials) * 100,
        isSuccess: binEnd <= result.threshold
      };
    });
  };

  const histogramData = result ? getHistogramData() : [];
  const maxBinCount = histogramData.length > 0 
    ? Math.max(...histogramData.map(bin => bin.count))
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Task Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task A: Minimum Duration (hours)
              </label>
              <Input
                type="number"
                value={taskA.minDuration}
                onChange={(e) => setTaskA({...taskA, minDuration: parseFloat(e.target.value) || 0})}
                min="0"
                step="0.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task A: Maximum Duration (hours)
              </label>
              <Input
                type="number"
                value={taskA.maxDuration}
                onChange={(e) => setTaskA({...taskA, maxDuration: parseFloat(e.target.value) || 0})}
                min="0"
                step="0.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task B: Minimum Duration (hours)
              </label>
              <Input
                type="number"
                value={taskB.minDuration}
                onChange={(e) => setTaskB({...taskB, minDuration: parseFloat(e.target.value) || 0})}
                min="0"
                step="0.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task B: Maximum Duration (hours)
              </label>
              <Input
                type="number"
                value={taskB.maxDuration}
                onChange={(e) => setTaskB({...taskB, maxDuration: parseFloat(e.target.value) || 0})}
                min="0"
                step="0.5"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Simulation Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Hours Before Event
              </label>
              <Input
                type="number"
                value={availableHours}
                onChange={(e) => setAvailableHours(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Simulation Trials: {trials}
              </label>
              <Slider
                value={[trials]}
                min={100}
                max={10000}
                step={100}
                onValueChange={(values) => setTrials(values[0])}
              />
            </div>
            
            {inputError && (
              <div className="bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{inputError}</p>
              </div>
            )}
            
            <Button onClick={runSimulation} disabled={isAnimating} className="w-full">
              {isAnimating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Running Simulation...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {isAnimating && (
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-out"
              style={{ width: `${animationProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">
            Running {trials} simulations...
          </p>
        </div>
      )}
      
      {result && !isAnimating && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 p-4 rounded-lg border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm border border-primary/10 flex flex-col items-center">
                <Clock className="h-10 w-10 text-primary mb-2" />
                <span className="text-sm text-gray-500">Probability of Completion</span>
                <span className="text-3xl font-bold">{(result.probability * 100).toFixed(1)}%</span>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm border border-primary/10 flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-green-600 mb-2" />
                <span className="text-sm text-gray-500">Successful Trials</span>
                <span className="text-3xl font-bold">{result.successCount}</span>
                <span className="text-xs text-gray-400">of {result.totalTrials}</span>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm border border-primary/10 flex flex-col items-center">
                <Clock className="h-10 w-10 text-blue-500 mb-2" />
                <span className="text-sm text-gray-500">Time Threshold</span>
                <span className="text-3xl font-bold">{result.threshold} hours</span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="histogram">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4">
              <TabsTrigger value="histogram">Histogram</TabsTrigger>
              <TabsTrigger value="interpretation">Interpretation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="histogram" className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Distribution of Task Completion Times
              </h3>
              
              <div className="h-64 flex items-end gap-1">
                {histogramData.map((bin, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full ${bin.isSuccess ? 'bg-green-500' : 'bg-red-500'} rounded-t transition-all duration-500 animate-bar-fill`}
                      style={{ 
                        height: `${(bin.count / maxBinCount) * 100}%`,
                        '--bar-width': '100%'
                      } as React.CSSProperties}
                    ></div>
                    <div className="text-xs mt-1 text-gray-600 w-full text-center overflow-hidden text-ellipsis whitespace-nowrap">
                      {bin.range}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Completes in time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Exceeds available time</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="interpretation" className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-4">What This Means</h3>
              
              <div className="space-y-4">
                <p>
                  Based on {result.totalTrials} simulation trials, there is a {' '}
                  <span className="font-bold">{(result.probability * 100).toFixed(1)}% chance</span> of 
                  completing both tasks within the available {result.threshold} hours.
                </p>
                
                <div className="bg-gray-50 p-3 rounded-md border">
                  <h4 className="font-medium mb-2">Task Characteristics:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <span className="font-medium">Task A:</span> Takes between {taskA.minDuration} and {taskA.maxDuration} hours
                    </li>
                    <li>
                      <span className="font-medium">Task B:</span> Takes between {taskB.minDuration} and {taskB.maxDuration} hours
                    </li>
                  </ul>
                </div>
                
                {result.probability >= 0.8 ? (
                  <div className="p-3 bg-green-50 rounded-md border border-green-200 flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">High Probability of Success</p>
                      <p className="text-sm text-green-700">
                        You have a good chance of completing both tasks before the event.
                      </p>
                    </div>
                  </div>
                ) : result.probability >= 0.5 ? (
                  <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200 flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Moderate Probability of Success</p>
                      <p className="text-sm text-yellow-700">
                        You have about a 50/50 chance of completing both tasks in time. Consider 
                        allowing more time if possible.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 rounded-md border border-red-200 flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">Low Probability of Success</p>
                      <p className="text-sm text-red-700">
                        It's unlikely you'll complete both tasks in time. Consider allocating more 
                        time or prioritizing one task over the other.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
