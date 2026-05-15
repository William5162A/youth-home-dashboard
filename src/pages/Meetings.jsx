import { useState, useEffect } from 'react';
import { meetingService } from '../services/meetingService';
import { memberService } from '../services/memberService';
import MeetingForm from '../components/meetings/MeetingForm';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
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

  const getPresentCount = (attendanceObj) => {
    if (!attendanceObj) return 0;
    return Object.values(attendanceObj).filter(status => status === 'present').length;
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await meetingService.deleteMeeting(itemToDelete.id);
      setItemToDelete(null);
      fetchData(); // تحديث القائمة بعد الحذف
    } catch (error) {
      console.error("حدث خطأ أثناء الحذف:", error);
    }
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
          <div className="overflow-x-auto">
            <table className="w-full block lg:table text-right text-sm">
              <thead className="hidden lg:table-header-group">
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-6 py-4">العنوان</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4 text-center">عدد الحضور</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="block lg:table-row-group">
                {meetings.length === 0 ? (
                  <tr className="block lg:table-row">
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 block lg:table-cell">لا توجد اجتماعات مسجلة.</td>
                  </tr>
                ) : (
                  meetings.map(meeting => (
                    <tr key={meeting.id} className="block lg:table-row bg-surface border border-slate-200 lg:border-none rounded-xl lg:rounded-none mb-4 lg:mb-0 p-4 lg:p-0 shadow-sm lg:shadow-none hover:bg-slate-50 transition-colors">
                      <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none font-medium">
                        <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">العنوان</span>
                        <span>{meeting.title}</span>
                      </td>
                      <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none text-slate-500">
                        <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">التاريخ</span>
                        <span dir="ltr">{meeting.date}</span>
                      </td>
                      <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none">
                        <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">عدد الحضور</span>
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-present-bg text-present-text font-bold lg:mx-auto">
                          {getPresentCount(meeting.attendance)} عضواً
                        </span>
                      </td>
                      <td className="flex lg:table-cell justify-center items-center py-4 lg:px-6 lg:py-4">
                        <div className="flex justify-center items-center space-x-6 space-x-reverse gap-6">
                          <button className="text-slate-400 font-medium cursor-not-allowed" title="سيتم برمجتها لاحقاً">
                            التفاصيل
                          </button>
                          <button onClick={() => setItemToDelete(meeting)} className="text-absent-text font-medium hover:text-red-800 hover:scale-110 transition-transform cursor-pointer">
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* نافذة تأكيد الحذف */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-xl shadow-lg p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">تأكيد الحذف</h3>
            <p className="text-sm text-slate-600 mb-6">
              هل أنت متأكد من حذف اجتماع <span className="font-bold text-absent-text">{itemToDelete.title}</span> نهائياً؟ هذا سيؤثر على حسابات نسبة الحضور للأعضاء.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
                إلغاء
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-absent-text text-white font-semibold rounded-md hover:bg-red-800 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}