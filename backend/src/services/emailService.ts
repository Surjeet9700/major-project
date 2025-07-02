import { Resend } from 'resend';

// Use environment variable for Resend API key, with fallback for free testing
const resendApiKey = process.env.RESEND_API_KEY ||;
const resend = new Resend(resendApiKey);

interface BookingDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  bookingId: string;
  language: 'en' | 'hi';
}

export class EmailService {
  async sendBookingConfirmation(bookingDetails: BookingDetails): Promise<{ success: boolean; error?: string }> {
    try {
      const { customerName, customerEmail, customerPhone, service, date, time, bookingId, language } = bookingDetails;
      
      const subject = language === 'hi' 
        ? `युवा डिजिटल स्टूडियो - बुकिंग कन्फर्मेशन (${bookingId})`
        : `Yuva Digital Studio - Booking Confirmation (${bookingId})`;

      const htmlContent = this.generateBookingEmailHTML(bookingDetails);

      await resend.emails.send({
        from: 'Yuva Digital Studio <noreply@yuva-digital-studio.com>',
        to: [customerEmail],
        subject: subject,
        html: htmlContent,
      });

      console.log(`📧 Booking confirmation email sent to ${customerEmail} for booking ${bookingId}`);
      return { success: true };

    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  private generateBookingEmailHTML(bookingDetails: BookingDetails): string {
    const { customerName, customerPhone, service, date, time, bookingId, language } = bookingDetails;
    
    if (language === 'hi') {
      return `
        <!DOCTYPE html>
        <html lang="hi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>बुकिंग कन्फर्मेशन</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .contact-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 बुकिंग कन्फर्म!</h1>
              <p>युवा डिजिटल स्टूडियो में आपका स्वागत है</p>
            </div>
            
            <div class="content">
              <h2>नमस्ते ${customerName}!</h2>
              <p>आपकी बुकिंग सफलतापूर्वक कन्फर्म हो गई है। नीचे आपकी बुकिंग की विस्तृत जानकारी दी गई है:</p>
              
              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">बुकिंग ID:</span>
                  <span class="detail-value">${bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">सेवा:</span>
                  <span class="detail-value">${service}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">दिनांक:</span>
                  <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">समय:</span>
                  <span class="detail-value">${time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">फोन नंबर:</span>
                  <span class="detail-value">${customerPhone}</span>
                </div>
              </div>
              
              <div class="contact-info">
                <h3>📞 संपर्क जानकारी</h3>
                <p><strong>युवा डिजिटल स्टूडियो</strong></p>
                <p>फोन: +91-XXXXXXXXXX</p>
                <p>ईमेल: info@yuva-digital-studio.com</p>
                <p>पता: [स्टूडियो का पता]</p>
              </div>
              
              <h3>📋 महत्वपूर्ण नोट्स:</h3>
              <ul>
                <li>कृपया अपनी बुकिंग से 15 मिनट पहले पहुंचें</li>
                <li>अपनी बुकिंग के लिए इस ईमेल को सुरक्षित रखें</li>
                <li>कोई भी बदलाव के लिए हमें कॉल करें</li>
                <li>बुकिंग रद्द करने के लिए 24 घंटे पहले सूचित करें</li>
              </ul>
              
              <p>धन्यवाद! हम आपकी सेवा में तत्पर हैं।</p>
            </div>
            
            <div class="footer">
              <p>यह एक स्वचालित ईमेल है। कृपया इसका जवाब न दें।</p>
              <p>&copy; 2024 युवा डिजिटल स्टूडियो। सर्वाधिकार सुरक्षित।</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .contact-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Welcome to Yuva Digital Studio</p>
            </div>
            
            <div class="content">
              <h2>Hello ${customerName}!</h2>
              <p>Your booking has been successfully confirmed. Below are the details of your booking:</p>
              
              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">${bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${service}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone Number:</span>
                  <span class="detail-value">${customerPhone}</span>
                </div>
              </div>
              
              <div class="contact-info">
                <h3>📞 Contact Information</h3>
                <p><strong>Yuva Digital Studio</strong></p>
                <p>Phone: +91-XXXXXXXXXX</p>
                <p>Email: info@yuva-digital-studio.com</p>
                <p>Address: [Studio Address]</p>
              </div>
              
              <h3>📋 Important Notes:</h3>
              <ul>
                <li>Please arrive 15 minutes before your booking time</li>
                <li>Keep this email safe for your booking reference</li>
                <li>Call us for any changes to your booking</li>
                <li>Notify us 24 hours in advance for cancellations</li>
              </ul>
              
              <p>Thank you! We look forward to serving you.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 Yuva Digital Studio. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  }
}

export const emailService = new EmailService(); 
