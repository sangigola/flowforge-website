import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, email, username, phone } = body;

        // Log the contact request (email service will be configured later)
        const contactData = {
            type,
            ...(type === 'google' ? { email } : { username }),
            phone,
            timestamp: new Date().toISOString(),
        };

        console.log('New contact request:', contactData);

        // TODO: Add email service (Resend, SendGrid, etc.) later
        // For now, just acknowledge the request

        return NextResponse.json({
            success: true,
            message: 'Contact request received'
        });

    } catch (error) {
        console.error('Error processing contact request:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process request' },
            { status: 500 }
        );
    }
}
