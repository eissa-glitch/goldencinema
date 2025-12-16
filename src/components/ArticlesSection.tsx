import { FileText, ExternalLink, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Article {
  id: string;
  title: string;
  content: string | null;
  source: string | null;
  published_date: string | null;
  image_url: string | null;
}

interface ArticlesSectionProps {
  articles: Article[];
  title?: string;
}

const ArticlesSection = ({ articles, title = "مقالات وأخبار" }: ArticlesSectionProps) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-amiri font-bold text-gradient-gold mb-8 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="cinema-card overflow-hidden group">
              {article.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
                {article.content && (
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {article.content}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {article.source && (
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {article.source}
                    </span>
                  )}
                  {article.published_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.published_date).toLocaleDateString("ar-EG")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
