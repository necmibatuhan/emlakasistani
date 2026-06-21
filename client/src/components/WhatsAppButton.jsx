import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import clsx from 'clsx';
import { useAnalytics, EVENTS } from '../hooks/useAnalytics';

const WhatsAppButton = ({ customer, variant = 'icon-text', className = '' }) => {
  const { token, user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const sheetRef = useRef(null);
  const { track } = useAnalytics();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['whatsapp_templates'],
    queryFn: async () => {
      const res = await axios.get(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: isOpen
  });

  const formatPhoneForWa = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('90')) {
      cleaned = '90' + cleaned;
    }
    return cleaned;
  };

  const fillTemplateVariables = (text) => {
    if (!text) return '';
    let filled = text;
    filled = filled.replace(/{{musteri_adi}}/g, customer.name || 'Efendim');
    filled = filled.replace(/{{danisan_adi}}/g, user?.name || 'Danışman');
    
    // Extract property and price from properties JSON if available
    let portfoy = 'portföy';
    let fiyat = 'belirtilen';
    try {
      const props = typeof customer.properties === 'string' ? JSON.parse(customer.properties) : customer.properties;
      if (props?.region) portfoy = props.region + ' bölgesindeki portföy';
      if (props?.budget) fiyat = props.budget;
    } catch(e) {}
    
    filled = filled.replace(/{{portfoy_adresi}}/g, portfoy);
    filled = filled.replace(/{{fiyat}}/g, fiyat);
    
    return filled;
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setEditedText(fillTemplateVariables(template.template_text));
    setIsEditing(false);
  };

  const logContact = async (templateId) => {
    try {
      await axios.post(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/contacts/log`, {
        customer_id: customer.id,
        template_id: templateId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Failed to log contact', e);
    }
  };

  const sendWhatsApp = (text, templateId) => {
    const phone = formatPhoneForWa(customer.phone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    logContact(templateId);
    track(EVENTS.WHATSAPP_CLICKED, { customer_id: customer.id, template_id: templateId });
    setIsOpen(false);
    setSelectedTemplate(null);
  };

  // Close sheet on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Lock body scroll when sheet is open (mobile)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={clsx(
          "flex items-center justify-center gap-1.5 transition-colors font-medium border rounded-lg",
          variant === 'icon-text' ? "px-3 py-2 text-[13px]" : "w-9 h-9",
          "bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border-[#10B981]/20",
          className
        )}
      >
        <i className="fab fa-whatsapp text-[16px]"></i>
        {variant === 'icon-text' && 'WhatsApp'}
      </button>

      {/* Backdrop & Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            ref={sheetRef}
            className="w-full sm:max-w-md bg-[#1C1E24] border border-[#2A2D35] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#2A2D35] shrink-0">
              <h3 className="text-lg font-bold text-[#F1F2F4] flex items-center gap-2">
                <i className="fab fa-whatsapp text-[#10B981]"></i> 
                WhatsApp Mesajı Gönder
              </h3>
              <button 
                onClick={() => { setIsOpen(false); setSelectedTemplate(null); }}
                className="w-8 h-8 rounded-full bg-[#2A2D35] hover:bg-[#3F4350] flex items-center justify-center text-[#F1F2F4] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              {!selectedTemplate ? (
                <>
                  <div className="text-[13px] text-[#8E929C] mb-3">Kullanmak istediğiniz şablonu seçin:</div>
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-16 bg-[#2A2D35] rounded-xl"></div>
                      <div className="h-16 bg-[#2A2D35] rounded-xl"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {templates.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => handleTemplateSelect(t)}
                          className="bg-[#2A2D35]/50 border border-[#3F4350] hover:border-[#10B981]/50 rounded-xl p-3 cursor-pointer transition-colors group"
                        >
                          <div className="font-semibold text-[#F1F2F4] text-sm mb-1 group-hover:text-[#10B981] transition-colors">{t.name}</div>
                          <div className="text-[12px] text-[#8E929C] line-clamp-2">
                            {fillTemplateVariables(t.template_text)}
                          </div>
                        </div>
                      ))}
                      
                      {/* Blank Option */}
                      <div 
                        onClick={() => handleTemplateSelect({ id: null, name: 'Boş Mesaj', template_text: '' })}
                        className="bg-transparent border border-dashed border-[#3F4350] hover:border-[#F1F2F4] rounded-xl p-3 cursor-pointer transition-colors flex items-center justify-center gap-2 text-[#8E929C] hover:text-[#F1F2F4]"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                        <span className="text-[13px] font-medium">Kendim Yazacağım</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="flex items-center gap-2 mb-3 text-[13px] text-[#8E929C]">
                    <button onClick={() => setSelectedTemplate(null)} className="hover:text-[#F1F2F4] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span> Şablonlara Dön
                    </button>
                    <span>/</span>
                    <span className="text-[#F1F2F4] font-medium truncate">{selectedTemplate.name}</span>
                  </div>

                  <div className="flex-1 min-h-[150px]">
                    {isEditing ? (
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full h-full min-h-[150px] bg-[#2A2D35]/50 border border-[#3F4350] focus:border-[#3B82F6] outline-none rounded-xl p-3 text-[13px] text-[#F1F2F4] resize-none"
                        placeholder="Mesajınızı yazın..."
                        autoFocus
                      />
                    ) : (
                      <div className="w-full bg-[#2A2D35]/30 border border-[#3F4350] rounded-xl p-4 text-[13px] text-[#F1F2F4] whitespace-pre-wrap relative group">
                        {editedText || <span className="text-[#8E929C] italic">Boş mesaj</span>}
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-[#3F4350] hover:bg-[#4F5464] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          title="Düzenle"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedTemplate && (
              <div className="p-4 border-t border-[#2A2D35] shrink-0 flex gap-3">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-transparent border border-[#3F4350] hover:bg-[#2A2D35] text-[#F1F2F4] rounded-xl py-2.5 font-medium text-[14px] transition-colors"
                  >
                    Düzenle
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-transparent border border-[#3F4350] hover:bg-[#2A2D35] text-[#F1F2F4] rounded-xl py-2.5 font-medium text-[14px] transition-colors"
                  >
                    Bitti
                  </button>
                )}
                
                <button 
                  onClick={() => sendWhatsApp(editedText, selectedTemplate.id)}
                  disabled={!editedText.trim()}
                  className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-2.5 font-bold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20"
                >
                  <i className="fab fa-whatsapp"></i> Gönder
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;
