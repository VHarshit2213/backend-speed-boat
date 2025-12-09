export function otpTemplate(fullName, otpCode) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Your OTP Code - Speedboat</title>
  </head>

  <body style="margin:0; padding:0; background:#f4f7fb; font-family:Arial, sans-serif;">

    <!-- Outer Wrapper -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f4f7fb; padding:30px 0;">
      <tr>
        <td align="center">

          <!-- Main Card -->
          <table width="600" cellspacing="0" cellpadding="0" 
            style="background:#ffffff; border-radius:12px; overflow:hidden;
                   box-shadow:0 4px 20px rgba(0,0,0,0.08);
                   border-top:4px solid #0e4f9e;">
            
            <!-- Header Section -->
            <tr>
              <td style="background:#eff6ff; padding:24px; text-align:center; border-bottom:1px solid #e5e7eb;">
                <h2 style="margin:0; font-size:22px; color:#0e4f9e;">Speedboat</h2>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding:40px 30px 20px 30px; text-align:center;">
                <h1 style="color:#0e4f9e; margin:0; font-size:24px;">Your OTP Code</h1>
                <p style="color:#4b5563; margin-top:12px; font-size:16px; line-height:1.6;">
                  Hello ${fullName || "there"},<br/>
                  Use the OTP below to verify your request to reset your password.
                </p>
              </td>
            </tr>

            <!-- OTP Box -->
            <tr>
              <td style="padding:0 30px 30px 30px;">
                <table width="100%">
                  <tr>
                    <td style="
                      background:#f9fafb;
                      padding:25px;
                      border-radius:10px;
                      text-align:center;
                      border:1px solid #e5e7eb;">
                      
                      <p style="margin:0; font-size:15px; color:#374151;">
                        Your OTP is valid for <strong>10 minutes</strong>.
                      </p>

                      <div style="margin-top:20px; 
                        font-size:32px; 
                        font-weight:bold; 
                        color:#0e4f9e; 
                        letter-spacing:6px;">
                        ${otpCode}
                      </div>

                      <p style="margin-top:20px; font-size:14px; color:#6b7280;">
                        Please do not share this code with anyone.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#0e4f9e; text-align:center; padding:24px; color:#ffffff; font-size:13px;">
                <p style="margin:0;">© ${new Date().getFullYear()} Speedboat. All rights reserved.</p>
                <p style="margin:8px 0 0 0; opacity: 0.8;">
                  Need help? 
                  <a href="mailto:support@speedboat.com" style="color:#ffffff; text-decoration:underline;">
                    support@speedboat.com
                  </a>
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}
