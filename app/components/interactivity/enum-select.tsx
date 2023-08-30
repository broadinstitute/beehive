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
  beforeBorderClassName: string;
  bigButtons?: boolean;
}

export const EnumSelect = <T extends any>({
  className,
  fieldValue,
  setFieldValue,
  enums,
  beforeBorderClassName,
  bigButtons,
}: EnumSelectProps<T>) => (
  <div className={`min-h-[3rem] w-full gap-2 ${className}`}>
    {enums.map(([displayValue, valueToSet], index) => (
      <div className="relative" key={index}>
        <button
          type="button"
          className={`p-2 w-full h-full shadow-md hover:shadow-lg flex flex-col items-center justify-center ${
            index === 0 ? "rounded-l-2xl before:rounded-l-2xl" : ""
          } ${
            index === enums.length - 1
              ? "rounded-r-2xl before:rounded-r-2xl"
              : ""
          } focus-visible:outline focus-visible:outline-color-focused-element ${
            bigButtons ? "text-xl" : ""
          }
    before:w-full before:h-full before:block before:absolute ${beforeBorderClassName} ${
            valueToSet === fieldValue
              ? "bg-color-nearest-bg before:border-4 font-medium"
              : "bg-color-nearest-bg/50 before:border-2 before:hover:border-4"
          } motion-safe:transition-all before:motion-safe:transition-all`}
          onClickCapture={(e) => {
            setFieldValue(valueToSet);
            e.preventDefault();
          }}
        >
          {displayValue}
        </button>
      </div>
    ))}
  </div>
);
