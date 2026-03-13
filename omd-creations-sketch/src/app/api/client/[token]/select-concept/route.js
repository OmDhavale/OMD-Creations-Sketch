import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export async function POST(req, { params }) {
  await dbConnect();
  try {
    const { token } = params;
    const { conceptId } = await req.json();

    const project = await Project.findOne({ projectToken: token });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Mark selected concept and update status
    project.concepts.forEach(c => {
      c.selected = c._id.toString() === conceptId;
    });
    
    project.status = 'awaiting_advance';
    await project.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
