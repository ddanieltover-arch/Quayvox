import { useState } from 'react';
import { Users, UserPlus, Shield, Clock, Pencil, Trash2 } from 'lucide-react';

const mockTeam = [
  { id: '1', name: 'Alex Johnson', email: 'alex@shiptrack.io', role: 'Admin', department: 'Operations', status: 'Active', lastActive: '2 min ago', avatar: 'AJ' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@shiptrack.io', role: 'Manager', department: 'Logistics', status: 'Active', lastActive: '15 min ago', avatar: 'SC' },
  { id: '3', name: 'Mike Peters', email: 'mike@shiptrack.io', role: 'Analyst', department: 'Finance', status: 'Away', lastActive: '2 hours ago', avatar: 'MP' },
  { id: '4', name: 'Emily Davis', email: 'emily@shiptrack.io', role: 'Operator', department: 'Customer Support', status: 'Active', lastActive: '5 min ago', avatar: 'ED' },
  { id: '5', name: 'Carlos Ruiz', email: 'carlos@shiptrack.io', role: 'Manager', department: 'Operations', status: 'Offline', lastActive: '1 day ago', avatar: 'CR' },
  { id: '6', name: 'Lisa Wang', email: 'lisa@shiptrack.io', role: 'Analyst', department: 'Logistics', status: 'Active', lastActive: '30 min ago', avatar: 'LW' },
];

const activityLog = [
  { action: 'Created shipment SH-2026-7852', user: 'Alex Johnson', time: '2 min ago' },
  { action: 'Updated route for SH-2026-7843', user: 'Sarah Chen', time: '15 min ago' },
  { action: 'Uploaded document BOL-7850.pdf', user: 'Mike Peters', time: '1 hour ago' },
  { action: 'Resolved exception for SH-2026-7847', user: 'Emily Davis', time: '2 hours ago' },
  { action: 'Added new carrier: Emirates SkyCargo', user: 'Carlos Ruiz', time: '5 hours ago' },
];

const Team = () => {
  const [team] = useState(mockTeam);
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = team.filter(m => roleFilter === 'All' || m.role === roleFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/20 text-emerald-400';
      case 'Away': return 'bg-amber-500/20 text-amber-400';
      case 'Offline': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Team</h1>
          <p className="text-sm text-text-secondary mt-1">{team.length} team members</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: team.length, icon: Users },
          { label: 'Active Now', value: team.filter(m => m.status === 'Active').length, icon: Shield },
          { label: 'Managers', value: team.filter(m => m.role === 'Manager').length, icon: Shield },
          { label: 'Departments', value: new Set(team.map(m => m.department)).size, icon: Users },
        ].map(stat => (
          <div key={stat.label} className="card-surface p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-cobalt" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team List */}
        <div className="lg:col-span-2 card-surface overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/5">
            {['All', 'Admin', 'Manager', 'Analyst', 'Operator'].map(role => (
              <button key={role} onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${roleFilter === role ? 'bg-cobalt text-white' : 'text-text-secondary hover:text-text-primary'}`}>
                {role}
              </button>
            ))}
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cobalt/20 flex items-center justify-center border border-cobalt/30">
                    <span className="text-xs font-semibold text-cobalt">{member.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{member.name}</p>
                    <p className="text-xs text-text-secondary">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-text-secondary">{member.department}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cobalt/10 text-cobalt">{member.role}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="card-surface p-4">
          <h3 className="font-display font-semibold text-text-primary mb-4">Activity Log</h3>
          <div className="space-y-4">
            {activityLog.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-cobalt mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-text-primary">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-secondary">{activity.user}</span>
                    <span className="text-xs text-text-secondary/50">·</span>
                    <span className="text-xs text-text-secondary flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
