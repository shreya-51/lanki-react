// src/components/Logo.tsx
import React from 'react';

interface LogoProps {
    logoUrl: string;
}

const Logo: React.FC<LogoProps> = ({ logoUrl }) => {
    return (
        <div
            className="widget-header"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '20px',
            }}
        >
            <img
                src={logoUrl}
                alt="Logo"
                style={{ width: '80px', height: '80px' }}
            />
        </div>
    );
};

export default Logo;
