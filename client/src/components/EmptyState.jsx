import React from 'react';
import * as LucideIcons from 'lucide-react';

export const EmptyState = ({
  icon = "Users",
  title = "Henüz veri yok",
  description,
  ctaText,
  ctaAction,
  secondaryCtaText,
  secondaryCtaAction
}) => {
  const IconComponent = LucideIcons[icon] || LucideIcons.FileQuestion;

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-surface-container-lowest border border-dashed border-outline-variant rounded-2xl animate-in fade-in duration-500 w-full">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <IconComponent className="text-primary" size={32} />
      </div>
      
      <h3 className="text-xl font-display-md font-bold text-on-surface mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-on-surface-variant font-body-sm max-w-md mx-auto mb-8 leading-relaxed">
          {description}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        {ctaText && ctaAction && (
          <button
            onClick={ctaAction}
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-[#18181B] font-semibold rounded-xl transition-all shadow-sm hover:shadow-md whitespace-nowrap"
          >
            {ctaText}
          </button>
        )}
        
        {secondaryCtaText && secondaryCtaAction && (
          <button
            onClick={secondaryCtaAction}
            className="w-full sm:w-auto px-6 py-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface font-medium rounded-xl transition-all whitespace-nowrap"
          >
            {secondaryCtaText}
          </button>
        )}
      </div>
    </div>
  );
};
