import { NextRequest } from 'next/server';
import { finishOAuth } from '@/lib/server/socialOAuth';
export async function GET(req:NextRequest) { return finishOAuth(req,'instagram'); }
