export interface EnumInputSelectProps extends EnumSelectProps<string> {
  name: string;
}

export const EnumInputSelect: React.FunctionComponent<EnumInputSelectProps> = (
  props
) => (
  <>
    <input type="hidden" name={props.name} value={props.fieldValue} />
    <EnumSelect {...props} />
  </>
);

export interface EnumSelectProps<T> {
  className?: string;
  fieldValue: T;
  setFieldValue: (value: T) => void;
  enums: Array<[string, T]>;
  borderClassName: string;
  bigButtons?: boolean;
}

export const EnumSelect = <T extends any>({
  className,
  fieldValue,
  setFieldValue,
  enums,
  borderClassName,
  bigButtons,
}: EnumSelectProps<T>) => (
  <div className={`min-h-[3rem] w-full gap-2 ${className}`}>
    {enums.map(([displayValue, valueToSet], index) => (
      <button
        className={`first:rounded-l-2xl last:rounded-r-2xl shadow-md hover:shadow-lg focus-visible:outline focus-visible:outline-color-focused-element motion-safe:transition-all  ${
          bigButtons ? "text-xl" : ""
        } ${borderClassName || "border-color-neutral-soft-border"} ${
          valueToSet === fieldValue
            ? "bg-color-nearest-bg border-4 font-medium"
            : `bg-color-nearest-bg/50 border-2 hover:border-4 `
        }`}
        key={index}
        onClickCapture={(e) => {
          setFieldValue(valueToSet);
          e.preventDefault();
        }}
      >
        {displayValue}
      </button>
    ))}
  </div>
);
