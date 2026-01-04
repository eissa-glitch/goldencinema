import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useContent, useUpdateContent } from "@/hooks/useSiteContent";
import { useIsAdmin } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  contentKey: string;
  fallback: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
}

const EditableText = ({
  contentKey,
  fallback,
  as: Component = "span",
  className,
  inputClassName,
  multiline = false,
}: EditableTextProps) => {
  const content = useContent(contentKey, fallback);
  const { isAdmin } = useIsAdmin();
  const updateContent = useUpdateContent();
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(content);

  useEffect(() => {
    setTempValue(content);
  }, [content]);

  const handleSave = () => {
    updateContent.mutate({ key: contentKey, value: tempValue });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(content);
    setIsEditing(false);
  };

  if (!isAdmin) {
    return <Component className={className}>{content}</Component>;
  }

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-2 w-full">
        {multiline ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className={cn(
              "bg-background/50 border border-gold/50 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-gold resize-none",
              inputClassName
            )}
            rows={3}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className={cn(
              "bg-background/50 border border-gold/50 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-gold",
              inputClassName
            )}
            autoFocus
          />
        )}
        <button
          onClick={handleSave}
          disabled={updateContent.isPending}
          className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors shrink-0"
        >
          <Check className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleCancel}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors shrink-0"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 group/edit">
      <Component className={className}>{content}</Component>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 bg-gold/20 hover:bg-gold/30 rounded-full transition-colors opacity-0 group-hover/edit:opacity-100"
        title="تعديل"
      >
        <Pencil className="w-3 h-3 text-gold" />
      </button>
    </div>
  );
};

export default EditableText;
