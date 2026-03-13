import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Sketch from '@/models/Sketch';
import Artist from '@/models/Artist';
import { uploadSketch } from '@/lib/cloudinary';

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

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const artist = project.artistId;
    const { hdUrl, previewUrl } = await uploadSketch(fileUri, {
      artistName: artist.name,
      mandalName: project.mandalName,
      year: project.year,
    });

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
