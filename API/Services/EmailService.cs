using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using API.Entities.Email;
using API.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace API.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = body
            };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            try
            {
                await smtp.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                // Log error
                Console.WriteLine($"[EmailService] SendEmailAsync error: {ex}");
    throw new InvalidOperationException($"Failed to send email: {ex.Message}");
            }
        }

        public async Task SendEmailConfirmationAsync(string toEmail, string userId,string token)
        {
            var frontendUrl = "http://localhost:4200";
            var encodeToken = Uri.EscapeDataString(token);
            var confirmationLink = $"{frontendUrl}/confirm-email?userId={userId}&token={encodeToken}"; 
            
            var subject = "Xác nhận địa chỉ Email của bạn";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #333;'>Xác nhận Email</h2>
                        <p>Cảm ơn bạn đã đăng ký tài khoản!</p>
                        <p>Vui lòng nhấp vào nút bên dưới để xác nhận địa chỉ email của bạn:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{confirmationLink}' 
                            style='background-color: #4CAF50; 
                                    color: white; 
                                    padding: 12px 30px; 
                                    text-decoration: none; 
                                    border-radius: 4px;
                                    display: inline-block;'>
                                Xác nhận Email
                            </a>
                        </div>
                        <p style='color: #666; font-size: 14px;'>
                            Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
                        </p>
                        <p style='color: #999; font-size: 12px; margin-top: 30px;'>
                            Link sẽ hết hạn sau 24 giờ.
                        </p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body);
        }
    }
}