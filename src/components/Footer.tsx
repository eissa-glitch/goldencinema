import { Link } from "react-router-dom";
import { Film, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-gold/20 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <Film className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-amiri font-bold text-gradient-gold">
                الأرشيف السينمائي
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              أكبر أرشيف للسينما العربية، نحفظ التراث السينمائي العربي للأجيال القادمة.
              اكتشف روائع السينما العربية من الأفلام الكلاسيكية إلى الإنتاجات الحديثة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-gold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {[
                { path: "/movies", label: "الأفلام" },
                { path: "/artists", label: "الفنانون" },
                { path: "/years", label: "السنوات" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold text-gold mb-4">التصنيفات</h4>
            <ul className="space-y-2">
              {["دراما", "كوميديا", "رومانسي", "تاريخي"].map((genre) => (
                <li key={genre}>
                  <Link
                    to={`/movies?genre=${genre}`}
                    className="text-muted-foreground hover:text-gold transition-colors"
                  >
                    {genre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} الأرشيف السينمائي. جميع الحقوق محفوظة.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            صُنع بـ <Heart className="w-4 h-4 text-gold fill-gold" /> للسينما العربية
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
