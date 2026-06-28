import React from 'react';

export default function LeadCard({
  lead,
  onClick
}) {
  const {
    name,
    phone,
    score,
    label,
    actionType,
    propertyType,
    roomCount,
    budgetStr,
    summary,
  } = lead || {};

  // Status Colors
  let borderColor = 'border-l-[#3B82F6]'; // Soğuk
  let scoreColor = 'text-[#3B82F6]';
  if (label === 'Sıcak') {
    borderColor = 'border-l-[#EF4444]';
    scoreColor = 'text-[#EF4444]';
  } else if (label === 'Ilık') {
    borderColor = 'border-l-[#F5A623]';
    scoreColor = 'text-[#F5A623]';
  }

  // Formatting preferences (Kadıköy · Satılık · 3+1)
  const prefs = [];
  if (actionType && actionType !== 'unknown') {
    prefs.push(actionType === 'rent' ? 'Kiralık' : actionType === 'sale' ? 'Satılık' : actionType);
  }
  if (propertyType && propertyType !== 'unknown') {
    prefs.push(propertyType);
  }
  if (roomCount && roomCount !== 'Bilinmiyor') {
    prefs.push(roomCount);
  }
  if (budgetStr && budgetStr !== 'Bütçe Belirsiz') {
    prefs.push(`Bütçe: ${budgetStr}`);
  }

  const hasName = name && name !== 'Belirtilmedi' && name !== '[İsim Belirtilmedi]';
  const hasPhone = phone && phone !== 'Telefon Yok';
  const hasSummary = summary && summary !== 'Herhangi bir özet bilgisi girilmemiş.';

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col w-full bg-[#16181D] border border-[#2A2D35] border-l-[3px] ${borderColor} rounded-[8px] p-[14px] hover:bg-[#1E2028] hover:shadow-sm transition-all cursor-pointer font-sans`}
    >
      {/* Top Row: Name & Score */}
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-[13px] font-medium text-[#F1F2F4]">
          {hasName ? name : 'İsimsiz Lead'}
        </h3>
        {score !== undefined && score > 0 && (
          <span className={`font-mono text-[13px] ${scoreColor}`}>
            {score}/10
          </span>
        )}
      </div>

      {/* Phone */}
      {hasPhone && (
        <p className="text-[12px] text-[#7C8090] mb-2">{phone}</p>
      )}

      {/* Preferences Line */}
      {prefs.length > 0 && (
        <p className="text-[12px] text-[#7C8090] mb-2">
          {prefs.join(' · ')}
        </p>
      )}

      {/* Summary */}
      {hasSummary && (
        <p className="text-[12px] text-[#7C8090] italic line-clamp-2 mb-3">
          "{summary}"
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-auto pt-2">
        {hasPhone && (
          <a 
            href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0A1A0A] text-[#25D366] text-[11px] font-medium hover:bg-[#0f240f] transition-colors"
          >
            💬 WhatsApp
          </a>
        )}
        {hasPhone && (
          <a 
            href={`tel:${phone.replace(/[^0-9]/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#2A2D35] text-[#F1F2F4] text-[11px] font-medium hover:bg-[#2A2D35] transition-colors"
          >
            📞 Ara
          </a>
        )}
        <button 
          onClick={(e) => {
             e.stopPropagation();
             onClick && onClick();
          }}
          className="ml-auto flex items-center justify-center w-7 h-7 rounded-md bg-[#2A2D35] text-[#F1F2F4] hover:bg-[#F5A623] hover:text-[#0A0B0D] transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}
