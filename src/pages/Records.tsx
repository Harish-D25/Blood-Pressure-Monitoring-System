
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Plus, Filter, Trash, ArrowUpDown } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { categorizeBP, getBPCategoryColor, formatDate, sortRecordsByDate } from "@/lib/bp-utils";
import { BloodPressureRecord } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  systolic: z.string().min(1, "Required").refine(val => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num < 300;
  }, "Invalid value"),
  diastolic: z.string().min(1, "Required").refine(val => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num < 200;
  }, "Invalid value"),
  pulse: z.string().optional().refine(val => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num < 250;
  }, "Invalid value"),
  notes: z.string().optional(),
  personId: z.string(),
  personType: z.enum(["user", "family"]),
  timestamp: z.string().min(1, "Required"),
});

const Records = () => {
  const { bpRecords, familyMembers, addBPRecord, deleteBPRecord, getPersonName } = useData();
  const { user } = useAuth();
  const [filterPerson, setFilterPerson] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Default to newest first
  const [sortedAndFilteredRecords, setSortedAndFilteredRecords] = useState<BloodPressureRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Update sorted and filtered records whenever dependencies change
  useEffect(() => {
    // Filter records based on selected person
    const filtered = bpRecords.filter(record => {
      if (filterPerson === "all") return true;
      if (filterPerson === "me" && record.personType === "user" && record.personId === user?.id) return true;
      return record.personId === filterPerson;
    });
    
    // Sort records by timestamp
    const sorted = sortRecordsByDate(filtered, sortOrder === "asc");
    setSortedAndFilteredRecords(sorted);
    
    console.log("Records filtered and sorted:", sorted.length);
    console.log("Sort order:", sortOrder);
    console.log("Filter person:", filterPerson);
  }, [bpRecords, filterPerson, sortOrder, user?.id]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systolic: "",
      diastolic: "",
      pulse: "",
      notes: "",
      personId: user?.id || "",
      personType: "user",
      timestamp: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const record = {
        systolic: parseInt(values.systolic),
        diastolic: parseInt(values.diastolic),
        pulse: values.pulse ? parseInt(values.pulse) : undefined,
        notes: values.notes,
        personId: values.personId,
        personType: values.personType,
        timestamp: new Date(values.timestamp).toISOString()
      };
      
      addBPRecord(record);
      form.reset({
        systolic: "",
        diastolic: "",
        pulse: "",
        notes: "",
        personId: user?.id || "",
        personType: "user",
        timestamp: new Date().toISOString().slice(0, 16)
      });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add record",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      deleteBPRecord(id);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === "asc" ? "desc" : "asc");
  };
  
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Blood Pressure Records</h1>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-bpms-600 hover:bg-bpms-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Blood Pressure Record</DialogTitle>
                <DialogDescription>
                  Enter the details of the blood pressure measurement.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="systolic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Systolic (mmHg)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="120" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="diastolic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diastolic (mmHg)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="80" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pulse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pulse (bpm) - Optional</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="75" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="timestamp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="personType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Person Type</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Set default personId based on type
                            if (value === "user") {
                              form.setValue("personId", user?.id || "");
                            } else if (familyMembers.length > 0) {
                              form.setValue("personId", familyMembers[0].id);
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select person type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">Me</SelectItem>
                            <SelectItem value="family">Family Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("personType") === "family" && (
                    <FormField
                      control={form.control}
                      name="personId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Family Member</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select family member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {familyMembers.map(member => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., After exercise, before medication" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" className="bg-bpms-600 hover:bg-bpms-700">
                      Save Record
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Records</CardTitle>
              <CardDescription>
                Showing {sortedAndFilteredRecords.length} of {bpRecords.length} records
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSortOrder}
                className="flex items-center"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
              </Button>
              
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <Select value={filterPerson} onValueChange={setFilterPerson}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="me">My Records</SelectItem>
                    {familyMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Systolic</TableHead>
                  <TableHead>Diastolic</TableHead>
                  <TableHead>Pulse</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredRecords.length > 0 ? (
                  sortedAndFilteredRecords.map((record: BloodPressureRecord) => {
                    const category = categorizeBP(record.systolic, record.diastolic);
                    const categoryColor = getBPCategoryColor(category);
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.timestamp)}</TableCell>
                        <TableCell>{getPersonName(record.personId, record.personType)}</TableCell>
                        <TableCell>{record.systolic} mmHg</TableCell>
                        <TableCell>{record.diastolic} mmHg</TableCell>
                        <TableCell>{record.pulse || "-"} {record.pulse ? "bpm" : ""}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${categoryColor}`}>
                            {category}
                          </span>
                        </TableCell>
                        <TableCell>{record.notes || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record.id)}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <AlertCircle className="h-10 w-10 mb-2" />
                        <h3 className="font-medium">No records found</h3>
                        <p className="text-sm">
                          {filterPerson !== "all" 
                            ? "Try changing your filter or add a record for this person." 
                            : "Add your first blood pressure record to get started."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Records;
