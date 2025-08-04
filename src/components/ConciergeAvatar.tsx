import React from 'react';

interface ConciergeAvatarProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const ConciergeAvatar: React.FC<ConciergeAvatarProps> = ({ 
    size = 'md', 
    className = '' 
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-yellow-400 flex items-center justify-center relative border-2 border-yellow-300 ${className}`}>
            {/* Bird body */}
            <div className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} bg-yellow-300 rounded-full flex items-center justify-center relative`}>
                {/* Bird eye */}
                <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-black rounded-full`}></div>
                
                {/* Bird beak */}
                <div className={`${size === 'sm' ? 'w-1 h-0.5' : size === 'md' ? 'w-1.5 h-1' : 'w-2 h-1.5'} bg-orange-500 absolute ${size === 'sm' ? 'bottom-0.5' : size === 'md' ? 'bottom-1' : 'bottom-2'} ${size === 'sm' ? 'right-0.5' : size === 'md' ? 'right-1' : 'right-2'} rounded-sm`}></div>
            </div>
            
            {/* Bow tie */}
            <div className={`absolute ${size === 'sm' ? 'bottom-0 right-0' : size === 'md' ? 'bottom-0 right-0' : 'bottom-1 right-1'}`}>
                <div className={`${size === 'sm' ? 'w-2 h-1.5' : size === 'md' ? 'w-3 h-2' : 'w-4 h-3'} bg-red-500 rounded-full flex items-center justify-center`}>
                    <div className={`${size === 'sm' ? 'w-1 h-0.5' : size === 'md' ? 'w-1.5 h-1' : 'w-2 h-1.5'} bg-red-600 rounded-full`}></div>
                </div>
            </div>
            
            {/* Tuxedo collar */}
            <div className={`absolute ${size === 'sm' ? 'bottom-0' : size === 'md' ? 'bottom-0' : 'bottom-1'} left-1/2 transform -translate-x-1/2`}>
                <div className={`${size === 'sm' ? 'w-4 h-1' : size === 'md' ? 'w-6 h-1.5' : 'w-8 h-2'} bg-black rounded-full`}></div>
            </div>
        </div>
    );
};

export default ConciergeAvatar; 