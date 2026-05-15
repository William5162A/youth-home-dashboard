import { useState, useEffect } from 'react';
import { meetingService } from '../services/meetingService';
import { memberService } from '../services/memberService';
import MeetingForm from '../components/meetings/MeetingForm';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meetingsData, membersData] = await Promise.all([
        meetingService.getMeetings(),
        memberService.getAllMembers()
      ]);
      setMeetings(meetingsData);
      setActiveMembers(membersData.filter(m => m.isActive));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    fetchData(); // جلب البيانات المحدثة
  };

  // دالة لحساب عدد الحضور لكل اجتماع
  const getPresentCount = (attendanceObj) => {
    if (!attendanceObj) return 0;
    return Object.values(attendanceObj).filter(status => status === 'present').length;
  };

  if (loading) return <div className="text-brand-blue font-bold">جاري تحميل الاجتماعات...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-blue">إدارة الاجتماعات</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="rounded-md bg-brand-gold px-4 py-2 text-brand-blue-dark font-bold hover:bg-brand-gold-light hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm">
            + اجتماع جديد
          </button>
        )}
      </div>

      {showForm ? (
        <MeetingForm activeMembers={activeMembers} onCancel={() => setShowForm(false)} onSuccess={handleSuccess} />
      ) : (
        <section className="rounded-xl bg-surface shadow-sm overflow-hidden border border-slate-100">
          <div className="bg-brand-blue/5 px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-brand-blue">سجل الاجتماعات ({meetings.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase">
                  <th className="px-6 py-4">العنوان</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4 text-center">عدد الحضور</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {meetings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">لا توجد اجتماعات مسجلة.</td>
                  </tr>
                ) : (
                  meetings.map(meeting => (
                    <tr key={meeting.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{meeting.title}</td>
                      <td className="px-6 py-4 text-slate-500" dir="ltr" style={{ textAlign: 'right' }}>{meeting.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-present-bg text-present-text font-bold">
                          {getPresentCount(meeting.attendance)} عضو
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-brand-blue font-medium hover:text-brand-blue-dark hover:scale-110 transition-transform cursor-pointer">عرض التفاصيل</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}