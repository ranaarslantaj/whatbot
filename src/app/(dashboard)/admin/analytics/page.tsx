'use client';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const msgData = [{ date: 'Mon', sent: 1200 }, { date: 'Tue', sent: 1400 }, { date: 'Wed', sent: 1100 }, { date: 'Thu', sent: 1600 }, { date: 'Fri', sent: 1300 }, { date: 'Sat', sent: 800 }, { date: 'Sun', sent: 600 }];
const growth = [{ month: 'Oct', clients: 12 }, { month: 'Nov', clients: 18 }, { month: 'Dec', clients: 24 }, { month: 'Jan', clients: 31 }, { month: 'Feb', clients: 38 }, { month: 'Mar', clients: 45 }];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Platform performance metrics" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Messages (7d)" value="8,000" trend="positive" subtext="+15%" icon={MessageSquare} />
        <StatsCard label="Delivery Rate" value="96.2%" trend="positive" subtext="+0.5%" icon={TrendingUp} />
        <StatsCard label="Active Clients" value="38" icon={Users} />
        <StatsCard label="Avg Read Rate" value="82%" icon={BarChart3} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Messages This Week</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={msgData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="sent" fill="#10b981" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Client Growth</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={growth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="clients" stroke="#10b981" strokeWidth={2} /></LineChart></ResponsiveContainer></div></CardContent></Card>
      </div>
    </div>
  );
}
