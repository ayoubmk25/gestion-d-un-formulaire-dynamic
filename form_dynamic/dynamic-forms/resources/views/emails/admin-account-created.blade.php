@component('mail::message')
# Your Administrator Account Has Been Created

Hello {{ $name }},

Your administrator account has been created for your company in our Form Management System.

## Your Login Credentials
- **Email:** {{ $email }}
- **Temporary Password:** {{ $password }}

## Next Steps
1. Click the button below to login to the system
2. Upon first login, you'll be prompted to change your temporary password
3. Update your profile information if necessary

@component('mail::button', ['url' => config('app.url') . '/login'])
Login to Your Account
@endcomponent

## Important Information
- Please change your password immediately after your first login for security purposes
- Keep your credentials confidential
- If you encounter any issues, please contact our support team

Best regards,  
{{ config('app.name') }} Team  
{{ config('app.url') }}  
Support Email: support@{{ config('app.domain') }}
@endcomponent