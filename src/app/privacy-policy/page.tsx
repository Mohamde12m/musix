'use client'

import { useState, useEffect } from 'react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen p-6 pt-[calc(env(safe-area-inset-top)+20px)]">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-extrabold gradient-purple-text">سياسة الخصوصية — MusiX</h1>
        
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">1. مقدمة</h2>
            <p>تطبيق MusiX ("نحن" أو "التطبيق") يحترم خصوصية مستخدميه. توضح هذه السياسة كيف نجمع ونستخدم ونحمي بياناتك عند استخدام تطبيق الموسيقى MusiX.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">2. البيانات التي نجمعها</h2>
            <p>نجمع البيانات التالية:</p>
            <ul className="mt-2 list-disc pr-4 space-y-1">
              <li>البريد الإلكتروني وكلمة المرور (مشفّرة) عند إنشاء حساب</li>
              <li>الأغاني المفضلة وقوائم التشغيل (محفوظة محليًا في متصفحك)</li>
              <li>عدد الأغاني المكتملة لاحتساب النقاط (نظام الأرباح)</li>
              <li>بيانات طلبات السحب (طريقة الدفع والتفاصيل)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">3. الإعلانات (Google AdSense)</h2>
            <p>يستخدم التطبيق Google AdSense لعرض الإعلانات. قد تستخدم Google ملفات تعريف الارتباط (cookies) لعرض إعلانات مناسبة. يمكنك تعطيل الإعلانات الشخصية من إعدادات Google.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">4. الكوكيز</h2>
            <p>يستخدم التطبيق كوكيز ضرورية للتشغيل (تسجيل الدخول، التفضيلات، قوائم التشغيل). لا نستخدم كوكيز تتبع خارجية.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">5. قاعدة البيانات</h2>
            <p>تُحفظ بيانات الأغاني والفنانين والتصنيفات على Supabase (PostgreSQL). بيانات حسابك محمية بكلمات مرور مشفّرة.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">6. حقوق الموسيقى</h2>
            <p>المسؤول مسؤول عن روابط الأغاني التي يضيفها. لا يستخرج التطبيق الأغاني تلقائيًا من مواقع أخرى. يجب أن يملك المسؤول حقوق نشر الأغاني.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">7. التواصل</h2>
            <p>لأي استفسار حول الخصوصية، تواصل معنا عبر التطبيق.</p>
          </section>

          <p className="mt-6 text-xs">آخر تحديث: أكتوبر 2025 — MusiX © جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  )
}
