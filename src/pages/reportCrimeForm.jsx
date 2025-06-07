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
        console.log('Form submit triggered');
        console.log('Form data:', formData);
        
        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            // Basic validation
            if (!formData.fullName || !formData.contactNumber || !formData.email || !formData.description) {
                console.log('Validation failed: missing fields');
                setSubmitMessage('Please fill in all required fields.');
                setIsSubmitting(false);
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                console.log('Validation failed: invalid email');
                setSubmitMessage('Please enter a valid email address.');
                setIsSubmitting(false);
                return;
            }

            // Phone number validation (basic)
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(formData.contactNumber)) {
                console.log('Validation failed: invalid phone');
                setSubmitMessage('Please enter a valid contact number.');
                setIsSubmitting(false);
                return;
            }

            // Check if environment variables are loaded
            if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
                console.error('EmailJS configuration missing');
                console.log('EMAILJS_SERVICE_ID:', EMAILJS_SERVICE_ID);
                console.log('EMAILJS_TEMPLATE_ID:', EMAILJS_TEMPLATE_ID);
                console.log('EMAILJS_PUBLIC_KEY:', EMAILJS_PUBLIC_KEY);
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
            console.log('Using EmailJS Service ID:', EMAILJS_SERVICE_ID);
            console.log('Using EmailJS Template ID:', EMAILJS_TEMPLATE_ID);

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
                throw new Error('Failed to send email - Status: ' + response.status);
            }
            
        } catch (error) {
            console.error('EmailJS Error:', error);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            
            // More specific error messages
            if (error.message.includes('configuration')) {
                setSubmitMessage('❌ System configuration error. Please contact support.');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                setSubmitMessage('❌ Network error. Please check your internet connection and try again.');
            } else if (error.status === 400) {
                setSubmitMessage('❌ Invalid request. Please check your form data and try again.');
            } else if (error.status === 401) {
                setSubmitMessage('❌ Authentication error. Please contact support.');
            } else if (error.status === 403) {
                setSubmitMessage('❌ Permission denied. Please contact support.');
            } else if (error.status === 404) {
                setSubmitMessage('❌ Service not found. Please contact support.');
            } else {
                setSubmitMessage('❌ Failed to submit the report. Error: ' + error.message + '. Please try again or contact us directly at rishabhreceptive@gmail.com');
            }
        } finally {
            console.log('Form submission completed');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="text-center">
                        <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🚨</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-red-600 mb-3">
                            Crime Report Form
                        </h1>
                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                            Please provide accurate information to help us process your report effectively.
                            All information will be kept confidential.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="space-y-8">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label 
                                htmlFor="fullName" 
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Your Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Contact Number */}
                        <div className="space-y-2">
                            <label 
                                htmlFor="contactNumber" 
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Your Contact Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                placeholder="Enter your contact number with country code"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Your Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                placeholder="Enter your email address"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label 
                                htmlFor="description" 
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Describe the Fraud/Crime in Detail <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="8"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-vertical bg-gray-50 focus:bg-white"
                                placeholder="Please provide detailed information about the fraud or crime, including:
• Date and time when it occurred
• Location where it happened
• People involved (if known)
• What exactly happened
• Any financial losses or damages
• Any evidence you have
• Any other relevant details that might help with the investigation"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Submitting Report...</span>
                                    </div>
                                ) : (
                                    'Submit Crime Report'
                                )}
                            </button>
                        </div>

                        {/* Submit Message */}
                        {submitMessage && (
                            <div className={`p-4 rounded-xl border-l-4 ${
                                submitMessage.includes('❌') || submitMessage.includes('Failed') || submitMessage.includes('fill') || submitMessage.includes('valid')
                                    ? 'bg-red-50 text-red-700 border-red-400'
                                    : 'bg-green-50 text-green-700 border-green-400'
                            }`}>
                                <p className="text-sm font-medium leading-relaxed">{submitMessage}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-center mb-3">
                        <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-lg">🛡️</span>
                        </div>
                    </div>
                    <p className="text-sm text-blue-800 font-medium mb-2">
                        Your Privacy & Security Matter
                    </p>
                    <p className="text-xs text-blue-600 leading-relaxed">
                        Your report will be forwarded to the appropriate authorities with utmost confidentiality. 
                        Please ensure all information is accurate and truthful. We will contact you within 24 hours for follow-up.
                    </p>
                </div>

                {/* Emergency Contact */}
                <div className="mt-6 text-center bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                        <strong>Emergency?</strong> If this is an ongoing emergency, please call <strong>100</strong> immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ReportCrimeForm