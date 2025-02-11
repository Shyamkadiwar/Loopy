import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload an image
export async function uploadImage(filePath: string) {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        console.log('Image uploaded successfully:', result);
        return result.url; // or other properties like result.public_id
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
}