import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout'; // Import Layout
import { useApi } from '../hooks/useApi';
import { FormField } from '@/contexts/FormContext'; // Import FormField
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Import Card components
import { Input } from '@/components/ui/input'; // Import Input

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { Button } from '@/components/ui/button'; // Import Button

import {
  Search,
  ClipboardList, // Using ClipboardList icon
  MoreHorizontal, // Import MoreHorizontal icon
} from 'lucide-react'; // Import icons
import { toast } from '@/hooks/use-toast'; // Import toast

interface FormAssignment {
  id: number;
  form_template_id: number;
  user_id: number;
  assigned_by: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  form_template: {
    id: number;
    title: string;
    description: string | null;
    fields: FormField[];
    company_id: number;
    created_by: number;
    created_at: string;
    updated_at: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    company_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

const FormAssignments: React.FC = () => {
  const api = useApi();
  const [assignments, setAssignments] = useState<FormAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // Example filter state

  const fetchAssignments = async () => {
    try {
      const response = await api.listAssignments();
      setAssignments(response.data);
    } catch (err) {
      setError('Failed to fetch form assignments.');
      console.error(err);
      toast({
        title: "Error loading assignments",
        description: "There was a problem loading the form assignments list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [api]); // Dependency array updated to include api

  const filteredAssignments = assignments.filter((assignment: FormAssignment) => {
    const formTitle = assignment.form_template?.title || '';
    const userName = assignment.user?.name || '';
    const dueDate = assignment.due_date || '';

    const matchesSearch = (
      formTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dueDate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Implement filtering logic based on filterStatus if needed
    // For now, just return matchesSearch
    return matchesSearch;
  });

  // Group assignments by form template
  const groupedAssignments = filteredAssignments.reduce((acc, assignment) => {
    const templateId = assignment.form_template_id;
    if (!acc[templateId]) {
      acc[templateId] = {
        formTemplate: assignment.form_template,
        collaborators: [],
      };
    }
    acc[templateId].collaborators.push(assignment.user);
    return acc;
  }, {} as Record<number, { formTemplate: FormAssignment['form_template'], collaborators: FormAssignment['user'][] }>);

  const groupedAssignmentsArray = Object.values(groupedAssignments);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="flex justify-between">
              <div className="h-10 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-[500px] bg-muted rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center text-destructive">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Form Assignments</h1>
            <p className="text-muted-foreground mt-1">
              View and manage assigned forms
            </p>
          </div>
          {/* Add button for new assignment if needed */}
          {/* <div className="mt-4 md:mt-0">
            <Button onClick={() => navigate('/admin/assign-form')}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Assign Form
            </Button>
          </div> */}
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Form Assignments</CardTitle>
                <CardDescription>
                  List of all assigned forms to collaborators
                </CardDescription>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assignments..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* Add filter if needed */}
                {/* <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No form assignments found</h3>
                <p className="text-muted-foreground mb-6">Assign a form to a collaborator to get started.</p>
                {/* Add button for new assignment if needed */}
                {/* <Button onClick={() => navigate('/admin/assign-form')}>
                  Assign Form
                </Button> */}
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Form Template</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Assigned To</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Due Date</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {groupedAssignmentsArray.map((groupedAssignment) => (
                        <tr
                          key={groupedAssignment.formTemplate.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">{groupedAssignment.formTemplate.title}</td>
                          <td className="p-4 align-middle">
                            {groupedAssignment.collaborators.map((collaborator, index) => (
                              <React.Fragment key={collaborator.id}>
                                {collaborator.name}
                                {index < groupedAssignment.collaborators.length - 1 && ', '}
                              </React.Fragment>
                            ))}
                          </td>
                          {/* Due Date column might not be relevant when grouped by template, or needs adjustment */}
                          <td className="p-4 align-middle">N/A</td> {/* Placeholder */}
                          <td className="p-4 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/* Add action items here if needed, e.g., View Details, Edit, Delete */}
                                {/* These actions might need to apply to the template or individual assignments */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Add AlertDialog components if needed for actions */}
    </Layout>
  );
};

export default FormAssignments;
