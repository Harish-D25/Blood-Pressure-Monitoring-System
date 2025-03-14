
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useData } from "@/contexts/DataContext";
import { calculateBPStats, categorizeBP, getBPCategoryColor, formatDate } from "@/lib/bp-utils";
import { BloodPressureRecord } from "@/types";
import { Activity, Users, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { bpRecords, familyMembers, loading, getPersonName } = useData();
  
  // Calculate stats
  const stats = calculateBPStats(bpRecords);
  
  // Get recent records
  const recentRecords = [...bpRecords].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);
  
  // Prepare data for distribution chart
  const distributionData = [
    { name: "Normal", value: stats.normalReadings, color: "#22c55e" },
    { name: "Elevated", value: stats.elevatedReadings, color: "#facc15" },
    { name: "Stage 1", value: stats.stage1Readings, color: "#f97316" },
    { name: "Stage 2", value: stats.stage2Readings, color: "#ef4444" },
    { name: "Crisis", value: stats.crisisReadings, color: "#b91c1c" },
  ].filter(item => item.value > 0);
  
  // Prepare data for trend chart
  const trendData = [...bpRecords]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-14)
    .map(record => ({
      date: new Date(record.timestamp).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
      systolic: record.systolic,
      diastolic: record.diastolic
    }));
  
  // Group trend data by date (average values)
  const groupedTrendData: Record<string, { systolic: number; diastolic: number; count: number }> = {};
  trendData.forEach(item => {
    if (!groupedTrendData[item.date]) {
      groupedTrendData[item.date] = { systolic: 0, diastolic: 0, count: 0 };
    }
    groupedTrendData[item.date].systolic += item.systolic;
    groupedTrendData[item.date].diastolic += item.diastolic;
    groupedTrendData[item.date].count += 1;
  });
  
  const finalTrendData = Object.keys(groupedTrendData).map(date => ({
    date,
    systolic: Math.round(groupedTrendData[date].systolic / groupedTrendData[date].count),
    diastolic: Math.round(groupedTrendData[date].diastolic / groupedTrendData[date].count)
  }));
  
  if (loading) {
    return (
      <AppLayout>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              Total BP Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime recorded measurements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Average BP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageSystolic}/{stats.averageDiastolic}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {categorizeBP(stats.averageSystolic, stats.averageDiastolic)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Family Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{familyMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              People being monitored
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Alert Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Normal</div>
            <p className="text-xs text-muted-foreground mt-1">
              No critical readings detected
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Trend</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={finalTrendData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[60, 180]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border shadow-sm rounded-sm text-xs">
                            <p className="font-medium">{label}</p>
                            <p className="text-bpms-600">Systolic: {payload[0].value}</p>
                            <p className="text-bpms-800">Diastolic: {payload[1].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#0c92e5"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#06416d"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reading Distribution</CardTitle>
            <CardDescription>BP categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} readings`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  Not enough data to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
          <CardDescription>Last 5 measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Person</th>
                  <th className="py-2 px-4 text-left">Systolic</th>
                  <th className="py-2 px-4 text-left">Diastolic</th>
                  <th className="py-2 px-4 text-left">Pulse</th>
                  <th className="py-2 px-4 text-left">Category</th>
                  <th className="py-2 px-4 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record: BloodPressureRecord) => {
                  const category = categorizeBP(record.systolic, record.diastolic);
                  const categoryColor = getBPCategoryColor(category);
                  
                  return (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{formatDate(record.timestamp)}</td>
                      <td className="py-2 px-4">{getPersonName(record.personId, record.personType)}</td>
                      <td className="py-2 px-4">{record.systolic} mmHg</td>
                      <td className="py-2 px-4">{record.diastolic} mmHg</td>
                      <td className="py-2 px-4">{record.pulse || "-"} bpm</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${categoryColor}`}>
                          {category}
                        </span>
                      </td>
                      <td className="py-2 px-4">{record.notes || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Dashboard;
