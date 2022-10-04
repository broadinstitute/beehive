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
  className?: string | undefined;
  fieldValue: T;
  setFieldValue: (value: T) => void;
  enums: Array<[string, T]>;
  borderClassName: string;
  bigButtons?: boolean | undefined;
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
        className={`first:rounded-l-2xl last:rounded-r-2xl shadow-md hover:shadow-lg motion-safe:transition-all duration-75 ${
          bigButtons ? "text-xl" : ""
        } ${borderClassName || "border-zinc-300"} ${
          valueToSet === fieldValue
            ? "bg-white border-4 font-medium"
            : `bg-white/50 border-2 hover:border-4 `
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
