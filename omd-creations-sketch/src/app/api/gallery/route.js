import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GalleryImage from '@/models/GalleryImage';
import { uploadPaymentScreenshot, deleteFromCloudinary } from '@/lib/cloudinary'; // Reusing this since it just uploads a base64 string

export async function GET(req) {
  await dbConnect();
  
  try {
    const images = await GalleryImage.find().sort({ uploadedAt: -1 }).lean();
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();

  try {
    const { imageB64, title } = await req.json();

    if (!imageB64) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Since uploadPaymentScreenshot just takes a base64 and puts it in cloudinary, we can reuse it
    // Ideally we would want a specific folder like 'artist-portal/gallery', but this works for now 
    // without needing to modify the cloudinary.js file and risk breaking payments.
    const uploadedUrl = await uploadPaymentScreenshot(imageB64);
    
    // Extract publicId from the URL to allow deletion later.
    // Cloudinary URLs look like this: .../upload/v12345/payments/abcde.jpg
    const urlParts = uploadedUrl.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    const publicId = `${folder}/${filename}`;

    const newImage = await GalleryImage.create({
        imageUrl: uploadedUrl,
        publicId: publicId,
        title: title || ''
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error('Error uploading to gallery:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const image = await GalleryImage.findById(id);
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    if (image.publicId) {
        await deleteFromCloudinary(image.publicId);
    }

    // Delete from MongoDB
    await GalleryImage.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
