# إضافة قالب أو أصل بصري

تعمل الواجهة على GitHub Pages دون خادم. لا توضع مفاتيح سرية في الملفات العامة.

## أصل جديد
1. أضف PNG الأصلي إلى `assets/backgrounds/` أو `assets/decorations/` باسم لاتيني ثابت.
2. الخلفية بلا نصوص أو تواريخ. اترك وسطها هادئًا، و12% أعلى وأسفل للستوري. يجب أن تحتوي الزخرفة على شفافية فعلية.
3. أضف تعريفه إلى `assets/catalog.js` وإلى قائمة الزخارف عند الحاجة.
4. شغّل `node scripts/prepare-assets.mjs`؛ ينشئ WebP، يفحص الشفافية ويسجّل المصدر والأبعاد في `data/assets.json`.

## قالب قابل للتحرير
عرّف القالب في `assets/catalog.js`: المعرف والاسم والوصف والتصنيف والإصدار والأبعاد والخلفية والطبقات ومناطق الأمان والقيم الافتراضية والأصول. الطبقات تستخدم إحداثيات نسبية من 0 إلى 1. الصور تستخدم cover أو contain دون تمدد. الطبقات المتاحة: text, image, shape, decoration, logo, gregorian, hijri, countdown, qr, watermark.

ينشئ أمر تجهيز الأصول ملفات JSON بإصدار 2 في `data/templates/`. تستخدم المعاينات والتصدير `assets/engine.js` نفسه. يولّد `npm run test:browser` المعاينات الحقيقية في `images/catalog/` ويختبر اختلافها.

## التحقق والنشر
```
npm ci
npx playwright install chromium
npm test
npm run test:browser
node scripts/check-extra.mjs
node scripts/render.mjs
node scripts/render-smart.mjs
```
راجع صور `images/verification/` بصريًا، ثم ارفع إلى main. ينفذ GitHub Actions الاختبارات والتوليد والنشر. لا يتجاوز التوليد محاولتين. سجل التفاصيل والفشل متاح في Actions، وآخر عمليات توليد الاستوديو في `data/generation-log.json`.

## الحفاظ على البيانات
الأرشيف والإعدادات القديمة محفوظة. قبل التعديل أُنشئت نسخة Git bundle مستقلة. تنقل `assets/migration.js` مسودات v1 بالنسخ فقط، وتحتفظ بنسخة من بياناتها في IndexedDB الجديد، دون تعديل قاعدة v1. استيراد النسخ الاحتياطية يولّد معرفات جديدة لمنع استبدال تصميم قائم.

## الهوية والأصول
[لوحة الهوية ونموذجا الجمعة والتخرج في Canva](https://canva.link/gup4y1ntpz6gvbp). الخلفيات الـ24 والزخارف الثماني أُنشئت بأداة OpenAI المدمجة؛ ليست صادرات من Canva. الخط المحلي Cairo مرخّص بموجب SIL OFL، مع الرخصة في `assets/fonts/OFL.txt`. رخصتا QR والضغط مرفقتان في `assets/vendor/`.

التوليد البصري: خلفيات عمودية 9:16، طابع سعودي، زمردي وعاجي وذهبي هادئ، مناطق قراءة فارغة، دون نصوص أو أرقام أو شعارات. لكل أصل تكوين خاص موثق في `data/image-prompts.json`، وأبعاده ومصدره ونسخته المحسنة في `data/assets.json`.
