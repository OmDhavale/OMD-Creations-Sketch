import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Sketch from '@/models/Sketch';
import RevisionRequest from '@/models/RevisionRequest';
import Payment from '@/models/Payment';

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const sketches = await Sketch.find({ projectId: id }).sort({ uploadedAt: -1 });
    const revisions = await RevisionRequest.find({ projectId: id }).sort({ createdAt: -1 });
    const payments = await Payment.find({ projectId: id }).sort({ uploadedAt: -1 });

    return NextResponse.json({
      project,
      sketches,
      revisions,
      payments,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const body = await req.json();

  try {
    const project = await Project.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
