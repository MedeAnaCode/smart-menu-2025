import * as Dialog from '@radix-ui/react-dialog';
import type {ReactNode} from 'react';
type ModalProps = {open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode; busy?: boolean};
export function Modal({open, onOpenChange, title, children, busy = false}: ModalProps) {
    return <Dialog.Root open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}><Dialog.Portal>
        <Dialog.Overlay className="modal__overlay"><Dialog.Content className="modal__content" aria-describedby={undefined} onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }} onPointerDownOutside={(event) => { if (busy) event.preventDefault(); }}>
            <header className="modal__header"><Dialog.Title className="modal__title">{title}</Dialog.Title><Dialog.Close asChild><button type="button" aria-label="Закрыть" className="modal__button-close" disabled={busy}>×</button></Dialog.Close></header>
            {children}
        </Dialog.Content></Dialog.Overlay>
    </Dialog.Portal></Dialog.Root>;
}
