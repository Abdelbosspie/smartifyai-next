import nodemailer from "nodemailer";

export async function POST(req) {
  const body = await req.json();
  const { name, email, company, industry, projectType, budget, message } = body;

  // Create the transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // your Gmail App Password (not your real password)
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER, // sends it to you
      subject: `New SmartifyAI Inquiry from ${name}`,
      text: `
New Inquiry from SmartifyAI Contact Form:

Name: ${name}
Email: ${email}
Company: ${company}
Industry: ${industry}
Project Type: ${projectType}
Budget: ${budget}

Message:
${message}
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
}
