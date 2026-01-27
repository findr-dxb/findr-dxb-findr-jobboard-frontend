import Link from "next/link"
import { MapPin, Mail, Linkedin, Instagram, MessageCircle } from "lucide-react"

// Bilingual text component
function BilingualText({ english, arabic }: { english: string; arabic: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2">
      <span className="text-gray-400 hover:text-emerald-400 transition-colors text-left" dir="ltr">{english}</span>
      <span className="text-gray-500 text-xs sm:text-sm font-arabic text-right" dir="rtl">{arabic}</span>
    </div>
  )
}

// Bilingual heading component
function BilingualHeading({ english, arabic }: { english: string; arabic: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2">
      <h3 className="font-semibold text-lg text-left" dir="ltr">{english}</h3>
      <h3 className="font-semibold text-sm text-gray-400 font-arabic text-right" dir="rtl">{arabic}</h3>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-6"> 
            <div className="flex items-center space-x-3">
            <img
              src="/Footer_Logo.png"
              alt="Findr"
              className="h-10 w-auto object-contain sm:h-12"
            />
            <span className="sr-only">Findr</span>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                <p className="text-gray-400 leading-relaxed text-left flex-1" dir="ltr">
                  Connecting talent with opportunity in Dubai's dynamic job market. Your gateway to career success in the UAE.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed font-arabic text-right flex-1" dir="rtl">
                  ربط المواهب بالفرص في سوق العمل الديناميكي في دبي. بوابتك للنجاح المهني في الإمارات العربية المتحدة.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">Dubai, UAE</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">contact@findr.ae</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <BilingualHeading english="Quick Links" arabic="روابط سريعة" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/" className="block">
                <BilingualText english="Home" arabic="الرئيسية" />
              </Link>
              <Link href="/about" className="block">
                <BilingualText english="About" arabic="معلومات عنا" />
              </Link>
              <Link href="/rewards" className="block">
                <BilingualText english="Rewards" arabic="المكافآت" />
              </Link>
              <Link href="/contact" className="block">
                <BilingualText english="Contact" arabic="اتصل بنا" />
              </Link>
              <Link href="#" className="block">
                <BilingualText english="Privacy Policy" arabic="سياسة الخصوصية" />
              </Link>
              <Link href="#" className="block">
                <BilingualText english="Terms" arabic="الشروط" />
              </Link>
            </div>
          </div>

          {/* Social & Legal */}
          <div className="space-y-6">
            <BilingualHeading english="Connect With Us" arabic="تواصل معنا" />
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-all social-hover">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-all social-hover">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-all social-hover">
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                <p className="text-sm text-gray-400 text-left flex-1" dir="ltr">Follow us for career tips, job updates, and industry insights.</p>
                <p className="text-sm text-gray-500 font-arabic text-right flex-1" dir="rtl">تابعنا للحصول على نصائح مهنية وتحديثات الوظائف ورؤى الصناعة.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2">
                <p className="text-gray-400 text-sm text-left" dir="ltr">
                  © 2025 Findr. All rights reserved. | Connecting talent with opportunity in Dubai.
                </p>
                <p className="text-gray-500 text-xs sm:text-sm font-arabic text-right" dir="rtl">
                  © 2025 فايندر. جميع الحقوق محفوظة. | ربط المواهب بالفرص في دبي.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
              <Link href="#" className="block">
                <BilingualText english="Privacy Policy" arabic="سياسة الخصوصية" />
              </Link>
              <Link href="#" className="block">
                <BilingualText english="Terms of Service" arabic="شروط الخدمة" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
