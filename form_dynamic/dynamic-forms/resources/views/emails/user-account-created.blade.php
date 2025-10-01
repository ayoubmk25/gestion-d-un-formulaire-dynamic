<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Account Has Been Created</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #333;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .content {
            margin-bottom: 30px;
        }
        .credentials {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        p {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Account Has Been Created</h1>
        </div>

        <div class="content">
            <p>Dear {{ $name }},</p>
            
            <p>Your {{ strtolower($role) }} account has been created in our Form Management System.</p>

            <div class="credentials">
                <h3>Your Login Credentials</h3>
                <p>Email: {{ $email }}</p>
                <p>Password: {{ $password }}</p>
            </div>

            <p>Next Steps:</p>
            <ol>
                <li>Click the button below to login to the system</li>
                <li>Upon first login, you'll be prompted to change your temporary password</li>
                <li>Update your profile information if necessary</li>
            </ol>

            <p><a href="{{ config('app.url') }}/login" class="button">Login to Your Account</a></p>

            <div class="footer">
                <p>Best regards,<br>
                {{ config('app.name') }} Team</p>
                <p>{{ config('app.url') }}</p>
                <p>Support Email: support@{{ config('app.domain') }}</p>
            </div>
        </div>
    </div>
</body>
</html>