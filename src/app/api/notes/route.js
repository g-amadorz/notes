import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Note from '../../../models/note';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const authorID = searchParams.get('authorID');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build search query
    let query = {};
    
    if (authorID) {
      query.authorID = authorID;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorID', 'username email');
    
    const total = await Note.countDocuments(query);
    
    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { title, content, tags, category, authorID } = body;
    
    // Basic validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Create new note
    const note = new Note({
      title,
      content,
      tags: tags || [],
      category: category || 'general',
      authorID
    });
    
    await note.save();
    
    // Populate author info
    await note.populate('authorID', 'username email');
    
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
