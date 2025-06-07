import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

function ReportCrimeForm() {
    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        email: '',
        description: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    // EmailJS configuration from environment variables
    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');

        // Basic validation
        if (!formData.fullName || !formData.contactNumber || !formData.email || !formData.description) {
            setSubmitMessage('Please fill in all required fields.');
            setIsSubmitting(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setSubmitMessage('Please enter a valid email address.');
            setIsSubmitting(false);
            return;
        }

        // Phone number validation (basic)
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(formData.contactNumber)) {
            setSubmitMessage('Please enter a valid contact number.');
            setIsSubmitting(false);
            return;
        }

        try {
            // Check if environment variables are loaded
            if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
                throw new Error('EmailJS configuration missing. Please check environment variables.');
            }

            // Prepare template parameters for EmailJS
            const templateParams = {
                to_email: 'rishabhreceptive@gmail.com',
                from_name: formData.fullName,
                from_email: formData.email,
                contact_number: formData.contactNumber,
                subject: 'Crime Report Submission',
                message: formData.description,
                submitted_date: new Date().toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            };

            console.log('Sending email with params:', templateParams);

            // Send email using EmailJS
            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );

            console.log('EmailJS Response:', response);
            
            if (response.status === 200) {
                setSubmitMessage('✅ Crime report submitted successfully! We have received your report and will contact you within 24 hours. Your report ID: CR-' + Date.now());
                
                // Reset form after successful submission
                setFormData({
                    fullName: '',
                    contactNumber: '',
                    email: '',
                    description: ''
                });
            } else {
                throw new Error('Failed to send email');
            }
            
        } catch (error) {
            console.error('EmailJS Error:', error);
            
            // More specific error messages
            if (error.message.includes('configuration')) {
                setSubmitMessage('❌ System configuration error. Please contact support.');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                setSubmitMessage('❌ Network error. Please check your internet connection and try again.');
            } else {
                setSubmitMessage('❌ Failed to submit the report. Please try again or contact us directly at rishabhreceptive@gmail.com');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-md mx-auto sm:max-w-lg lg:max-w-2xl">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <span className="text-2xl">🚨</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Crime Report Form
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Please provide accurate information. All details will be kept confidential.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Full Name */}
                        <div>
                            <label 
                                htmlFor="fullName" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Contact Number */}
                        <div>
                            <label 
                                htmlFor="contactNumber" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Contact Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                                placeholder="Enter your contact number"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                                placeholder="Enter your email address"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label 
                                htmlFor="description" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Describe the Crime/Fraud <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="6"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-vertical"
                                placeholder="Please provide detailed information including date, time, location, people involved, and any other relevant details..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Submitting...</span>
                                </div>
                            ) : (
                                'Submit Report'
                            )}
                        </button>

                        {/* Submit Message */}
                        {submitMessage && (
                            <div className={`p-3 sm:p-4 rounded-md text-sm ${
                                submitMessage.includes('❌') || submitMessage.includes('Failed') || submitMessage.includes('fill') || submitMessage.includes('valid')
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                                <p>{submitMessage}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-6 space-y-4">
                    {/* Security Note */}
                    {/* <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start space-x-3">
                            <span className="text-blue-600 text-lg">🛡️</span>
                            <div>
                                <p className="text-sm font-medium text-blue-900">Your Privacy Matters</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    All information is confidential. We'll contact you within 24 hours.
                                </p>
                            </div>
                        </div>
                    </div> */}

                    {/* Emergency Note */}
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-start space-x-3">
                            <span className="text-yellow-600 text-lg">⚠️</span>
                            <div>
                                <p className="text-sm font-medium text-yellow-900">Emergency?</p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    If this is an ongoing emergency, please call <strong>100</strong> immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportCrimeForm;