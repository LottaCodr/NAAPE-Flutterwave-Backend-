import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            if (process.env.NODE_ENV !== "production") {
                console.info(`[EMAIL] Skipped "${subject}" to ${to}: SENDGRID_API_KEY is not configured`);
                return;
            }
            throw new Error("Email service is not configured");
        }
        console.log(`[EMAIL] Attempting to send email to: ${to}`);
        console.log(`[EMAIL] Subject: ${subject}`);
        
        const msg = {
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL || "noreply@naape.ng",
                name: "NAAPE"
            },
            subject,
            text,
            html: html || text.replace(/\n/g, "<br>"), // Convert text to basic HTML if no HTML provided
        };

        await sgMail.send(msg);
        console.log(`[EMAIL] ✓ Email sent successfully to ${to}`);
    } catch (error: any) {
        console.error(`[EMAIL] ✗ SendGrid email error for ${to}:`, error);
        if (error.response) {
            console.error("[EMAIL] SendGrid error details:", error.response.body);
        }
        throw error;
    }
};

export default sendEmail;
