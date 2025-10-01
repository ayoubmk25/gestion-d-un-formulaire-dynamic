<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Mail\AdminAccountCreated;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\Abonnement;
use App\Models\FormTemplate;

class RootController extends Controller
{
    public function createCompany(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:companies,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'available_forms' => 'required|integer|min:0',
            'forms_to_create' => 'required|integer|min:0',
            'max_users' => 'required|integer|min:1',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'date_de_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_de_debut',
        ]);

        // Create the company
        $company = Company::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'max_users' => $request->max_users,
        ]);

        // Create the abonnement record
        Abonnement::create([
            'company_id' => $company->id,
            'available_forms' => $request->available_forms,
            'forms_to_create' => $request->forms_to_create,
            'date_de_debut' => $request->date_de_debut,
            'date_fin' => $request->date_fin,
        ]);
     
        // Fetch the created abonnement
        $abonnement = Abonnement::where('company_id', $company->id)->first();

        $password = Str::random(10);

       
        $admin = User::create([
            'name' => $request->admin_name,
            'email' => $request->admin_email,
            'password' =>hash::make($password) ,
            'company_id' => $company->id,
            'role' => 'administrator',
        ]);

        Mail::to($admin->email)->send(new AdminAccountCreated($admin, $password));

        return response()->json([
            'message' => 'Company and admin account created successfully',
            'company' => $company,
            'admin' => $admin,
            'abonnement' => $abonnement, // Include abonnement data
        ], 201);
    }

    public function listCompanies(Request $request)
    {
        $companies = Company::with('abonnements')->get(); // Eager load the abonnement relationship
        
        return response()->json($companies);
    }

    public function getCompany($id)
    {
        $company = Company::with('abonnements')->findOrFail($id); // Eager load the abonnement relationship
        
        return response()->json($company);
    }

    public function updateCompany(Request $request, $id)
    {
        $company = Company::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:companies,email,' . $company->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'available_forms' => 'sometimes|integer|min:0',
            'forms_to_create' => 'sometimes|integer|min:0',
            'max_users' => 'sometimes|integer|min:1',
            'is_active' => 'sometimes|boolean',
        ]);

        // Extract abonnement-specific data from the request
        $abonnementData = $request->only(['available_forms', 'forms_to_create']);

        // Update the company with the remaining data
        $company->update($request->except(['available_forms', 'forms_to_create', 'admin_name', 'admin_email', 'date_de_debut', 'date_fin']));

        // Find and update the associated abonnement
        $abonnement = $company->abonnements()->first(); // Assuming a hasOne or hasMany relationship where you want the first abonnement
        if ($abonnement) {
            $abonnement->update($abonnementData);
        }

        return response()->json([
            'message' => 'Company and associated abonnement updated successfully',
            'company' => $company->load('abonnements'), // Load the updated abonnement relationship
        ]);
    }

    public function deactivateCompany($id)
    {
        $company = Company::findOrFail($id);
        $company->is_active = false;
        $company->save();
        
        // Deactivate all users of this company
        User::where('company_id', $company->id)
            ->update(['is_active' => false]);
        
        return response()->json([
            'message' => 'Company and its users deactivated successfully',
        ]);
    }

    public function activateCompany($id)
    {
        $company = Company::findOrFail($id);
        $company->is_active = true;
        $company->save();

        // Activate all users of this company
        User::where('company_id', $company->id)
            ->update(['is_active' => true]);

        return response()->json([
            'message' => 'Company and its users activated successfully',
        ]);
    }

    public function activateAdmin($id)
    {
        $admin = User::where('id', $id)->where('role', 'administrator')->firstOrFail();
        $admin->is_active = true;
        $admin->save();

        return response()->json(['message' => 'Admin activated successfully']);
    }

    public function deactivateAdmin($id)
    {
        $admin = User::where('id', $id)->where('role', 'administrator')->firstOrFail();
        $admin->is_active = false;
        $admin->save();

        return response()->json(['message' => 'Admin deactivated successfully']);
    }

    public function deleteCompany($id)
    {
        $company = Company::findOrFail($id);

        // Delete associated users (admins and collaborators)
        $company->users()->delete();

        // Delete associated form templates, submissions, and assignments
        $company->formTemplates()->delete(); // Assuming a relationship exists
        // You might need to add cascade deletes in your database migrations or handle these relationships manually
        // For example, deleting form submissions and assignments related to the company's form templates

        $company->delete();

        return response()->json(['message' => 'Company and associated data deleted successfully']);
    }

    public function deleteCollaborator($id)
    {
        $collaborator = User::where('id', $id)->where('role', 'collaborator')->firstOrFail();

        // Delete associated form submissions and assignments
        $collaborator->formSubmissions()->delete(); // Assuming relationships exist
        $collaborator->formAssignments()->delete(); // Assuming relationships exist

        $collaborator->delete();

        return response()->json(['message' => 'Collaborator and associated data deleted successfully']);
    }

    public function deleteFormTemplate($id)
    {
        $formTemplate = \App\Models\FormTemplate::findOrFail($id); // Use the fully qualified name

        $formTemplate->delete();

        return response()->json(['message' => 'Form template and associated data deleted successfully']);
    }
     public function createFormTemplate(Request $request)
    {
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
            'company_id' => 1, // Assuming root user's company ID is 1
            'created_by' => 1, // Assuming root user has ID 1
        ]);

        return response()->json([
            'message' => 'Form template created successfully',
            'form_template' => $formTemplate,
        ], 201);
    }
    public function listFormTemplates()
    {
      // Assuming root user has ID 1
      $formTemplates = FormTemplate::where('created_by', 1)->get();

        
        return response()->json($formTemplates);
    }

    public function assignFormTemplateToCompany(Request $request)
    {
        $request->validate([
            'form_template_id' => 'required|exists:form_templates,id',
            'company_email' => 'required|exists:companies,email',
        ]);

        $formTemplate = FormTemplate::findOrFail($request->form_template_id);
        $company = Company::where('email', $request->company_email)->firstOrFail();

        $abonnement = $company->abonnements()->first();
        if (!$abonnement || $abonnement->forms_to_create <= 0) {
            return response()->json(['message' => 'Company has no forms available to assign'], 400);
        }

        $formTemplate->company_id = $company->id;
        // You might want to set created_by to the root user's ID or null if not applicable
        // $formTemplate->created_by = auth()->id(); // Assuming root user is authenticated
        $formTemplate->save();

        // Update abonnement counts
        $abonnement->increment('available_forms');
        $abonnement->decrement('forms_to_create');
        $abonnement->save();

        return response()->json(['message' => 'Form template assigned to company successfully']);
    }

    public function getFormTemplate($id)
    {
        // Assuming root user has ID 1, based on listFormTemplates logic
        $rootUserId = 1; 

        // Find the template by ID and ensure it was created by the root user
        // firstOrFail will automatically return 404 if not found
        $formTemplate = FormTemplate::where('id', $id)
                                    ->where('created_by', $rootUserId) 
                                    ->firstOrFail();

        return response()->json($formTemplate);
    }

    public function updateFormTemplate(Request $request, $id)
    {
        // Assuming root user has ID 1
        $rootUserId = 1;

        // Find the template by ID and ensure it was created by the root user
        $formTemplate = FormTemplate::where('id', $id)
                                    ->where('created_by', $rootUserId)
                                    ->firstOrFail();

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'fields' => 'sometimes|required|array',
            'fields.*.name' => 'required|string',
            'fields.*.type' => 'required|string|in:text,textarea,number,select,checkbox,radio,date,datetime,file,image',
            'fields.*.label' => 'required|string',
            'fields.*.required' => 'required|boolean',
            'fields.*.options' => 'required_if:fields.*.type,select,checkbox,radio|array',
        ]);

        // Update the form template
        $formTemplate->update($request->all());

        return response()->json([
            'message' => 'Form template updated successfully',
            'form_template' => $formTemplate,
        ]);
    }

    /**
     * Get dashboard statistics for the root user.
     */
    public function dashboardStats()
    {
        // Assuming root user's company ID is 1
        $rootCompanyId = 1;

        $abonnement = Abonnement::where('company_id', $rootCompanyId)->first();

        $stats = [
            'available_form_templates' => $abonnement ? $abonnement->available_forms : 0,
            // Add other root dashboard stats here if needed in the future
        ];

        return response()->json($stats);
    }
}
