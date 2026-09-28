/**
 * ==============================================================================
 * @file        servicesData.js
 * @package     StoreApp.Config.ServicesCatalog
 * @description كتالوج الخدمات والمنصات التفاعلي بالكامل (Declarative Service Catalog).
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 * 
 * 💡 كيفية إضافة خدمة أو منصة جديدة:
 * ببساطة أضف كائن داخل مصفوفة المنصات بالأسفل، وسيتكفل النظام برسم الواجهات،
 * وحساب الأسعار، والتحقق، وتأكيد الطلبات تلقائياً دون كتابة أي كود HTML أو CSS!
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.Config = window.StoreApp.Config || {};

window.StoreApp.Config.ServicesCatalog = [
    /* -------------------------------------------------------------------------- */
    /* 1. إنستغرام (Instagram)                                                    */
    /* -------------------------------------------------------------------------- */
    {
        id: "instagram",
        name: "إنستغرام",
        desc: "متابعين • لايكات • مشاهدات ريلز",
        icon: "fab fa-instagram",
        iconClass: "icon-insta",
        category: "social",
        popular: true,
        services: [
            {
                id: "insta-followers-30d",
                name: "متابعين إنستغرام (حقيقي) - ضمان 30 يوم",
                rate: 1.20,
                min: 100,
                max: 50000,
                unit: 1000,
                badge: "🛡️ ضمان 30 يوم",
                speed: "⚡ 5,000 - 15,000 يومياً",
                label: "رابط الحساب أو اليوزر (@username)",
                placeholder: "https://instagram.com/username أو @username",
                type: "standard"
            },
            {
                id: "insta-likes-fast",
                name: "لايكات إنستغرام (سريع جداً + فوري)",
                rate: 0.35,
                min: 50,
                max: 100000,
                unit: 1000,
                badge: "⚡ فوري 100%",
                speed: "🚀 بدء فوري خلال دقيقة",
                label: "رابط المنشور (Post / Reel Link)",
                placeholder: "https://instagram.com/p/xxx أو reel/xxx",
                type: "standard"
            },
            {
                id: "insta-reels-views",
                name: "مشاهدات ريلز إنستغرام فائقة السرعة",
                rate: 0.10,
                min: 100,
                max: 1000000,
                unit: 1000,
                badge: "🔥 الأكثر طلباً",
                speed: "⚡ 100,000 في الساعة",
                label: "رابط الريلز (Reel Link)",
                placeholder: "https://instagram.com/reel/xxx",
                type: "standard"
            },
            {
                id: "insta-comments-custom",
                name: "تعليقات إنستغرام عربية خليجية مخصصة",
                rate: 5.50,
                min: 10,
                max: 1000,
                unit: 1000,
                badge: "⭐ جودة VIP",
                speed: "📝 حسابات خليجية متفاعلة",
                label: "رابط المنشور",
                placeholder: "https://instagram.com/p/xxx",
                type: "standard"
            }
        ]
    },

    /* -------------------------------------------------------------------------- */
    /* 2. تيك توك (TikTok)                                                       */
    /* -------------------------------------------------------------------------- */
    {
        id: "tiktok",
        name: "تيك توك",
        desc: "متابعين • لايكات • مشاهدات وحركة إكسبلور",
        icon: "fab fa-tiktok",
        iconClass: "icon-tiktok",
        category: "video",
        popular: true,
        services: [
            {
                id: "tiktok-followers-hq",
                name: "متابعين تيك توك (جودة عالية مع صور)",
                rate: 2.10,
                min: 100,
                max: 50000,
                unit: 1000,
                badge: "⭐ جودة ممتازة",
                speed: "⚡ سرعة 2,000 يومياً",
                label: "رابط الحساب أو اليوزر (@user)",
                placeholder: "https://tiktok.com/@username",
                type: "standard"
            },
            {
                id: "tiktok-views-instant",
                name: "مشاهدات تيك توك (فورية + رفع إكسبلور)",
                rate: 0.05,
                min: 1000,
                max: 5000000,
                unit: 1000,
                badge: "🏷️ أرخص سعر بالعالم",
                speed: "🚀 سرعة مليون مشاهدة باليوم",
                label: "رابط الفيديو",
                placeholder: "https://vt.tiktok.com/xxx أو video/xxx",
                type: "standard"
            },
            {
                id: "tiktok-likes-fast",
                name: "لايكات تيك توك سريعة وآمنة",
                rate: 0.45,
                min: 100,
                max: 100000,
                unit: 1000,
                badge: "⚡ فوري",
                speed: "⚡ 5,000 في الساعة",
                label: "رابط الفيديو",
                placeholder: "https://tiktok.com/@user/video/xxx",
                type: "standard"
            },
            {
                id: "tiktok-shares-saves",
                name: "حركات إكسبلور ومشاركات وحفظ الفيديو",
                rate: 0.15,
                min: 100,
                max: 200000,
                unit: 1000,
                badge: "🔥 خوارزميات إكسبلور",
                speed: "🚀 بدء فوري",
                label: "رابط الفيديو",
                placeholder: "https://tiktok.com/@user/video/xxx",
                type: "standard"
            }
        ]
    },

    /* -------------------------------------------------------------------------- */
    /* 3. تليجرام (Telegram)                                                     */
    /* -------------------------------------------------------------------------- */
    {
        id: "telegram",
        name: "تليجرام",
        desc: "أعضاء قنوات • مشاهدات • تفاعلات إيجابية",
        icon: "fab fa-telegram-plane",
        iconClass: "icon-telegram",
        category: "messaging",
        popular: true,
        services: [
            {
                id: "telegram-members-fast",
                name: "أعضاء قناة/مجموعة تليجرام (سرعة فائقة)",
                rate: 0.90,
                min: 100,
                max: 50000,
                unit: 1000,
                badge: "🛡️ بدون نقص",
                speed: "⚡ سرعة 10,000 باليوم",
                label: "رابط القناة أو المعرف (@channel)",
                placeholder: "https://t.me/channel أو @channel",
                type: "standard"
            },
            {
                id: "telegram-post-views",
                name: "مشاهدات وتفاعلات منشورات القناة (إيموجي)",
                rate: 0.15,
                min: 100,
                max: 500000,
                unit: 1000,
                badge: "👍 تفاعل إيجابي",
                speed: "🚀 فوري لآخر 5 أو 10 منشورات",
                label: "رابط المنشور في القناة",
                placeholder: "https://t.me/channel/123",
                type: "standard"
            }
        ]
    },

    /* -------------------------------------------------------------------------- */
    /* 4. فيسبوك (Facebook)                                                      */
    /* -------------------------------------------------------------------------- */
    {
        id: "facebook",
        name: "فيسبوك",
        desc: "متابعين بيج • لايكات بوستات • مشاهدات فيديو",
        icon: "fab fa-facebook-f",
        iconClass: "icon-facebook",
        category: "social",
        popular: false,
        services: [
            {
                id: "facebook-page-followers",
                name: "متابعين ولايكات صفحة/بيج فيسبوك (ضمان)",
                rate: 2.50,
                min: 100,
                max: 100000,
                unit: 1000,
                badge: "🛡️ ضمان 60 يوم",
                speed: "⚡ 2,000 - 5,000 يومياً",
                label: "رابط الصفحة أو الملف الشخصي",
                placeholder: "https://facebook.com/page-name",
                type: "standard"
            },
            {
                id: "facebook-post-likes",
                name: "تفاعلات ولايكات منشورات فيسبوك (Love, Wow, Like)",
                rate: 0.80,
                min: 100,
                max: 50000,
                unit: 1000,
                badge: "❤️ تفاعلات مشكلة",
                speed: "🚀 بدء خلال دقائق",
                label: "رابط المنشور العام",
                placeholder: "https://facebook.com/posts/xxx",
                type: "standard"
            }
        ]
    },

    /* -------------------------------------------------------------------------- */
    /* 5. يوتيوب (YouTube)                                                       */
    /* -------------------------------------------------------------------------- */
    {
        id: "youtube",
        name: "يوتيوب",
        desc: "مشتركين • ساعات مشاهدة • لايكات",
        icon: "fab fa-youtube",
        iconClass: "icon-youtube",
        category: "video",
        popular: false,
        services: [
            {
                id: "youtube-views-retention",
                name: "مشاهدات يوتيوب بجودة عالية ومدة بقاء ممتازة",
                rate: 1.80,
                min: 500,
                max: 500000,
                unit: 1000,
                badge: "⭐ آمن لتحقيق الربح",
                speed: "⚡ 5,000 - 10,000 باليوم",
                label: "رابط الفيديو على يوتيوب",
                placeholder: "https://youtu.be/xxx أو watch?v=xxx",
                type: "standard"
            },
            {
                id: "youtube-subscribers-stable",
                name: "مشتركين يوتيوب حقيقيين وثابتين (ضمان)",
                rate: 7.90,
                min: 50,
                max: 5000,
                unit: 1000,
                badge: "🛡️ ضمان 90 يوم",
                speed: "⚡ تدرج طبيعي وآمن للقناة",
                label: "رابط القناة",
                placeholder: "https://youtube.com/@channel",
                type: "standard"
            }
        ]
    },

    /* -------------------------------------------------------------------------- */
    /* 6. خدمات مجانية (Free Trials)                                             */
    /* -------------------------------------------------------------------------- */
    {
        id: "free",
        name: "خدمات مجانية",
        desc: "هدايا وتجارب مجانية فورية بدون رصيد",
        icon: "fas fa-gift",
        iconClass: "icon-free",
        category: "gifts",
        popular: true,
        services: [
            {
                id: "free-insta-views",
                name: "تجربة مشاهدات انستغرام مجانية (1000 مشاهدة)",
                rate: 0.00,
                min: 1000,
                max: 1000,
                unit: 1000,
                badge: "🎁 هدية مجانية 100%",
                speed: "⚡ سرعة فورية",
                label: "رابط الفيديو أو الريلز",
                placeholder: "https://instagram.com/reel/xxx",
                type: "free",
                fixedQty: 1000
            },
            {
                id: "free-telegram-reactions",
                name: "تجربة تفاعلات تليجرام مجانية (500 تفاعل)",
                rate: 0.00,
                min: 500,
                max: 500,
                unit: 1000,
                badge: "🎁 هدية فورية",
                speed: "🚀 تنفيذ سريع",
                label: "رابط المنشور بالقناة",
                placeholder: "https://t.me/channel/123",
                type: "free",
                fixedQty: 500
            }
        ]
    },

    /* -------------------------------------------------------------------------- */
    /* 7. تمويل حقيقي وإعلانات (Sponsored Campaigns)                             */
    /* -------------------------------------------------------------------------- */
    {
        id: "real",
        name: "تمويل حقيقي",
        desc: "حملات إعلانية ممولة ومستهدفة للجمهور العراقي",
        icon: "fas fa-money-bill-wave",
        iconClass: "icon-real",
        category: "ads",
        popular: true,
        services: [
            {
                id: "real-ad-campaign",
                name: "حملة ممولة موجهة (عراقية) - انستغرام وفيسبوك وتيك توك",
                rate: 1.00,
                min: 10,
                max: 2000,
                unit: 1,
                badge: "🎯 استهداف فئات ومحافظات",
                speed: "📈 وصول حقيقي ومبيعات",
                label: "رابط المنشور أو الحساب المراد ترويجه",
                placeholder: "ضع رابط المنشور أو صفحتك هنا",
                type: "campaign",
                minBudget: 10
            }
        ]
    }
];

// التوافقية العكسية للاسم القديم
window.StoreApp.ServicesCatalog = window.StoreApp.Config.ServicesCatalog;
