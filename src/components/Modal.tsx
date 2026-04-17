import * as Dialog from "@radix-ui/react-dialog";
import React from "react";

type ModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    children: React.ReactNode;
};

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="modal__overlay"/>
                <Dialog.Content className="modal__content">
                    {title ? <Dialog.Title className="modal__title">{title}</Dialog.Title> : null}

                    {children}

                    <Dialog.Close asChild>
                        <button type="button" aria-label="Закрыть" className="modal__button-close">
                            ✕
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

//Не сбрасываются значения формы при закрытии
//Проблема в editingId,
