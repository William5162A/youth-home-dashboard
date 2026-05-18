// دالة حساب الأيام المتبقية لعيد الميلاد (تتجاهل سنة الولادة)
export const getDaysUntilBirthday = (birthDateStr) => {
    if (!birthDateStr) return Infinity;
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    // استخراج الشهر واليوم وتجاهل السنة كلياً
    const [, birthMonth, birthDay] = birthDateStr.split('-').map(Number);
    
    let nextBirthday = new Date(today.getFullYear(), birthMonth - 1, birthDay);
  
    // إذا مر عيد الميلاد هذا العام، نقله للسنة القادمة
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
  
    const diffTime = nextBirthday - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // دالة تنسيق التاريخ لعرض (يوم/شهر) فقط في الواجهة
  export const formatBirthdayCard = (birthDateStr) => {
    if (!birthDateStr) return '';
    const [, month, day] = birthDateStr.split('-');
    return `${day}/${month}`;
  };