const conf = {
    appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
    appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
    emailPublicId: String(import.meta.env.VITE_EMAILJS_PUBLIC_KEY),
    emailServiceId:String(import.meta.env.VITE_EMAILJS_SERVICE_ID),
   emailTemplateId: String(import.meta.env.VITE_EMAILJS_TEMPLATE_ID)
}
// there was a name issue with the import.meta.env.VITE_APPWRITE_URL, it was later fixed in debugging video

export default conf