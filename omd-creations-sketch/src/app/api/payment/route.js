import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Payment from '@/models/Payment';
import { uploadPaymentScreenshot } from '@/lib/cloudinary';

export async function POST(req) {
  await dbConnect();

  let projectId, type, paymentMode;

  try {
    const formData = await req.formData();
    projectId = formData.get('projectId');
    type = formData.get('type');
    paymentMode = formData.get('paymentMode') || 'upi';
    const file = formData.get('file');

    if (!projectId || projectId === 'undefined' || projectId === 'null') {
      return NextResponse.json({ error: 'Invalid project ID provided' }, { status: 400 });
    }

    if (!projectId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      console.error("Project not found:", projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log("Processing payment submission:", { projectId, type, paymentMode, hasFile: !!file });

    let screenshotUrl = "";
    if (paymentMode === 'upi') {
      if (!file) {
        return NextResponse.json({ error: 'Screenshot required for UPI payment' }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileUri = `data:${file.type};base64,${buffer.toString('base64')}`;
      screenshotUrl = await uploadPaymentScreenshot(fileUri);
    }

    const paymentData = {
      projectId: project._id,
      type,
      paymentMode,
      screenshotUrl,
      status: 'pending',
    };

    console.log("Attempting to create payment record:", paymentData);
    const payment = await Payment.create(paymentData);
    console.log("Payment record created successfully:", payment._id);

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Payment POST Error detail:", {
      message: error.message,
      stack: error.stack,
      projectId,
      type,
      paymentMode
    });
    return NextResponse.json({ 
      error: error.message,
      details: "Error in POST /api/payment",
      context: { type, paymentMode, projectId }
    }, { status: 500 });
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
    console.error("Payment PATCH Error:", error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack,
      details: "Error in PATCH /api/payment"
    }, { status: 500 });
  }
}
