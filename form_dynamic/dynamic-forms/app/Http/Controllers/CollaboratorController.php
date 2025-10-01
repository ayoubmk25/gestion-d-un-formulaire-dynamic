<?php

namespace App\Http\Controllers;

use App\Models\FormAssignment;
use App\Models\FormSubmission;
use App\Models\FormTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User; // Import the User model
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CollaboratorController extends Controller
{
    /**
     * Fetch a list of users that a collaborator can message (administrators, technicians, validators).
     */
    public function getMessageRecipients()
    {
        $authenticatedUserId = Auth::id();

        $recipients = User::whereIn('role', ['administrator', 'technician', 'validator'])
                          ->where('id', '!=', $authenticatedUserId)
                          ->select('id', 'name', 'role')
                          ->get();

        return response()->json($recipients);
    }

    public function listAssignedForms()
    {
        $user = Auth::user();

        $assignments = FormAssignment::with('formTemplate')
            ->where('user_id', $user->id)
            ->where('is_completed', false)
            ->get();

        return response()->json($assignments);
    }

    public function listSubmissions()
    {
        $user = Auth::user();

        $submissions = FormSubmission::with('formTemplate')
            ->where('user_id', $user->id)
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
                    'form_template_title' => $submission->formTemplate->title ?? null,
                ];
            });

        return response()->json($submissions);
    }

    public function getFormTemplate($id)
    {
        $user = Auth::user();

        $assignment = FormAssignment::where('form_template_id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $formTemplate = FormTemplate::findOrFail($id);

        return response()->json($formTemplate);
    }

    public function createFormSubmission(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'form_template_id' => 'required|exists:form_templates,id',
            'form_data' => 'required|string',
            'status' => 'required|in:draft,submitted',
        ]);

        $assignment = FormAssignment::where('form_template_id', $request->form_template_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $locationData = $request->input('location_data');

        $formData = json_decode($request->input('form_data', '{}'), true);

        foreach ($request->allFiles() as $fieldName => $file) {
            $path = $file->store('uploads', 'public');
            $formData[$fieldName] = Storage::disk('public')->url($path);
            Log::info('Generated file URL in createFormSubmission: ' . Storage::disk('public')->url($path));
        }

        $submission = FormSubmission::create([
            'form_template_id' => $request->form_template_id,
            'user_id' => $user->id,
            'form_data' => $formData,
            'status' => $request->status,
            'location_data' => $locationData,
        ]);


        return response()->json([
            'message' => 'Form submission created successfully',
            'submission' => $submission,
        ], 201);
    }

    public function updateFormSubmission(Request $request, $id)
    {
        $user = Auth::user();

        $submission = FormSubmission::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $request->validate([
            'form_data' => 'sometimes|string',
            'status' => 'sometimes|in:draft,submitted',
        ]);

        $formData = $submission->form_data ?? [];
        if ($request->has('form_data')) {
            $formData = json_decode($request->input('form_data', '{}'), true);
        }

        foreach ($request->allFiles() as $fieldName => $file) {
            $path = $file->store('uploads', 'public');
            $formData[$fieldName] = Storage::disk('public')->url($path);
            Log::info('Generated file URL in updateFormSubmission: ' . Storage::disk('public')->url($path));
        }

        $submission->update([
            'form_data' => $formData,
            'status' => $request->input('status', $submission->status),
            'location_data' => $request->input('location_data', $submission->location_data),
        ]);


        return response()->json([
            'message' => 'Form submission updated successfully',
            'submission' => $submission,
        ]);
    }

    public function getFormSubmission($id)
    {
        $user = Auth::user();

        $submission = FormSubmission::where('id', $id)
            ->where('user_id', $user->id)
            ->with('formTemplate')
            ->firstOrFail();

        return response()->json($submission);
    }

    public function validateFormSubmission(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'validator') {
            return response()->json([
                'message' => 'Only validators can change submission status to validated',
            ], 403);
        }

        $submission = FormSubmission::findOrFail($id);

        if ($submission->status !== 'submitted') {
            return response()->json([
                'message' => 'Form submission status can only be changed from submitted to refused by this endpoint.',
            ], 400);
        }

        // Ensure form_template_id and user_id are not null before proceeding with assignment check
        if (is_null($submission->form_template_id) || is_null($submission->user_id)) {
            Log::error("FormSubmission ID {$id} has null form_template_id or user_id.");
            return response()->json([
                'message' => 'Invalid submission data.',
            ], 500); // Or 422 Unprocessable Entity
        }

        // Check if this validator is assigned to validate submissions from this technician for this form template
        // Or if the validator is the same user as the technician who submitted the form
        $isAssignedOrSelf = \App\Models\ValidatorTechnicianAssignment::where('form_template_id', $submission->form_template_id)
            ->where('validator_id', $user->id)
            ->where('technician_id', $submission->user_id)
            ->exists() || ($user->id === $submission->user_id && $user->role === 'validator');

        if (!$isAssignedOrSelf) {
            return response()->json([
                'message' => 'You are not authorized to refuse this submission.',
            ], 403);
        }

        $submission->status = 'validated';
        $submission->validated_by = $user->id;
        $submission->validated_at = now();
        $submission->save();

        return response()->json([
            'message' => 'Form submission status updated successfully to validated',
            'submission' => $submission,
        ]);
    }

    public function refuseFormSubmission(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'validator') {
            return response()->json([
                'message' => 'Only validators can change submission status to refused',
            ], 403);
        }

        $submission = FormSubmission::findOrFail($id);

        if ($submission->status !== 'submitted') {
            return response()->json([
                'message' => 'Form submission status can only be changed from submitted to refused by this endpoint.',
            ], 400);
        }

        // Check if this validator is assigned to validate submissions from this technician for this form template
        // Or if the validator is the same user as the technician who submitted the form
        $isAssignedOrSelf = \App\Models\ValidatorTechnicianAssignment::where('form_template_id', $submission->form_template_id)
            ->where('validator_id', $user->id)
            ->where('technician_id', $submission->user_id)
            ->exists() || ($user->id === $submission->user_id && $user->role === 'validator');

        if (!$isAssignedOrSelf) {
            return response()->json([
                'message' => 'You are not authorized to refuse this submission.',
            ], 403);
        }

        $submission->status = 'refused';
        $submission->validated_by = $user->id; // Reusing validated_by to store who refused it
        $submission->validated_at = now(); // Reusing validated_at to store when it was refused
        $submission->save();

        return response()->json([
            'message' => 'Form submission status updated successfully to refused',
            'submission' => $submission,
        ]);
    }

    public function listSubmittedFormsForValidator()
    {
        $user = Auth::user();

        // Get the form templates assigned to technicians that this validator is assigned to
        $assignedFormTemplates = \App\Models\ValidatorTechnicianAssignment::where('validator_id', $user->id)
            ->pluck('form_template_id')
            ->unique();

        Log::info('Validator ID: ' . $user->id);
        Log::info('Assigned Form Template IDs: ' . json_encode($assignedFormTemplates));

        // Get submissions from technicians assigned to this validator for those form templates
    $submissions = FormSubmission::with(['formTemplate', 'user'])
        ->where(function ($query) use ($assignedFormTemplates, $user) {
            $query->whereIn('form_template_id', $assignedFormTemplates)
                  ->whereIn('user_id', function ($query) use ($user) {
                      $query->select('technician_id')
                          ->from('validator_technician_assignments')
                          ->where('validator_id', $user->id);
                  });
        })
        ->orWhere('user_id', $user->id)
        ->where('status', 'submitted')
        ->get();

        Log::info('Number of submissions found: ' . $submissions->count());

        return response()->json($submissions);
    }

     public function getFormSubmissionContent($id)
    {
        $user = Auth::user();

        if ($user->role !== 'validator') {
            return response()->json([
                'message' => 'Only validators can view submission content',
            ], 403);
        }

        $submission = FormSubmission::with('formTemplate')->findOrFail($id);
        $template = json_decode($submission->formTemplate->content, true);
        $formData = $submission->form_data;

        $mergedContent = [];
        if (is_array($template)) {
            $mergedContent = $this->mergeFormData($template, $formData);
        }

        return response()->json([
            'submission_id'       => $submission->id,
            'form_template_id'    => $submission->form_template_id,
            'user_id'             => $submission->user_id,
            'status'              => $submission->status,
            'validated_by'        => $submission->validated_by,
            'validated_at'        => $submission->validated_at,
            'created_at'          => $submission->created_at,
            'updated_at'          => $submission->updated_at,
            'form_template_title' => $submission->formTemplate->title,
            'content'             => $mergedContent,
        ]);
    }

    /**
     * Merge form template structure with actual submitted values,
     * mapping option IDs to human-readable labels for checkboxes and radios.
     */
    private function mergeFormData(array $template, array $data): array
    {
        foreach ($template as &$section) {
            if (isset($section['fields']) && is_array($section['fields'])) {
                foreach ($section['fields'] as &$field) {
                    $name = $field['name'] ?? null;
                    if (! $name || ! array_key_exists($name, $data)) {
                        continue;
                    }

                    $rawValue = $data[$name];

                    // If the field has defined options, map values to their labels
                    if (! empty($field['options']) && is_array($field['options'])) {
                        // Multi-select (checkbox)
                        if (is_array($rawValue)) {
                            $labels = [];
                            foreach ($rawValue as $val) {
                                foreach ($field['options'] as $opt) {
                                    if (isset($opt['value']) && $opt['value'] === $val) {
                                        $labels[] = $opt['label'] ?? $val;
                                        break;
                                    }
                                }
                            }
                            $field['submitted_value'] = $labels;
                        } else {
                            // Single-select (radio)
                            $label = $rawValue;
                            foreach ($field['options'] as $opt) {
                                if (isset($opt['value']) && $opt['value'] === $rawValue) {
                                    $label = $opt['label'] ?? $rawValue;
                                    break;
                                }
                            }
                            $field['submitted_value'] = $label;
                        }
                    } else {
                        // No options: just echo raw value
                        $field['submitted_value'] = $rawValue;
                    }
                }
            }
        }

        return $template;
    }
    public function dashboardStats()
    {
        $user = Auth::user();

        $stats = [
            'assigned_forms' => FormAssignment::where('user_id', $user->id)
                ->where('is_completed', false)
                ->count(),
            'completed_forms' => FormAssignment::where('user_id', $user->id)
                ->where('is_completed', true)
                ->count(),
            'submissions_by_status' => [
                'draft' => FormSubmission::where('user_id', $user->id)
                    ->where('status', 'draft')
                    ->count(),
                'submitted' => FormSubmission::where('user_id', $user->id)
                    ->where('status', 'submitted')
                    ->count(),
                'validated' => FormSubmission::where('user_id', $user->id)
                    ->where('status', 'validated')
                    ->count(),
            ],
        ];

        if ($user->role === 'validator') {
            $stats['pending_validation'] = FormSubmission::where('status', 'submitted')
                ->whereHas('formTemplate', function ($query) use ($user) {
                    $query->where('company_id', $user->company_id);
                })
                ->count();

            $stats['validated_forms'] = FormSubmission::where('validated_by', $user->id)
                ->count();
        }

        return response()->json($stats);
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
}
