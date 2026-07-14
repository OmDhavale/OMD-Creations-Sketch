import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Artist from '@/models/Artist';
import { nanoid } from 'nanoid';

// Helper to get or create a default artist for this prototype
async function getDefaultArtist() {
  let artist = await Artist.findOne();
  if (!artist) {
    artist = await Artist.create({
      name: 'OMD Creations',
      email: 'omd.creations@example.com',
      upiId: 'omd@upi',
      studioName: 'OMD Art Studio',
    });
  }
  return artist;
}

export async function GET() {
  await dbConnect();
  try {
    const artist = await getDefaultArtist();
    const projects = await Project.find({ artistId: artist._id }).sort({ createdAt: -1 });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const artist = await getDefaultArtist();
    const body = await req.json();
    const { mandalName, contactPerson, phone, year, theme, concepts, totalAmount, advanceAmount, revisionLimit } = body;
    
    const project = await Project.create({
      artistId: artist._id,
      mandalName,
      contactPerson,
      phone,
      year,
      theme,
      concepts: concepts || [],
      totalAmount: totalAmount || 0,
      advanceAmount: advanceAmount || 0,
      revisionLimit: revisionLimit || 3,
      projectToken: nanoid(10),
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
