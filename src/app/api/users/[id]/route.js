import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/user';
import Note from '../../../../models/note';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Find user by ID
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's notes count and recent notes
    const totalNotes = await Note.countDocuments({ authorID: id });
    const recentNotes = await Note.find({ authorID: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title content tags createdAt category');

    // Calculate notebooks count (unique categories)
    const notebooks = await Note.distinct('category', { authorID: id });
    const totalNotebooks = notebooks.length;

    // Get last activity (most recent note creation)
    const lastNote = await Note.findOne({ authorID: id })
      .sort({ createdAt: -1 })
      .select('createdAt');

    const userProfile = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      totalNotes,
      totalNotebooks,
      lastActive: lastNote ? lastNote.createdAt : user.createdAt,
      recentNotes: recentNotes.map(note => ({
        id: note._id,
        title: note.title,
        content: note.content.substring(0, 150) + (note.content.length > 150 ? '...' : ''),
        createdAt: note.createdAt,
        tags: note.tags,
        notebook: note.category
      }))
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    
    // Remove password from update data for security
    const { password, ...updateData } = body;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Delete user's notes first
    await Note.deleteMany({ authorID: id });
    
    // Delete user
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
