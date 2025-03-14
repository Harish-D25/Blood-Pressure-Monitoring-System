
import { BloodPressureRecord } from "@/types";

// Function to categorize blood pressure
export const categorizeBP = (systolic: number, diastolic: number): string => {
  if (systolic >= 180 || diastolic >= 120) return "Hypertensive Crisis";
  if (systolic >= 140 || diastolic >= 90) return "Stage 2 Hypertension";
  if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90))
    return "Stage 1 Hypertension";
  if ((systolic >= 120 && systolic < 130) && diastolic < 80)
    return "Elevated";
  if (systolic < 120 && diastolic < 80) return "Normal";
  return "Undefined";
};

// Function to get a color for a BP category
export const getBPCategoryColor = (category: string): string => {
  switch (category) {
    case "Normal":
      return "bg-green-500";
    case "Elevated":
      return "bg-yellow-400";
    case "Stage 1 Hypertension":
      return "bg-orange-500";
    case "Stage 2 Hypertension":
      return "bg-red-500";
    case "Hypertensive Crisis":
      return "bg-red-700";
    default:
      return "bg-gray-400";
  }
};

// Generate mock blood pressure records for demo purposes
export const generateMockBPRecords = (
  userId: string,
  personId: string,
  personType: 'user' | 'family',
  count: number
): BloodPressureRecord[] => {
  const records: BloodPressureRecord[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Generate blood pressure that's mostly in the "normal" to "elevated" range
    const systolic = Math.floor(Math.random() * 30) + 110; // 110-140
    const diastolic = Math.floor(Math.random() * 20) + 70; // 70-90
    const pulse = Math.floor(Math.random() * 20) + 60; // 60-80
    
    // Create date going back in time
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Generate a truly unique ID that won't cause React key warnings
    const uniqueId = `bp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    records.push({
      id: uniqueId,
      systolic,
      diastolic,
      pulse,
      timestamp: date.toISOString(),
      notes: i % 5 === 0 ? "After exercise" : i % 3 === 0 ? "Before breakfast" : "",
      userId,
      personId,
      personType
    });
  }
  
  return records;
};

// Calculate stats from BP records
export const calculateBPStats = (records: BloodPressureRecord[]) => {
  if (!records.length) {
    return {
      averageSystolic: 0,
      averageDiastolic: 0,
      averagePulse: 0,
      totalRecords: 0,
      normalReadings: 0,
      elevatedReadings: 0,
      stage1Readings: 0,
      stage2Readings: 0,
      crisisReadings: 0,
      minSystolic: 0,
      maxSystolic: 0,
      minDiastolic: 0,
      maxDiastolic: 0
    };
  }

  let totalSystolic = 0;
  let totalDiastolic = 0;
  let totalPulse = 0;
  let normalReadings = 0;
  let elevatedReadings = 0;
  let stage1Readings = 0;
  let stage2Readings = 0;
  let crisisReadings = 0;
  
  // Initialize min/max with first record values
  let minSystolic = records[0].systolic;
  let maxSystolic = records[0].systolic;
  let minDiastolic = records[0].diastolic;
  let maxDiastolic = records[0].diastolic;
  
  records.forEach(record => {
    totalSystolic += record.systolic;
    totalDiastolic += record.diastolic;
    if (record.pulse) totalPulse += record.pulse;
    
    // Update min/max values
    minSystolic = Math.min(minSystolic, record.systolic);
    maxSystolic = Math.max(maxSystolic, record.systolic);
    minDiastolic = Math.min(minDiastolic, record.diastolic);
    maxDiastolic = Math.max(maxDiastolic, record.diastolic);
    
    const category = categorizeBP(record.systolic, record.diastolic);
    switch(category) {
      case "Normal":
        normalReadings++;
        break;
      case "Elevated":
        elevatedReadings++;
        break;
      case "Stage 1 Hypertension":
        stage1Readings++;
        break;
      case "Stage 2 Hypertension":
        stage2Readings++;
        break;
      case "Hypertensive Crisis":
        crisisReadings++;
        break;
    }
  });
  
  return {
    averageSystolic: Math.round(totalSystolic / records.length),
    averageDiastolic: Math.round(totalDiastolic / records.length),
    averagePulse: Math.round(totalPulse / records.length),
    totalRecords: records.length,
    normalReadings,
    elevatedReadings,
    stage1Readings,
    stage2Readings,
    crisisReadings,
    minSystolic,
    maxSystolic,
    minDiastolic,
    maxDiastolic
  };
};

// Sort records by timestamp (newest first)
export const sortRecordsByDate = (records: BloodPressureRecord[], ascending: boolean = false): BloodPressureRecord[] => {
  return [...records].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
};

// Format date to display in a readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};
