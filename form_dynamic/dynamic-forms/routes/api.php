<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\RootController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CollaboratorController;

// Public routes
Route::post('/login', [LoginController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Logout route
    Route::post('/logout', [LoginController::class, 'logout']);


    // Root routes
    Route::middleware('CheckRole:root')->group(function () {
        Route::post('/companies', [RootController::class, 'createCompany']);
        Route::get('/companies', [RootController::class, 'listCompanies']);
        Route::get('/companies/{id}', [RootController::class, 'getCompany']);
        Route::put('/companies/{id}', [RootController::class, 'updateCompany']);
        Route::patch('/companies/{id}/deactivate', [RootController::class, 'deactivateCompany']);
        Route::put('/companies/{id}/activate', [RootController::class, 'activateCompany']);
        Route::delete('/companies/{id}', [RootController::class, 'deleteCompany']);

    });

    // Administrator routes
    Route::middleware('CheckRole:administrator')->group(function () {
        // Collaborator management
        Route::post('/collaborators', [AdminController::class, 'createCollaborator']);
        Route::get('/collaborators', [AdminController::class, 'listCollaborators']);
        Route::get('/collaborators/{id}', [AdminController::class, 'getCollaborator']);
        Route::put('/collaborators/{id}', [AdminController::class, 'updateCollaborator']);
        Route::patch('/collaborators/{id}/deactivate', [AdminController::class, 'deactivateCollaborator']);
        Route::put('/collaborators/{id}/activate', [AdminController::class, 'activateCollaborator']);
        Route::delete('/collaborators/{id}', [AdminController::class, 'deleteCollaborator']);
        Route::put('/admin/change-password', [AdminController::class, 'changePassword']);
        
        // Form template management
        Route::post('/form-templates', [AdminController::class, 'createFormTemplate']);
        Route::get('/form-templates', [AdminController::class, 'listFormTemplates']);
        Route::get('/form-templates/{id}', [AdminController::class, 'getFormTemplate']);
        Route::delete('/form-templates/{id}', [AdminController::class, 'deleteFormTemplate']);
        
        // Form assignment
        Route::post('/form-assignments', [AdminController::class, 'assignForm']);
        Route::get('/form-assignments', [AdminController::class, 'listAssignments']);
        
        // Dashboard
        Route::get('/admin/dashboard', [AdminController::class, 'dashboardStats']);
    });

    // Collaborator routes (both technician and validator)
    Route::middleware('CheckRole:technician,validator')->group(function () {
        Route::get('/assigned-forms', [CollaboratorController::class, 'listAssignedForms']);
        Route::get('/form-submissions', [CollaboratorController::class, 'listSubmissions']);
        Route::get('/assigned-forms/{id}', [CollaboratorController::class, 'getFormTemplate']);
        Route::post('/form-submissions', [CollaboratorController::class, 'createFormSubmission']);
        Route::put('/form-submissions/{id}', [CollaboratorController::class, 'updateFormSubmission']);
        Route::get('/collaborator/dashboard', [CollaboratorController::class, 'dashboardStats']);
        Route::put('/collaborator/change-password', [CollaboratorController::class, 'changePassword']);
    });

    // Validator-only routes
    Route::middleware('CheckRole:validator')->group(function () {
        Route::patch('/form-submissions/{id}/validate', [CollaboratorController::class, 'validateFormSubmission']);
        Route::get('/validator/submissions-for-validation', [AdminController::class, 'listSubmissionsForValidation']);
    });
});