// app/api/goal/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function toInt(v: string | undefined, defaultVal: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.floor(n) : defaultVal;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  // You can set either FUNDING_GOAL_CENTS or FUNDING_GOAL_DOLLARS (cents takes precedence)
  const goalCents =
    toInt(process.env.FUNDING_GOAL_CENTS, 0) ||
    toInt(process.env.FUNDING_GOAL_DOLLARS, 0) * 100;

  if (!goalCents || goalCents <= 0) {
    return NextResponse.json({ ok: false, error: 'goal_not_configured' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('contributions')
    .select('amount, currency');

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: 'fetch_failed' }, { status: 500 });
  }

  // Sum only USD; extend if you plan multi-currency
  const totalCents = Math.round(
    (data || [])
      .filter(r => (r.currency || 'USD').toUpperCase() === 'USD')
      .reduce((sum, r) => sum + Number(r.amount || 0) * 100, 0)
  );

  const remainingCents = Math.max(0, goalCents - totalCents);
  const percent = Math.min(100, Math.round((totalCents / goalCents) * 100));

  return NextResponse.json({
    ok: true,
    goal_cents: goalCents,
    total_cents: totalCents,
    remaining_cents: remainingCents,
    percent,
  });
}
