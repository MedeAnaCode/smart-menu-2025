import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
export type MenuAction = {label: string; onSelect: () => void; disabled?: boolean; danger?: boolean};
export default function ActionMenu({label, actions}: {label: string; actions: MenuAction[]}) {
    return <DropdownMenu.Root><DropdownMenu.Trigger asChild><button type="button" className="ui-icon-button" aria-label={label}>···</button></DropdownMenu.Trigger><DropdownMenu.Portal>
        <DropdownMenu.Content className="ui-dropdown" sideOffset={6} align="end" collisionPadding={12}>{actions.map(action => <DropdownMenu.Item key={action.label} className={`ui-dropdown__item${action.danger ? ' ui-dropdown__item--danger' : ''}`} disabled={action.disabled} onSelect={action.onSelect}>{action.label}</DropdownMenu.Item>)}</DropdownMenu.Content>
    </DropdownMenu.Portal></DropdownMenu.Root>;
}
