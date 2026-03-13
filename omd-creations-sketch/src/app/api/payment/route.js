import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Payment from '@/models/Payment';
import { uploadPaymentScreenshot } from '@/lib/cloudinary';

export async function POST(req) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const projectId = formData.get('projectId');
    const type = formData.get('type');
    const file = formData.get('file');

    if (!projectId || !file || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const screenshotUrl = await uploadPaymentScreenshot(fileUri);

    const payment = await Payment.create({
      projectId,
      type,
      screenshotUrl,
      status: 'pending',
    });

    // Update project status based on payment type
    if (type === 'advance' && project.status === 'awaiting_advance') {
      // Keep in awaiting_advance until approved? Or move to sketch?
      // For now, leave status change to admin approval.
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Admin can PATCH payment to approve/reject
export async function PATCH(req) {
  await dbConnect();
  try {
    const { id, status } = await req.json();
    const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
    
    // If advance approved, move project to sketch_preview (if it was awaiting advance)
    if (status === 'approved' && payment.type === 'advance') {
      const project = await Project.findById(payment.projectId);
      if (project.status === 'awaiting_advance') {
        project.status = 'sketch_preview';
        await project.save();
      }
    }
    
    // If final approved, move project to completed
    if (status === 'approved' && payment.type === 'final') {
        const project = await Project.findById(payment.projectId);
        project.status = 'completed';
        await project.save();
    }

    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
