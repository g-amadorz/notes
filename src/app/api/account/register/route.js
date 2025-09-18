import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { username, email, password } = body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or username already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        // const {password: _, ...userResponse} = newUser.toObject();
        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });


    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}  