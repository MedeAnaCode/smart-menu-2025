import * as Dialog from '@radix-ui/react-dialog';
import {type ReactNode, useEffect, useRef, useState} from 'react';
type SidebarProps = {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    mobileTitle?: string;
    triggerLabel?: string;
};
export default function Sidebar({children, open, onOpenChange, title='Под рукой', mobileTitle, triggerLabel='Открыть боковую панель'}: SidebarProps) {
    const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches);
    const trigger = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const query = window.matchMedia('(max-width: 760px)'), change = () => setMobile(query.matches);
        query.addEventListener('change', change); return () => query.removeEventListener('change', change);
    }, []);
    useEffect(() => {
        if (!mobile) return;
        let start: {x: number; y: number} | null = null;
        const down = (event: TouchEvent) => {
            const touch = event.touches[0];
            if (document.querySelector('.modal__content')) return;
            if (open || touch.clientX >= window.innerWidth - 38) start = {x: touch.clientX, y: touch.clientY};
        };
        const end = (event: TouchEvent) => {
            if (!start) return;
            const touch = event.changedTouches[0], dx = touch.clientX - start.x, dy = touch.clientY - start.y;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                if (open && dx > 0) onOpenChange(false);
                if (!open && dx < 0) onOpenChange(true);
            }
            start = null;
        };
        const cancel = () => { start = null; };
        document.addEventListener('touchstart', down, {passive:true}); document.addEventListener('touchend', end, {passive:true}); document.addEventListener('touchcancel', cancel);
        return () => { document.removeEventListener('touchstart', down); document.removeEventListener('touchend', end); document.removeEventListener('touchcancel', cancel); };
    }, [mobile, open, onOpenChange]);
    if (!mobile) return <aside className="sidebar"><h2 className="sidebar__title">{title}</h2>{children}</aside>;
    return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Trigger asChild><button ref={trigger} className="sidebar-bookmark" aria-label={triggerLabel}><span aria-hidden="true" /></button></Dialog.Trigger><Dialog.Portal>
        <Dialog.Overlay className="sidebar-overlay" /><Dialog.Content className="sidebar sidebar--drawer" aria-describedby={undefined} onCloseAutoFocus={(event) => { event.preventDefault(); trigger.current?.focus(); }}>
            <header className="sidebar__header"><Dialog.Title className="sidebar__title">{mobileTitle ?? title}</Dialog.Title><Dialog.Close asChild><button className="ui-icon-button" aria-label="Закрыть боковую панель">×</button></Dialog.Close></header>{children}
        </Dialog.Content>
    </Dialog.Portal></Dialog.Root>;
}
