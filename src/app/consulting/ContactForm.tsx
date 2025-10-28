
'use client';

import { FC, useState, useTransition } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { handleSendEmail } from './actions'; // I will create this action next
import Button from '@/components/Button';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  company: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

const ContactForm: FC = () => {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    setIsSuccess(false);
    setIsError(false);
    startTransition(async () => {
      const result = await handleSendEmail(data);
      if (result.success) {
        setIsSuccess(true);
        reset();
      } else {
        setIsError(true);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-medium text-green-800">Thank You!</h3>
        <p className="text-green-700">Your message has been sent successfully. We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="sr-only">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Your Name"
          {...register('name')}
          className={`w-full px-4 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Your Email"
          {...register('email')}
          className={`w-full px-4 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="company" className="sr-only">Company (Optional)</label>
        <input
          id="company"
          type="text"
          placeholder="Your Company (Optional)"
          {...register('company')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="message" className="sr-only">Message</label>
        <textarea
          id="message"
          placeholder="How can we help you?"
          rows={4}
          {...register('message')}
          className={`w-full px-4 py-2 border rounded-md ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
        ></textarea>
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send Message'}
      </Button>
      {isError && (
        <p className="text-red-500 text-sm mt-2 text-center">
          Something went wrong. Please try again or contact us directly.
        </p>
      )}
    </form>
  );
};

export default ContactForm;
