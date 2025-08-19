import nodemailer from "nodemailer";

// Create email transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send OTP email for password reset
export const sendPasswordResetOTP = async (email, otp, username) => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - CrackIt</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
        }
        .otp-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 CrackIt</h1>
          <p>Password Reset Request</p>
        </div>
        
        <div class="content">
          <h2>Hello ${username}!</h2>
          
          <p>We received a request to reset your password for your CrackIt account. Use the OTP code below to proceed with your password reset:</p>
          
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px;">Your OTP Code:</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 12px;">This code expires in 15 minutes</p>
          </div>
          
          <p>To reset your password:</p>
          <ol>
            <li>Return to the CrackIt password reset page</li>
            <li>Enter the OTP code above</li>
            <li>Create your new password</li>
          </ol>
          
          <div class="warning">
            <strong>Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This OTP is valid for 15 minutes only</li>
              <li>Don't share this code with anyone</li>
              <li>If you didn't request this reset, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
          
          <p>Happy coding!<br>
          <strong>The CrackIt Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} CrackIt. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Password Reset OTP - CrackIt",
      html: htmlContent,
      text: `Hello ${username},\n\nYour password reset OTP code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this reset, please ignore this email.\n\nBest regards,\nThe CrackIt Team`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Password reset OTP email sent successfully:",
      result.messageId
    );
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending password reset OTP email:", error);
    throw error;
  }
};

// Send welcome email notification
export const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CrackIt!</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
        }
        .feature-box {
          background-color: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 15px 0;
          border-radius: 0 5px 5px 0;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Welcome to CrackIt!</h1>
          <p>Your Coding Journey Starts Here</p>
        </div>
        
        <div class="content">
          <h2>Hello ${username}!</h2>
          
          <p>Welcome to CrackIt - the ultimate platform for coding practice and skill development! We're excited to have you join our community of passionate developers.</p>
          
          <h3>🎯 What can you do on CrackIt?</h3>
          
          <div class="feature-box">
            <strong>🧩 DSA Practice</strong><br>
            Solve challenging Data Structures & Algorithms problems to sharpen your problem-solving skills.
          </div>
          
          <div class="feature-box">
            <strong>🏆 Earn Badges</strong><br>
            Unlock achievements and earn badges as you progress through different difficulty levels.
          </div>
          
          <div class="feature-box">
            <strong>📊 Track Progress</strong><br>
            Monitor your coding streak, points earned, and overall performance with detailed analytics.
          </div>
          
          <div class="feature-box">
            <strong>💼 Interview Prep</strong><br>
            Practice with real interview questions and get ready for your dream job.
          </div>
          
          <p>Ready to start your coding journey? Click the button below to explore the platform!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.CORS_ORIGIN
            }/dashboard" class="btn">🚀 Start Coding Now</a>
          </div>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          
          <p>Happy coding!<br>
          <strong>The CrackIt Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} CrackIt. All rights reserved.</p>
          <p>Follow us for updates and coding tips!</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🚀 Welcome to CrackIt - Let's Start Coding!",
      html: htmlContent,
      text: `Hello ${username},\n\nWelcome to CrackIt! We're excited to have you join our community.\n\nStart your coding journey at: ${process.env.CORS_ORIGIN}/dashboard\n\nHappy coding!\nThe CrackIt Team`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    // Don't throw error for welcome email as it's not critical
    return { success: false, error: error.message };
  }
};

// Send badge earned notification email
export const sendBadgeNotificationEmail = async (email, username, badge) => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🏆 Badge Earned - CrackIt</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .badge-showcase {
          background: linear-gradient(135deg, ${badge.color}20 0%, ${
      badge.color
    }10 100%);
          border: 2px solid ${badge.color};
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .badge-icon {
          font-size: 64px;
          margin-bottom: 15px;
        }
        .badge-name {
          font-size: 24px;
          font-weight: bold;
          color: ${badge.color};
          margin-bottom: 10px;
        }
        .content {
          padding: 40px 30px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>You've Earned a New Badge</p>
        </div>
        
        <div class="content">
          <h2>Amazing work, ${username}!</h2>
          
          <p>We're thrilled to let you know that you've just earned a new badge on CrackIt! Your dedication and hard work are paying off.</p>
          
          <div class="badge-showcase">
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            <p style="color: #666; margin: 0;">${badge.description}</p>
          </div>
          
          <p>This achievement represents your commitment to continuous learning and skill development. Keep up the excellent work!</p>
          
          <h3>🔥 Keep the Momentum Going!</h3>
          <ul>
            <li>Share your achievement with friends and colleagues</li>
            <li>Check out more challenging problems</li>
            <li>Work towards your next badge</li>
            <li>Maintain your coding streak</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.CORS_ORIGIN
            }/badges" class="btn">🏆 View All My Badges</a>
          </div>
          
          <p>Ready for your next challenge? There are many more badges waiting to be earned!</p>
          
          <p>Keep coding and keep growing!<br>
          <strong>The CrackIt Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} CrackIt. All rights reserved.</p>
          <p>You're receiving this because you earned a badge on CrackIt.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🏆 Badge Earned: ${badge.name} - CrackIt`,
      html: htmlContent,
      text: `Congratulations ${username}!\n\nYou've earned the "${badge.name}" badge on CrackIt!\n\n${badge.description}\n\nView all your badges at: ${process.env.CORS_ORIGIN}/badges\n\nKeep up the great work!\nThe CrackIt Team`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Badge notification email sent successfully:",
      result.messageId
    );
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending badge notification email:", error);
    // Don't throw error for notification emails as they're not critical
    return { success: false, error: error.message };
  }
};

export default {
  sendPasswordResetOTP,
  sendWelcomeEmail,
  sendBadgeNotificationEmail,
};
