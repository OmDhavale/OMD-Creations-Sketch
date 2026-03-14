import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import RevisionRequest from '@/models/RevisionRequest';

export async function POST(req) {
  await dbConnect();

  try {
    const { projectId, message, type = 'none' } = await req.json();

    if (!projectId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Determine if this is a free or paid revision by counting existing records
    const freeRevisionCount = await RevisionRequest.countDocuments({ 
        projectId, 
        isPaid: false 
    });
    
    const isFree = freeRevisionCount < project.revisionLimit;
    const isPaid = !isFree;

    // Pricing
    const prices = { none: 0, small: 20, medium: 50, large: 100, xl: 200, xxl: 500 };
    const amount = isPaid ? (prices[type] || 0) : 0;

    const revision = await RevisionRequest.create({
      projectId,
      message,
      type: isPaid ? type : 'none',
      isPaid,
      amount,
      paymentStatus: isPaid ? 'pending_payment' : 'none'
    });

    return NextResponse.json(revision, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const { id, status, paymentMode, screenshotUrl } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Revision ID is required' }, { status: 400 });
    }

    const revision = await RevisionRequest.findById(id);
    if (!revision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    // Artist Approving/Rejecting
    if (status === 'approved' || status === 'rejected') {
      revision.paymentStatus = status;
      await revision.save();
      return NextResponse.json(revision);
    }

    // Mandal submmitting payment
    if (paymentMode) {
      revision.paymentMode = paymentMode;
      revision.screenshotUrl = screenshotUrl;
      revision.paymentStatus = 'pending_approval';
      await revision.save();
      return NextResponse.json(revision);
    }

    return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
