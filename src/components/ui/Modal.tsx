import { Button } from "./Button";
import { Heading } from "./Heading";
import { Icon } from "./Icon";
import { Text } from "./Text";

interface ModalProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Modal({ title, description, onCancel, onConfirm }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-[400px] bg-[#131824] p-5 rounded-xl border-2 border-[#244185] flex flex-col justify-between shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full text-center">
          <div className="flex justify-center items-center mb-3">
            <div className="w-[50px] h-[50px] bg-blue-900 rounded-full flex justify-center items-center">
              <Icon
                name="exclamation-triangle-fill"
                color="lightBlue"
                size="large"
              />
            </div>
          </div>

          <Heading color="lightBlue" level={3}>
            {title}
          </Heading>
        </div>

        {description && (
          <div className="my-5 mx-3">
            <Text className="text-sm text-gray-300 text-center">
              {description}
            </Text>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button onClick={onConfirm}>
            <Button.Text>Confirm</Button.Text>
          </Button>

          <Button onClick={onCancel} variant="secondary">
            <Button.Text>Cancel</Button.Text>
          </Button>
        </div>
      </div>
    </div>
  );
}
