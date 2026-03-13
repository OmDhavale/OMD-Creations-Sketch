import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Sketch from '@/models/Sketch';
import Payment from '@/models/Payment';
import Artist from '@/models/Artist';

export async function GET(req, { params }) {
  await dbConnect();
  const { token } = await params;

  try {
    const project = await Project.findOne({ projectToken: token }).populate('artistId');
    if (!project) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    }

    const sketches = await Sketch.find({ projectId: project._id }).sort({ uploadedAt: -1 });
    const payments = await Payment.find({ projectId: project._id }).sort({ uploadedAt: -1 });

    // In a real app, we would strip data from project based on status
    // e.g. HD URL is hidden until status is completed.
    // Our Sketch model separate HD and Preview, we only send preview to client
    // unless the project is completed.

    const clientSketches = sketches.map(s => ({
      _id: s._id,
      previewImageUrl: s.previewImageUrl,
      // Only include HD if completed
      hdImageUrl: project.status === 'completed' ? s.hdImageUrl : null,
      uploadedAt: s.uploadedAt,
    }));

    return NextResponse.json({
      project,
      sketches: clientSketches,
      payments,
      artist: {
        name: project.artistId.name,
        studioName: project.artistId.studioName,
        upiId: project.artistId.upiId
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
