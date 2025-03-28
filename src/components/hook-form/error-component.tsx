import AlertIcon from "../../assets/icons/alert-icon";

interface IErrorComponentType {
  message?: string;
  state?: "active" | "error" | "success" | "disabled";
}

const ErrorComponent = ({ message }: IErrorComponentType) => {
  return (
    <div className="flex items-center gap-1 text-red-600">
      <AlertIcon className="w-3.5 h-3.5" />
      <span className="text-xs">{message}</span>
    </div>
  );
};

export default ErrorComponent;
