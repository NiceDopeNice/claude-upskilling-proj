import ReactSelect, { Props as ReactSelectProps, GroupBase } from 'react-select'

export interface SelectOption {
  value: string
  label: string
}

type AppSelectProps<IsMulti extends boolean = false> = ReactSelectProps<SelectOption, IsMulti, GroupBase<SelectOption>>

export function AppSelect<IsMulti extends boolean = false>(props: AppSelectProps<IsMulti>) {
  return (
    <ReactSelect
      unstyled
      {...props}
      classNames={{
        control: ({ isFocused }) =>
          `flex h-9 w-full rounded-md border bg-background px-3 py-0 text-sm shadow-sm transition-colors cursor-pointer
          ${isFocused
            ? 'border-ring ring-1 ring-ring outline-none'
            : 'border-input hover:border-ring/60'}`,
        valueContainer: () => 'flex items-center gap-1 flex-1 min-w-0',
        singleValue:    () => 'text-foreground text-sm truncate',
        placeholder:    () => 'text-muted-foreground text-sm truncate',
        input:          () => 'text-foreground text-sm',
        indicatorsContainer: () => 'flex items-center',
        dropdownIndicator:   () => 'text-muted-foreground hover:text-foreground transition-colors pl-1',
        clearIndicator:      () => 'text-muted-foreground hover:text-destructive transition-colors pr-1',
        indicatorSeparator:  () => 'hidden',
        menu:           () => 'mt-1 rounded-md border border-border bg-popover shadow-md z-50 overflow-hidden',
        menuList:       () => 'py-1 max-h-60 overflow-y-auto',
        option:         ({ isFocused, isSelected }) =>
          `px-3 py-2 text-sm cursor-pointer transition-colors
          ${isSelected
            ? 'bg-primary text-primary-foreground'
            : isFocused
            ? 'bg-muted text-foreground'
            : 'text-foreground'}`,
        noOptionsMessage: () => 'px-3 py-4 text-sm text-muted-foreground text-center',
        ...props.classNames,
      }}
    />
  )
}
