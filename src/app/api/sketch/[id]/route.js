import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sketch from '@/models/Sketch';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const sketch = await Sketch.findById(id);
    if (!sketch) {
      return NextResponse.json({ error: 'Sketch not found' }, { status: 404 });
    }

    // Delete from Cloudinary if public IDs exist
    if (sketch.hdPublicId) {
      await deleteFromCloudinary(sketch.hdPublicId);
    }
    if (sketch.previewPublicId) {
      await deleteFromCloudinary(sketch.previewPublicId);
    }

    // Delete from MongoDB
    await Sketch.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Sketch deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const { isPublic } = await req.json();
    const sketch = await Sketch.findByIdAndUpdate(id, { isPublic }, { new: true });
    
    if (!sketch) {
      return NextResponse.json({ error: 'Sketch not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Visibility updated', sketch });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
