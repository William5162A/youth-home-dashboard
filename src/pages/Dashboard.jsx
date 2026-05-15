import { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { meetingService } from '../services/meetingService';
import { eventService } from '../services/eventService';

export default function Dashboard() {
  const [data, setData] = useState({
    activeMembers: [],
    meetings: [],
    activities: [],
    camps: [],
    topMembers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // جلب متوازي لجميع المجموعات لتحسين الأداء
      const [membersData, meetingsData, activitiesData, campsData] = await Promise.all([
        memberService.getAllMembers(),
        meetingService.getMeetings(),
        eventService.getEvents('activities'),
        eventService.getEvents('camps')
      ]);

      const activeMembers = membersData.filter(m => m.isActive);

      // خوارزمية حساب أفضل 10 أعضاء
      const membersWithStats = activeMembers.map(member => {
        let total = 0;
        let attended = 0;

        meetingsData.forEach(meeting => {
          if (meeting.attendance && meeting.attendance[member.id] !== undefined) {
            total++;
            if (meeting.attendance[member.id] === 'present') attended++;
          }
        });

        const percentage = total === 0 ? 0 : Math.round((attended / total) * 100);
        return { ...member, percentage, total, attended };
      });

      // الفرز التنازلي بناءً على النسبة، ثم عدد مرات الحضور كعامل كسر التعادل (Tie-breaker)
      const topMembers = membersWithStats
        .filter(m => m.total > 0) // استبعاد من ليس له اجتماعات مسجلة
        .sort((a, b) => b.percentage - a.percentage || b.attended - a.attended)
        .slice(0, 10);

      setData({
        activeMembers,
        meetings: meetingsData,
        activities: activitiesData,
        camps: campsData,
        topMembers
      });
    } catch (error) {
      console.error("خطأ في تحميل بيانات اللوحة:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-brand-blue font-bold">جاري تجميع إحصائيات النظام...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-blue mb-6">لوحة التحكم</h1>

      {/* بطاقات الإحصائيات العلوية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="الأعضاء النشطون" count={data.activeMembers.length} color="text-brand-blue" />
        <StatCard title="إجمالي الاجتماعات" count={data.meetings.length} color="text-brand-gold" />
        <StatCard title="إجمالي النشاطات" count={data.activities.length} color="text-slate-600" />
        <StatCard title="إجمالي المخيمات" count={data.camps.length} color="text-slate-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قسم أفضل 10 أعضاء */}
        <div className="lg:col-span-1 bg-surface rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-brand-blue/5 px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-brand-blue">قائمة الشرف (أفضل 10 حضوراً)</h2>
          </div>
          <div className="p-0">
            {data.topMembers.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 text-center">لا تتوفر بيانات كافية للحضور.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.topMembers.map((member, index) => (
                  <li key={member.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-brand-gold text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-800 text-sm">{member.name}</span>
                    </div>
                    <span className="text-sm font-bold text-present-text bg-present-bg px-2 py-1 rounded-md">
                      {member.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* قسم آخر النشاطات والاجتماعات والمخيمات */}
        <div className="lg:col-span-2 space-y-6">
          <RecentList title="آخر 3 اجتماعات" items={data.meetings.slice(0, 3)} type="meeting" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentList title="آخر النشاطات" items={data.activities.slice(0, 3)} type="event" />
            <RecentList title="آخر المخيمات" items={data.camps.slice(0, 3)} type="event" />
          </div>
        </div>
      </div>
    </div>
  );
}

// مكونات مساعدة للوحة التحكم (مفصولة برمجياً لتقليل التعقيد)
function StatCard({ title, count, color }) {
  return (
    <div className="bg-surface p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center items-start">
      <span className="text-slate-500 text-sm font-medium mb-1">{title}</span>
      <span className={`text-3xl font-black ${color}`}>{count}</span>
    </div>
  );
}

function RecentList({ title, items, type }) {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="p-0">
        {items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">لا توجد سجلات.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map(item => (
              <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-800 text-sm truncate">{item.title}</span>
                <div className="flex items-center gap-3 text-xs text-slate-500 whitespace-nowrap">
                  <span dir="ltr">{item.date}</span>
                  {type === 'event' && (
                    <span className="bg-slate-100 px-2 py-1 rounded font-medium">{item.participantsCount} مشاركاً</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}