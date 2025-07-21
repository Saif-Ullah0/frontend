// frontend/src/components/FastEnrollment.tsx
"use client";

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface FastEnrollmentProps {
  course: {
    id: number;
    title: string;
    price: number;
  };
  onSuccess: (enrollment: any) => void;
}

// Card form component
function CardForm({ course, onSuccess }: FastEnrollmentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError) {
        setError(pmError.message || 'Payment method creation failed');
        setProcessing(false);
        return;
      }

      // Fast enrollment with payment method
      const response = await fetch('http://localhost:5000/api/payment/fast-enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: course.id,
          paymentMethodId: paymentMethod.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.enrolled) {
          // Already enrolled - show friendly message
          setError('You are already enrolled in this course!');
          setTimeout(() => {
            window.location.href = result.redirectUrl || `/courses/${course.id}/modules`;
          }, 2000);
          return;
        }
        throw new Error(result.error || 'Enrollment failed');
      }

      if (result.requiresAction) {
        // Handle 3D Secure
        const { error: confirmError } = await stripe.confirmCardPayment(
          result.paymentIntent.client_secret
        );

        if (confirmError) {
          setError(confirmError.message || '3D Secure authentication failed');
          setProcessing(false);
          return;
        }

        // Confirm enrollment after 3D Secure
        const confirmResponse = await fetch('http://localhost:5000/api/payment/confirm-enrollment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            courseId: course.id,
          }),
        });

        const confirmResult = await confirmResponse.json();
        if (confirmResult.success) {
          onSuccess(confirmResult);
        } else {
          setError('Enrollment confirmation failed');
        }
      } else if (result.success) {
        // Direct success
        onSuccess(result);
      }

    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {processing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay $${course.price} USD`
        )}
      </button>
    </form>
  );
}

// Main component
export default function FastEnrollment({ course, onSuccess }: FastEnrollmentProps) {
  const [showPayment, setShowPayment] = useState(false);

  // Handle free courses
  const handleFreeEnrollment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payment/fast-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: course.id }),
      });

      const result = await response.json();

      if (result.enrolled) {
        alert('You are already enrolled in this course!');
        window.location.href = `/courses/${course.id}/modules`;
        return;
      }

      if (result.success) {
        onSuccess(result);
      } else {
        alert(result.error || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Free enrollment error:', error);
      alert('Something went wrong');
    }
  };

  if (course.price === 0) {
    return (
      <button
        onClick={handleFreeEnrollment}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        Enroll for Free
      </button>
    );
  }

  if (!showPayment) {
    return (
      <button
        onClick={() => setShowPayment(true)}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Enroll for ${course.price}
      </button>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Complete Your Enrollment</h3>
          <p className="text-gray-600">Course: {course.title} - ${course.price} USD</p>
        </div>
        <CardForm course={course} onSuccess={onSuccess} />
        <button
          onClick={() => setShowPayment(false)}
          className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </Elements>
  );
}