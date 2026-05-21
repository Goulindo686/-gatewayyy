'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

export const pageview = (pixelId: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
    }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name: string, options = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', name, options);
    }
};

interface FacebookPixelProps {
    pixelId?: string;
    product?: any;
}

export default function FacebookPixel({ pixelId, product }: FacebookPixelProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loaded, setLoaded] = useState(false);
    const safePixelId = String(pixelId || '').replace(/\D/g, '');

    useEffect(() => {
        // Verifica se o pixel já foi carregado anteriormente
        if (typeof window !== 'undefined' && window.fbq) {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!loaded || !pixelId) return;
        pageview(pixelId);
    }, [pathname, searchParams, loaded, pixelId]);

    useEffect(() => {
        // Só dispara se tiver pixelId, estiver carregado e tiver produto
        if (!loaded || !product || !pixelId) return;
        
        // Pequeno delay para garantir que o script processou tudo
        const timer = setTimeout(() => {
            // Dispara InitiateCheckout assim que o pixel carrega e o produto existe
            event('InitiateCheckout', {
                content_name: product.name,
                content_ids: [product.id],
                content_type: 'product',
                value: (product.price / 100).toFixed(2),
                currency: 'BRL',
                num_items: 1
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [loaded, product, pixelId]);

    if (!safePixelId) return null;

    return (
        <div>
            <Script
                id="fb-pixel"
                strategy="afterInteractive"
                onLoad={() => setLoaded(true)}
                dangerouslySetInnerHTML={{
                    __html: `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${safePixelId}');
                    fbq('track', 'PageView');
                    `,
                }}
            />
        </div>
    );
}
