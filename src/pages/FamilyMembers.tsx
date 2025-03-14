
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import { FamilyMember } from "@/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, Trash, Users, UserPlus, AlertCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  relationship: z.string().min(1, "Relationship is required"),
  age: z.string().optional().refine(val => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num < 120;
  }, "Invalid age"),
  gender: z.string().optional(),
});

const FamilyMembers = () => {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember, bpRecords } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      relationship: "",
      age: "",
      gender: "",
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const member = {
      name: values.name,
      relationship: values.relationship,
      age: values.age ? parseInt(values.age) : undefined,
      gender: values.gender || undefined,
    };
    
    if (editMember) {
      updateFamilyMember(editMember.id, member);
    } else {
      addFamilyMember(member);
    }
    
    resetForm();
  };
  
  const resetForm = () => {
    form.reset({
      name: "",
      relationship: "",
      age: "",
      gender: "",
    });
    setEditMember(null);
    setDialogOpen(false);
  };
  
  const handleEdit = (member: FamilyMember) => {
    setEditMember(member);
    form.reset({
      name: member.name,
      relationship: member.relationship,
      age: member.age?.toString() || "",
      gender: member.gender || "",
    });
    setDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this family member? All their blood pressure records will be deleted as well.")) {
      deleteFamilyMember(id);
    }
  };
  
  // Count records for each family member
  const getRecordCount = (memberId: string) => {
    return bpRecords.filter(record => record.personId === memberId && record.personType === 'family').length;
  };
  
  // Debug information
  console.log("Family Members:", familyMembers);
  
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Family Members</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-bpms-600 hover:bg-bpms-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editMember ? "Edit" : "Add"} Family Member</DialogTitle>
              <DialogDescription>
                {editMember 
                  ? "Update the information for this family member." 
                  : "Add a family member to track their blood pressure."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Grandparent">Grandparent</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="35" {...field} />
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
                        <FormLabel>Gender (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="none">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-bpms-600 hover:bg-bpms-700">
                    {editMember ? "Update" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {familyMembers.length > 0 ? (
          familyMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-3 bg-bpms-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.relationship}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(member)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(member.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span>{member.age || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span>{member.gender || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">BP Records:</span>
                    <span>{getRecordCount(member.id)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No family members added yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Add your family members to track their blood pressure data alongside yours
            </p>
            <Button onClick={() => setDialogOpen(true)} className="bg-bpms-600 hover:bg-bpms-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Family Member
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FamilyMembers;
