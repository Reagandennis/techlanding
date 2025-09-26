import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { syncUserWithDatabase, determineUserRole } from '@/lib/user-db-sync';

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with ID: ${id} and type of: ${eventType}`);
  console.log('Webhook body:', body);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt);
        break;
      case 'user.updated':
        await handleUserUpdated(evt);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt);
        break;
      case 'organizationMembership.created':
        await handleOrganizationMembershipCreated(evt);
        break;
      case 'organizationMembership.updated':
        await handleOrganizationMembershipUpdated(evt);
        break;
      default:
        console.log('Unhandled webhook event type:', eventType);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', {
      status: 500
    });
  }

  return NextResponse.json({ message: 'Webhook processed successfully' });
}

async function handleUserCreated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;
  
  const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id);
  
  if (!primaryEmail) {
    console.error('❌ No primary email found for user:', id);
    return;
  }

  try {
    // Create mock ClerkUser object for sync function
    const mockClerkUser = {
      id,
      emailAddresses: [{ emailAddress: primaryEmail.email_address, id: evt.data.primary_email_address_id }],
      primaryEmailAddressId: evt.data.primary_email_address_id,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
      username
    } as any;

    // Use enhanced sync function with smart role assignment
    const result = await syncUserWithDatabase(mockClerkUser);
    
    console.log(`✅ User ${result.isNewUser ? 'created' : 'updated'} in database:`, {
      clerkId: id,
      role: result.user.role,
      email: result.user.email
    });
  } catch (error) {
    // Handle case where user might already exist
    if (error.code === 'P2002') {
      console.log('⚠️ User already exists in database:', id);
    } else {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }
}

async function handleUserUpdated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;
  
  const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id);
  
  if (!primaryEmail) {
    console.error('No primary email found for user:', id);
    return;
  }

  try {
    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: primaryEmail.email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim() || username || primaryEmail.email_address,
        firstName: first_name,
        lastName: last_name,
        image: image_url,
      }
    });
    
    console.log('User updated in database:', id);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function handleUserDeleted(evt: WebhookEvent) {
  const { id } = evt.data;
  
  try {
    // Soft delete by setting deletedAt timestamp
    await prisma.user.update({
      where: { clerkId: id },
      data: {
        deletedAt: new Date(),
      }
    });
    
    console.log('User soft deleted in database:', id);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

async function handleOrganizationMembershipCreated(evt: WebhookEvent) {
  const { organization, public_user_data } = evt.data;
  
  // Handle organization-based role assignment
  // This is useful for enterprise/institutional accounts
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: public_user_data.user_id }
    });
    
    if (user) {
      // You can implement organization-based role logic here
      // For example, if user joins "instructors" organization, make them instructor
      const orgName = organization.name?.toLowerCase();
      let newRole = UserRole.STUDENT;
      
      if (orgName?.includes('instructor') || orgName?.includes('teacher')) {
        newRole = UserRole.INSTRUCTOR;
      } else if (orgName?.includes('admin')) {
        newRole = UserRole.ADMIN;
      }
      
      if (newRole !== user.role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: newRole }
        });
        
        console.log(`User role updated to ${newRole} for organization:`, organization.name);
      }
    }
  } catch (error) {
    console.error('Error handling organization membership:', error);
    throw error;
  }
}

async function handleOrganizationMembershipUpdated(evt: WebhookEvent) {
  // Handle role changes within organizations
  await handleOrganizationMembershipCreated(evt); // Reuse the same logic
}