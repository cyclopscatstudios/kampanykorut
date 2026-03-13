import { useState } from "react";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { Text } from "../Text";
import { Icon } from "../Icon";

interface AdvisorModalProps {
  advice: string;
  open: boolean;
  onClose: () => void;
}

export function AdvisorModal({ advice, open, onClose }: AdvisorModalProps) {
    const [confirmationModal, setConfirmationModal] = useState(false);
  if (!open) {
    return null;
  }

  if (confirmationModal) {
    return <ConfirmationModal title="Are you sure turning off advisor feedback?" description="Lorem ipsum" onCancle={() => setConfirmationModal(false)} onConfirm={() => {}}/>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[550px] h-[450px] bg-[#161e30] rounded-xl border border-[#4462aa] flex flex-col justify-between">
        <div className="border-b border-[#4462aa] p-3">
            <div className="flex justify-center items-center">
                <Icon color="purple" name="info-circle-fill" className="mr-3"/>
                <Heading color="lightBlue" level={3}>
                    Advisor feedback
                </Heading>
            </div>
        </div>
        <div className="flex gap-5 justify-center">
            <div className="w-[100px] border border-[#4462aa] rounded-xl">
                <img src="https://i.pinimg.com/originals/d1/51/62/d15162b27cd9712860b90abe58cb60e7.jpg" className="rounded-xl" />
            </div>
            <div className="w-[100px] border border-[#4462aa] rounded-xl">
                <img src="https://i.pinimg.com/originals/d1/51/62/d15162b27cd9712860b90abe58cb60e7.jpg" className="rounded-xl" />
            </div>
        </div>
        <div className="m-3">
            <div className="bg-[#1d2840] p-3 rounded-xl">
            <Text>{advice}</Text>
            </div>
        </div>
        <div className="bg-[#1d2840] flex justify-between p-3 rounded-b-xl">
          <Button variant="transparent" onClick={() => setConfirmationModal(true)}>
            <Button.Icon name="eye-slash-fill" />
            <Button.Text>Don't give me advice</Button.Text>
          </Button>

          <Button className="w-[120px]" onClick={onClose}>
            <Button.Text>Ok</Button.Text>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmationModalProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancle: () => void;
}

export function ConfirmationModal({
  title,
  onCancle,
  onConfirm,
  description,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[400px] bg-[#131824] p-5 rounded-xl border-2 border-[#244185] flex flex-col justify-between">
        <div className="w-full text-center">
            <div className="flex justify-center items-center mb-3">
                <div className="w-[50px] h-[50px] bg-blue-900 rounded-full flex justify-center items-center">
                    <Icon name="exclamation-triangle-fill" color="lightBlue" size="large"/>
                </div>
            </div>
            <Heading color="lightBlue" level={3}>
                {title}
            </Heading>
        </div>
        <div className="my-5 mx-3">
          <Text>{description}</Text>
        </div>
        <div className="flex flex-col gap-2">
          <Button block className="w-[120px]" onClick={onConfirm}>
            <Button.Text>Confirm</Button.Text>
          </Button>
          <Button block onClick={onCancle} variant="secondary">
            <Button.Text>Cancel</Button.Text>
          </Button>
        </div>
      </div>
    </div>
  );
}
