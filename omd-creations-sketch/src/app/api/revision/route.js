import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import RevisionRequest from '@/models/RevisionRequest';

export async function POST(req) {
  await dbConnect();

  try {
    const { projectId, message } = await req.json();

    if (!projectId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.revisionsUsed >= project.revisionLimit) {
      return NextResponse.json({ error: 'Revision limit reached' }, { status: 400 });
    }

    const revision = await RevisionRequest.create({
      projectId,
      message,
    });

    project.revisionsUsed += 1;
    await project.save();

    return NextResponse.json(revision, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
