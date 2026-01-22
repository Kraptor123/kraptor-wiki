import React, { useEffect } from 'react';

export default function Kreosus() {
    useEffect(() => {
        const scriptId = 'kreosus-iframe-api';

        if (document.getElementById(scriptId)) {
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://kreosus.com/public/kreosus/iframe/js/iframe-api.js';
        script.async = true;

        document.body.appendChild(script);

        return () => {
        };
    }, []);

    return (
        <div
            id="kreosus"
            data-id="5175"
            data-start-page="0"
            data-bg-color="ffffff"
            data-iframe-api="true"
            style={{ minHeight: '100px' }} // Yüklenirken alan kaplaması için
        ></div>
    );
}