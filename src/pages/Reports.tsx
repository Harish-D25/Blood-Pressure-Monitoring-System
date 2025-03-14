
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useData } from "@/contexts/DataContext";
import { calculateBPStats, categorizeBP } from "@/lib/bp-utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const Reports = () => {
  const { bpRecords, loading } = useData();
  
  // Get data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Filter and prepare data
  const recentRecords = bpRecords.filter(record => 
    new Date(record.timestamp) >= thirtyDaysAgo
  );
  
  // Calculate stats
  const stats = calculateBPStats(recentRecords);
  
  // Prepare weekly average data
  const weeklyData = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i+1)*7);
    
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i*7);
    
    const weekRecords = recentRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });
    
    if (weekRecords.length > 0) {
      const weekStats = calculateBPStats(weekRecords);
      weeklyData.unshift({
        name: `Week ${4-i}`,
        systolic: weekStats.averageSystolic,
        diastolic: weekStats.averageDiastolic
      });
    }
  }
  
  // Daily time slots data
  const timeSlotData = [
    { name: 'Morning', systolic: 0, diastolic: 0, count: 0 },
    { name: 'Afternoon', systolic: 0, diastolic: 0, count: 0 },
    { name: 'Evening', systolic: 0, diastolic: 0, count: 0 },
    { name: 'Night', systolic: 0, diastolic: 0, count: 0 },
  ];
  
  recentRecords.forEach(record => {
    const recordHour = new Date(record.timestamp).getHours();
    let slotIndex;
    
    if (recordHour >= 5 && recordHour < 12) slotIndex = 0; // Morning
    else if (recordHour >= 12 && recordHour < 17) slotIndex = 1; // Afternoon
    else if (recordHour >= 17 && recordHour < 22) slotIndex = 2; // Evening
    else slotIndex = 3; // Night
    
    timeSlotData[slotIndex].systolic += record.systolic;
    timeSlotData[slotIndex].diastolic += record.diastolic;
    timeSlotData[slotIndex].count += 1;
  });
  
  timeSlotData.forEach(slot => {
    if (slot.count > 0) {
      slot.systolic = Math.round(slot.systolic / slot.count);
      slot.diastolic = Math.round(slot.diastolic / slot.count);
    }
  });
  
  if (loading) {
    return (
      <AppLayout>
        <div className="grid gap-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
              </CardHeader>
              <CardContent className="h-64">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-bpms-800 mb-6">
        Blood Pressure Reports
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Last 30 Days Summary</CardTitle>
            <CardDescription>Average readings: {stats.averageSystolic}/{stats.averageDiastolic} mmHg</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Readings</span>
                <span className="font-medium">{stats.totalRecords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Pulse</span>
                <span className="font-medium">{stats.averagePulse ? `${stats.averagePulse} bpm` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">BP Category</span>
                <span className="font-medium">{categorizeBP(stats.averageSystolic, stats.averageDiastolic)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Highest Reading</span>
                <span className="font-medium">{stats.maxSystolic}/{stats.maxDiastolic} mmHg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lowest Reading</span>
                <span className="font-medium">{stats.minSystolic}/{stats.minDiastolic} mmHg</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Weekly Averages</CardTitle>
            <CardDescription>Last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[60, 'auto']} />
                    <Tooltip
                      formatter={(value) => [`${value} mmHg`, '']}
                    />
                    <Legend />
                    <Bar dataKey="systolic" name="Systolic" fill="#0c92e5" />
                    <Bar dataKey="diastolic" name="Diastolic" fill="#06416d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Not enough data to display weekly averages
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Time-of-Day Analysis</CardTitle>
          <CardDescription>How your BP varies throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {timeSlotData.some(slot => slot.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeSlotData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[60, 'auto']} />
                  <Tooltip
                    formatter={(value, name, props) => {
                      return [`${value} mmHg`, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="systolic" name="Systolic" fill="#0c92e5" />
                  <Bar dataKey="diastolic" name="Diastolic" fill="#06416d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Not enough data for time-of-day analysis
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Reports;
