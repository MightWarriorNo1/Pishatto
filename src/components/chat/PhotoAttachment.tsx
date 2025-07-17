import React, { useRef, useState } from 'react';

const PhotoAttachment: React.FC = () => {
    const [img, setImg] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    return (
        <div className="flex items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="text-white hover:text-red-700 transition-all duration-200">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 15l3-3 2 2 3-3" /><circle cx="8.5" cy="8.5" r="1.5" /></svg>
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setImg(ev.target?.result as string);
                    reader.readAsDataURL(file);
                }
            }} />
            {img && <img src={img} alt="preview" className="w-12 h-12 object-cover rounded border-2 border-secondary bg-primary" />}
        </div>
    );
};

export default PhotoAttachment; 