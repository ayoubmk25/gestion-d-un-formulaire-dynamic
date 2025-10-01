

## Setup Instructions

1. Clone this repository
2. Install dependencies with `npm install`
3. Copy `.env.example` to `.env` and set your API URL:
   ```
   cp .env.example .env
   ```
4. Edit `.env` and set `VITE_API_URL` to point to your Laravel backend API
5. Start the development server with `npm run dev`

## API Configuration

This frontend is designed to work with the FormFlow Laravel API. Ensure your backend API is running and accessible at the URL specified in the `.env` file.

### API Endpoints

The application uses the following API endpoints:

- Auth: `/login`, `/logout`
- Root: `/companies`, `/companies/{id}`, `/companies/{id}/deactivate`
- Admin: 
  - `/collaborators`, `/collaborators/{id}`, `/collaborators/{id}/deactivate`
  - `/form-templates`, `/form-templates/{id}`
  - `/form-assignments`
  - `/admin/dashboard`
- Collaborator: 
  - `/assigned-forms`, `/assigned-forms/{id}`
  - `/form-submissions`, `/form-submissions/{id}`
  - `/collaborator/dashboard`
- Validator: `/form-submissions/{id}/validate`

## Authentication

The application uses token-based authentication. The authentication flow is:

1. User provides email and password on the login screen
2. The frontend makes a POST request to `/api/login` with the credentials
3. The backend validates credentials and returns a token and user data
4. The frontend stores the token in localStorage and uses it for subsequent API requests
5. When logging out, the frontend makes a POST request to `/api/logout` to invalidate the token

## User Roles

The application supports four user roles:

- **Root**: Super admin who manages companies.
- **Administrator**: Company admin who manages collaborators and form templates.
- **Technician**: Fills out forms assigned to them.
- **Validator**: Reviews and validates forms submitted by technicians.

## Functional Requirements

The FormFlow platform is designed to meet the following key functional requirements to ensure client satisfaction and efficient form management:

- **User Access Management**: Only authenticated users can access the platform and interact with forms, ensuring data security and integrity.
- **Dynamic Form Creation**: Administrators have the capability to create new dynamic forms and define their fields, allowing for flexible data collection.
- **Form Assignment**: Forms can be assigned to different Collaborators (Technicians) based on their roles and responsibilities, streamlining workflow distribution.
- **Form Filling and Submission**: Technicians can fill out the forms assigned to them and submit them for processing, facilitating data entry.
- **Form Status Management**: Each form submission progresses through distinct statuses (e.g., 'saisie' for in-progress, 'validé' for validated), which are updated throughout the processing lifecycle.
- **Form Consultation**: Collaborators (Technicians and Validators) can view a list of forms they have filled or that have been assigned to them, along with their current status and progress.
- **Collaboration and Validation**: Validators can review forms submitted by Technicians, update their status, and provide comments or feedback as necessary, ensuring quality control and approval processes.

## Creating Companies

When creating a new company, the following fields are required:

- Company name
- Company email (unique)
- Phone (optional)
- Address (optional)
- Available forms: Number of form submissions allowed
- Forms to create: Number of form templates allowed
- Max users: Maximum number of collaborators allowed
- Admin name: Name of the company administrator
- Admin email: Email of the company administrator (unique)

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
