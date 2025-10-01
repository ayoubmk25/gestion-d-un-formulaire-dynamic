<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\FormTemplate;
use App\Models\FormAssignment;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Mail\UserAccountCreated;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    public function createCollaborator(Request $request)
    {
        $user = Auth::user();
        $company = $user->company;
        
        // Check if company can add more users
        $currentUserCount = User::where('company_id', $company->id)->count();
        if ($currentUserCount >= $company->max_users) {
            return response()->json([
                'message' => 'Maximum user limit reached for your company',
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:technician,validator',
        ]);

        // Generate a random password
        $password = Str::random(10);

        // Create the user
        $collaborator = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($password),
            'company_id' => $company->id,
            'role' => $request->role,
        ]);

        // Send email with login credentials
        Mail::to($collaborator->email)->send(new UserAccountCreated($collaborator, $password));

        return response()->json([
            'message' => 'Collaborator created successfully',
            'collaborator' => $collaborator,
        ], 201);
    }

    public function updateCollaborator(Request $request, $id)
    {
        $user = Auth::user();
        $company = $user->company;
        
        $collaborator = User::where('id', $id)
            ->where('company_id', $company->id)
            ->where('role', '!=', 'administrator')
            ->firstOrFail();
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $collaborator->id,
            'role' => 'sometimes|in:technician,validator',
            'is_active' => 'sometimes|boolean',
        ]);

        $collaborator->update($request->all());
        
        return response()->json([
            'message' => 'Collaborator updated successfully',
            'collaborator' => $collaborator,
        ]);
    }

    public function listCollaborators()
    {
        $user = Auth::user();
        $company = $user->company;
        
        $collaborators = User::where('company_id', $company->id)
            ->where('role', '!=', 'administrator')
            ->get();
        
        return response()->json($collaborators);
    }

    public function getCollaborator($id)
    {
        $user = Auth::user();
        $company = $user->company;
        
        $collaborator = User::where('id', $id)
            ->where('company_id', $company->id)
            ->where('role', '!=', 'administrator')
            ->firstOrFail();
        
        return response()->json($collaborator);
    }

    public function deactivateCollaborator($id)
    {
        $user = Auth::user();
        $company = $user->company;
        
        $collaborator = User::where('id', $id)
            ->where('company_id', $company->id)
            ->where('role', '!=', 'administrator')
            ->firstOrFail();
        
        $collaborator->is_active = false;
        $collaborator->save();
        
        return response()->json([
            'message' => 'Collaborator deactivated successfully',
        ]);
    }

    public function createFormTemplate(Request $request)
    {
        $user = Auth::user();
        $company = $user->company;
        
        // Check if company can create more forms
        $abonnement = $company->abonnements()->first();
        if (!$abonnement || $abonnement->forms_to_create <= 0) {
            return response()->json([
                'message' => 'Your company has reached the limit of forms to create',
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'fields' => 'required|array',
            'fields.*.name' => 'required|string',
            'fields.*.type' => 'required|string|in:text,textarea,number,select,checkbox,radio,date,datetime,file,image',
            'fields.*.label' => 'required|string',
            'fields.*.required' => 'required|boolean',
            'fields.*.options' => 'required_if:fields.*.type,select,checkbox,radio|array',
        ]);

        // Create the form template
        $formTemplate = FormTemplate::create([
            'title' => $request->title,
            'description' => $request->description,
            'fields' => $request->fields,
            'company_id' => $company->id,
            'created_by' => $user->id,
        ]);

        // Decrease the forms_to_create count and increase available_forms on the abonnement
        $abonnement = $company->abonnements()->first();
        if ($abonnement) {
            $abonnement->forms_to_create -= 1;
            $abonnement->available_forms += 1;
            $abonnement->save();
        }


        return response()->json([
            'message' => 'Form template created successfully',
            'form_template' => $formTemplate,
        ], 201);
    }

    public function listFormTemplates()
    {
        $user = Auth::user();
        $company = $user->company;
        
        $formTemplates = FormTemplate::where('company_id', $company->id)
            ->get();
        
        return response()->json($formTemplates);
    }

    public function getFormTemplate($id)
    {
        $user = Auth::user();
        $company = $user->company;
        
        $formTemplate = FormTemplate::where('id', $id)
            ->where('company_id', $company->id)
            ->firstOrFail();
        
        return response()->json($formTemplate);
    }

    public function assignForm(Request $request)
    {
        $user = Auth::user();
        $company = $user->company;
        
        $request->validate([
            'form_template_id' => 'required|exists:form_templates,id',
            'assignee_email' => 'required|email|exists:users,email',
            'due_date' => 'nullable|date|after:today',
        ]);
    
        // Verify that the form template belongs to the company
        $formTemplate = FormTemplate::where('id', $request->form_template_id)
            ->where('company_id', $company->id)
            ->firstOrFail();
        
        // Find the user by email and verify they belong to the company
        $collaborator = User::where('email', $request->assignee_email)
            ->where('company_id', $company->id)
            ->where('role', '!=', 'administrator')
            ->firstOrFail();
        
        // Create form assignment
        $assignment = FormAssignment::create([
            'form_template_id' => $formTemplate->id,
            'user_id' => $collaborator->id,
            'assigned_by' => $user->id,
            'due_date' => $request->due_date,
        ]);
        
        return response()->json([
            'message' => 'Form assigned successfully',
            'assignment' => $assignment,
        ], 201);
    }

    public function listAssignments()
    {
        $user = Auth::user();
        $company = $user->company;
        
        $assignments = FormAssignment::with(['formTemplate', 'user'])
            ->where('assigned_by', $user->id) // Filter by the logged-in admin
            ->whereHas('formTemplate', function ($query) use ($company) {
                $query->where('company_id', $company->id);
            })
            ->get();
        
        return response()->json($assignments);
    }

    public function dashboardStats()
    {
        $user = Auth::user();
        $company = $user->company;
        
        // Get statistics for the company
        $stats = [
            'total_collaborators' => User::where('company_id', $company->id)
                ->where('role', '!=', 'administrator')
                ->count(),
            'active_collaborators' => User::where('company_id', $company->id)
                ->where('role', '!=', 'administrator')
                ->where('is_active', true)
                ->count(),
            'total_forms' => FormTemplate::where('company_id', $company->id)->count(),
            'available_forms' => $company->abonnements()->first() ? $company->abonnements()->first()->available_forms : 0,
            'forms_to_create' => $company->abonnements()->first() ? $company->abonnements()->first()->forms_to_create : 0,
            'total_submissions' => \App\Models\FormSubmission::whereHas('formTemplate', function ($query) use ($company) {
                $query->where('company_id', $company->id);
            })->count(),
            'submissions_by_status' => [
                'draft' => \App\Models\FormSubmission::whereHas('formTemplate', function ($query) use ($company) {
                    $query->where('company_id', $company->id);
                })->where('status', 'draft')->count(),
                'submitted' => \App\Models\FormSubmission::whereHas('formTemplate', function ($query) use ($company) {
                    $query->where('company_id', $company->id);
                })->where('status', 'submitted')->count(),
                'validated' => \App\Models\FormSubmission::whereHas('formTemplate', function ($query) use ($company) {
                    $query->where('company_id', $company->id);
                })->where('status', 'validated')->count(),
            ],
        ];
        
        return response()->json($stats);
    }

    public function activateCollaborator($id)
    {
        $user = Auth::user();
        $company = $user->company;

        $collaborator = User::where('id', $id)
            ->where('company_id', $company->id)
            ->where('role', '!=', 'administrator')
            ->firstOrFail();

        $collaborator->is_active = true;
        $collaborator->save();

        return response()->json(['message' => 'Collaborator activated successfully']);
    }

    public function deleteCollaborator($id)
    {
        $user = Auth::user();
        $company = $user->company;

        $collaborator = User::where('id', $id)
            ->where('company_id', $company->id)
            ->where('role', '!=', 'administrator')
            ->firstOrFail();

        // Delete associated form submissions and assignments
        $collaborator->formSubmissions()->delete(); // Assuming relationships exist
        $collaborator->assignedForms()->delete(); // Assuming relationships exist

        $collaborator->delete();

        return response()->json(['message' => 'Collaborator and associated data deleted successfully']);
    }

    public function deleteFormTemplate($id)
    {
        $user = Auth::user();
        $company = $user->company;

        $formTemplate = FormTemplate::where('id', $id)
            ->where('company_id', $company->id)
            ->firstOrFail();

        // Delete associated form submissions and assignments
        $formTemplate->submissions()->delete(); // Assuming relationships exist
        $formTemplate->assignments()->delete(); // Assuming relationships exist

        $formTemplate->delete();

        return response()->json(['message' => 'Form template and associated data deleted successfully']);
    }

    public function listSubmissionsForValidation()
    {
        $user = Auth::user();
        $company = $user->company;

        // Fetch submissions with 'submitted' status for the company, eager loading the user (technician) and formTemplate
        $submissions = \App\Models\FormSubmission::with(['user', 'formTemplate'])
            ->whereHas('formTemplate', function ($query) use ($company) {
                $query->where('company_id', $company->id);
            })
            ->where('status', 'submitted')
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'form_template_id' => $submission->form_template_id,
                    'user_id' => $submission->user_id,
                    'form_data' => $submission->form_data,
                    'status' => $submission->status,
                    'validated_by' => $submission->validated_by,
                    'validated_at' => $submission->validated_at,
                    'created_at' => $submission->created_at,
                    'updated_at' => $submission->updated_at,
                    'location_data' => $submission->location_data,
                    'user' => $submission->user,
                    'form_template' => $submission->formTemplate, // Include the full formTemplate object
                ];
            });

        return response()->json($submissions);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function assignValidatorToTechnicians(Request $request)
    {
        $user = Auth::user();
        $company = $user->company;

        $request->validate([
            'form_template_id' => 'required|exists:form_templates,id',
            'validator_id' => 'required|exists:users,id',
            'technician_ids' => 'required|array',
            'technician_ids.*' => 'exists:users,id',
        ]);

        
        $formTemplate = FormTemplate::where('id', $request->form_template_id)
            ->where('company_id', $company->id)
            ->firstOrFail();

        $validator = User::where('id', $request->validator_id)
            ->where('company_id', $company->id)
            ->where('role', 'validator')
            ->firstOrFail();

      
        $technicians = User::whereIn('id', $request->technician_ids)
            ->where('company_id', $company->id)
            ->where('role', 'technician')
            ->get();

       
        if ($technicians->count() !== count($request->technician_ids)) {
             return response()->json([
                'message' => 'One or more technician IDs are invalid or do not belong to your company/role.',
            ], 400);
        }

        \App\Models\ValidatorTechnicianAssignment::where('form_template_id', $formTemplate->id)
            ->whereIn('technician_id', $technicians->pluck('id'))
            ->delete();

        
        foreach ($technicians as $technician) {
            \App\Models\ValidatorTechnicianAssignment::create([
                'form_template_id' => $formTemplate->id,
                'validator_id' => $validator->id,
                'technician_id' => $technician->id,
            ]);
        }


        return response()->json([
            'message' => 'Validator assigned to technicians successfully.',
            'form_template_id' => $formTemplate->id,
            'validator_id' => $validator->id,
            'technician_ids' => $technicians->pluck('id')->toArray(),
        ], 200);
    }
}
