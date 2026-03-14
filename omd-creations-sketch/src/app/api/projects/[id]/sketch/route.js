import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Sketch from '@/models/Sketch';
import Artist from '@/models/Artist';
import { uploadProjectSketch } from '@/lib/cloudinary';
import { generateProtectedPreview } from '@/lib/imageProcessor';

export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const project = await Project.findById(id).populate('artistId');
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Convert file to buffer for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Prepare for Cloudinary (HD version needs base64 or path)
    const fileUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // 1. Generate the protected preview buffer
    const artist = project.artistId;
    const previewBuffer = await generateProtectedPreview(buffer, {
      artistName: artist.name,
      mandalName: project.mandalName,
      year: project.year,
    });

    // 2. Upload both to Cloudinary
    const { hdUrl, previewUrl } = await uploadProjectSketch(fileUri, previewBuffer);

    const sketch = await Sketch.create({
      projectId: id,
      hdImageUrl: hdUrl,
      previewImageUrl: previewUrl,
    });

    // Automatically update project status to sketch_preview if it was in concept or awaiting_advance
    if (['concept', 'awaiting_advance'].includes(project.status)) {
      project.status = 'sketch_preview';
      await project.save();
    }

    return NextResponse.json(sketch, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
