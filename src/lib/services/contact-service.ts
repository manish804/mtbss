import { ContactPageContent, ContactFormData, ContactFormSubmissionResult } from '@/lib/types/contact-page';
import { contactFormSubmissionSchema } from '@/lib/validation/contact-form-schemas';
import { PrismaClient } from '@prisma/client';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

export class ContactService {
  /**
   * Validate contact form data
   */
  static validateContactForm(data: ContactFormData): { isValid: boolean; errors?: Record<string, string> } {
    try {
      contactFormSubmissionSchema.parse(data);
      return { isValid: true };
    } catch (error: unknown) {
      const errors: Record<string, string> = {};
      if (error instanceof ZodError) {
        error.errors.forEach((err) => {
          const field = err.path[0];
          if (typeof field === 'string') {
            errors[field] = err.message;
          }
        });
      }
      return { isValid: false, errors };
    }
  }

  /**
   * Submit contact form
   */
  static async submitContactForm(data: ContactFormData): Promise<ContactFormSubmissionResult> {

    const validation = this.validateContactForm(data);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Please correct the errors in the form',
        errors: validation.errors
      };
    }

    try {
      // Store in database
      await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          company: data.company || null,
          subject: data.serviceType || null,
          message: data.message,
          status: 'NEW',
        },
      });

      // Send email notification
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002');

      try {
        const response = await fetch(`${baseUrl}/api/emails/contact-form`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          console.warn('Email sending failed, but message stored in database');
        }
      } catch (emailError) {
        console.warn('Email sending failed, but message stored in database:', emailError);
      }

      return {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.'
      };
    } catch (error) {
      console.error('Contact form submission error:', error);
      return {
        success: false,
        message: 'There was an error submitting your message. Please try again.'
      };
    }
  }

  /**
   * Get contact page configuration
   */
  static async getContactPageConfig(): Promise<ContactPageContent | null> {
    try {
      const response = await fetch('/api/json-pages/contact.json');
      if (!response.ok) {
        throw new Error('Failed to fetch contact page configuration');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching contact page config:', error);
      return null;
    }
  }

  /**
   * Update contact page configuration
   */
  static async updateContactPageConfig(config: ContactPageContent): Promise<boolean> {
    try {
      const response = await fetch('/api/json-pages/contact.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating contact page config:', error);
      return false;
    }
  }

  /**
   * Format business hours for display
   */
  static formatBusinessHours(businessHours: Array<{ days: string; hours: string }>): string {
    return businessHours
      .map(hour => `${hour.days}: ${hour.hours}`)
      .join('\n');
  }

  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (basic validation)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}
