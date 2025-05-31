import React, { useState } from 'react';
import { FiX, FiPaperclip } from 'react-icons/fi';

function PublicForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    content: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setImage(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create form data to send
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('subject', formData.subject);
      submitData.append('content', formData.content);
      if (image) {
        submitData.append('image', image);
      }

      // This is where you would send the data to your backend
      // For demonstration, let's simulate a successful submission
      console.log('Form data to be sent:', {
        ...formData,
        image: image ? image.name : 'No image attached'
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle successful submission
      setSubmitSuccess(true);
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        content: ''
      });
      setImage(null);
      setPreviewUrl(null);

      // Close the form after 2 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Failed to submit news. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the form is not open, don't render anything
  if (!isOpen) return null;

  return (
    <>
      {/* Modal overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal content */}
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="bg-red-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Submit News</h2>
            <button 
              className="text-white hover:text-gray-200"
              onClick={onClose}
              aria-label="Close modal"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Success message */}
          {submitSuccess && (
            <div className="p-4 bg-green-100 text-green-700 border-b border-green-200">
              Your news has been submitted successfully!
            </div>
          )}

          {/* Error message */}
          {submitError && (
            <div className="p-4 bg-red-100 text-red-700 border-b border-red-200">
              {submitError}
            </div>
          )}

          {/* Form content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Your name"
              />
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="your@email.com"
              />
            </div>

            {/* Subject field */}
            <div>
              <label htmlFor="subject" className="block text-gray-700 font-medium mb-1">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="News title/subject"
              />
            </div>

            {/* Image upload */}
            <div>
              <label htmlFor="image" className="block text-gray-700 font-medium mb-1">Image</label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="image-upload"
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <FiPaperclip className="mr-2" />
                  <span>Attach image</span>
                  <input
                    id="image-upload"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {image ? image.name : "No file selected"}
                </span>
              </div>
              
              {/* Image preview */}
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-32 w-auto object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Content field */}
            <div>
              <label htmlFor="content" className="block text-gray-700 font-medium mb-1">Content</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Write your news content here..."
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-red-600 text-white font-medium py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit News'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default PublicForm;