import { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { meetingService } from '../services/meetingService';
import MemberForm from '../components/members/MemberForm';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // جلب الأعضاء والاجتماعات معاً بشكل متوازٍ
  const loadData = async () => {
    try {
      const [membersData, meetingsData] = await Promise.all([
        memberService.getAllMembers(),
        meetingService.getMeetings()
      ]);
      setMembers(membersData);
      setMeetings(meetingsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingMember(null);
    loadData();
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await memberService.updateMember(id, { isActive: !currentStatus });
    loadData();
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    await memberService.deleteMember(memberToDelete.id);
    setMemberToDelete(null);
    loadData();
  };

  // الخوارزمية الرياضية لحساب الحضور
  const calculateAttendance = (memberId) => {
    let total = 0;
    let attended = 0;

    meetings.forEach(meeting => {
      if (meeting.attendance && meeting.attendance[memberId] !== undefined) {
        total++;
        if (meeting.attendance[memberId] === 'present') {
          attended++;
        }
      }
    });

    const percentage = total === 0 ? 0 : Math.round((attended / total) * 100);
    return { attended, total, percentage };
  };

  const activeMembers = members.filter(m => m.isActive);
  const formerMembers = members.filter(m => !m.isActive);

  if (loading) return <div className="text-brand-blue font-bold">جاري تحميل السجلات...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-blue">إدارة الأعضاء</h1>
        {!showForm && (
          <button onClick={handleOpenAdd} className="rounded-md bg-brand-gold px-4 py-2 text-brand-blue-dark font-bold hover:bg-brand-gold-light hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm">
            + إضافة عضو جديد
          </button>
        )}
      </div>

      {showForm ? (
        <MemberForm onCancel={() => setShowForm(false)} onSuccess={handleSuccess} initialData={editingMember} />
      ) : (
        <>
          <section className="rounded-xl bg-surface shadow-sm overflow-hidden border border-slate-100">
            <div className="bg-brand-blue/5 px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-brand-blue">الأعضاء الحاليين ({activeMembers.length})</h2>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full block lg:table text-right text-sm">
  <thead className="hidden lg:table-header-group">
    <tr className="bg-slate-50 text-slate-500 uppercase">
      <th className="px-6 py-4">الاسم</th>
      <th className="px-6 py-4">الرقم الوطني</th>
      <th className="px-6 py-4">نسبة الحضور</th>
      <th className="px-6 py-4 text-center">الإجراءات</th>
    </tr>
  </thead>
  <tbody className="block lg:table-row-group">
    {activeMembers.map(member => {
      const stats = calculateAttendance(member.id);
      return (
        <tr key={member.id} className="block lg:table-row bg-surface border border-slate-200 lg:border-none rounded-xl lg:rounded-none mb-4 lg:mb-0 p-4 lg:p-0 shadow-sm lg:shadow-none hover:bg-slate-50 transition-colors">
          
          {/* خلية الاسم */}
          <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none">
            <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">الاسم</span>
            <span className="font-medium">{member.name}</span>
          </td>
          
          {/* خلية الرقم الوطني */}
          <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none text-slate-500">
            <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">الرقم الوطني</span>
            <span>{member.nationalId}</span>
          </td>
          
          {/* خلية نسبة الحضور */}
          <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none">
            <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">نسبة الحضور</span>
            <div className="flex items-center gap-3">
              <div className="font-bold text-lg" dir="ltr">
                <span className="text-present-text">{stats.attended}</span>
                <span className="text-slate-300 mx-1">/</span>
                <span className="text-slate-400">{stats.total}</span>
              </div>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full" style={{ background: `conic-gradient(var(--color-present-text) ${stats.percentage}%, #f1f5f9 0)` }}>
                <div className="absolute inset-1 bg-surface rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-700">{stats.percentage}%</span>
                </div>
              </div>
            </div>
          </td>
          
          {/* خلية الإجراءات */}
          <td className="flex lg:table-cell justify-center items-center py-4 lg:px-6 lg:py-4 gap-4">
             {/* أزرار الإجراءات تبقى كما هي */}
             <button onClick={() => handleOpenEdit(member)} className="text-brand-blue font-medium hover:text-brand-blue-dark hover:scale-110 transition-transform cursor-pointer">تعديل</button>
             <button onClick={() => handleToggleStatus(member.id, true)} className="text-slate-500 font-medium hover:text-brand-gold hover:scale-110 transition-transform cursor-pointer">انسحاب</button>
             <button onClick={() => setMemberToDelete(member)} className="text-absent-text font-medium hover:text-red-800 hover:scale-110 transition-transform cursor-pointer">حذف</button>
          </td>
          
        </tr>
      );
    })}
  </tbody>
</table>
            </div>
          </section>

          {/* قسم الأعضاء السابقين يبقى كما هو في الكود السابق */}
          {formerMembers.length > 0 && (
            <section className="mt-8 rounded-xl bg-surface shadow-sm overflow-hidden border border-slate-100 opacity-75">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-600">الأعضاء المنسحبين ({formerMembers.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm whitespace-nowrap">
                  <tbody className="divide-y divide-slate-100 text-slate-500">
                    {formerMembers.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors bg-slate-50/50">
                        <td className="px-6 py-4 font-medium">{member.name}</td>
                        <td className="px-6 py-4">{member.nationalId}</td>
                        <td className="px-6 py-4 flex justify-center gap-3">
                           <button onClick={() => handleToggleStatus(member.id, false)} className="text-brand-blue font-medium hover:text-brand-blue-dark hover:scale-110 transition-transform cursor-pointer">إعادة تفعيل</button>
                           <button onClick={() => setMemberToDelete(member)} className="text-absent-text font-medium hover:text-red-800 hover:scale-110 transition-transform cursor-pointer">حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* نافذة التأكيد */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-xl shadow-lg p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">تأكيد الحذف النهائي</h3>
            <p className="text-sm text-slate-600 mb-6">هل أنت متأكد من حذف العضو <span className="font-bold text-absent-text">{memberToDelete.name}</span> نهائياً؟</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setMemberToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">إلغاء</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-absent-text text-white font-semibold rounded-md hover:bg-red-800 hover:scale-105 active:scale-95 transition-all cursor-pointer">حذف العضو</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}